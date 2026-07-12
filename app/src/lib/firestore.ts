import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category, ContentItem, Tag } from '../types';

// --- Firestore <-> app-model converters -------------------------------
//
// The app's UI types (ContentItem/Category/Tag) predate this Firestore
// integration and use different field names (e.g. `url` + `status`) than
// the Firestore schema asked for (`link` + `isDone`/`isDeleted`). Rather
// than touch every screen that consumes those types, we convert at the
// edge here and keep the rest of the app unchanged.

function itemFromDoc(snap: QueryDocumentSnapshot<DocumentData>): ContentItem {
  const data = snap.data();
  const status: ContentItem['status'] = data.isDeleted ? 'trash' : data.isDone ? 'done' : 'pending';
  return {
    id: snap.id,
    sourceType: data.link ? 'link' : 'manual',
    title: data.title ?? '',
    url: data.link ?? null,
    summary: data.summary ?? '',
    categoryId: data.categoryId ?? null,
    tagIds: data.tagIds ?? [],
    status,
    aiGenerated: data.aiGenerated,
    embedding: data.embedding,
  };
}

function categoryFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Category {
  const data = snap.data();
  return { id: snap.id, name: data.name ?? '', createdBy: 'user', isDeleted: !!data.isDeleted };
}

function tagFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Tag {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name ?? '',
    createdBy: 'user',
    lastUsedAt: data.lastUsedAt ?? 0,
    isDeleted: !!data.isDeleted,
  };
}

// --- collection refs -----------------------------------------------------

const itemsRef = (uid: string) => collection(db, 'users', uid, 'items');
const categoriesRef = (uid: string) => collection(db, 'users', uid, 'categories');
const tagsRef = (uid: string) => collection(db, 'users', uid, 'tags');

// --- subscriptions (real-time) -------------------------------------------

export function subscribeItems(uid: string, onData: (items: ContentItem[]) => void) {
  return onSnapshot(itemsRef(uid), (snap) => onData(snap.docs.map(itemFromDoc)));
}

export function subscribeCategories(uid: string, onData: (categories: Category[]) => void) {
  return onSnapshot(categoriesRef(uid), (snap) => onData(snap.docs.map(categoryFromDoc)));
}

export function subscribeTags(uid: string, onData: (tags: Tag[]) => void) {
  return onSnapshot(tagsRef(uid), (snap) => onData(snap.docs.map(tagFromDoc)));
}

// --- items -----------------------------------------------------------------

export interface ItemFields {
  title: string;
  url: string | null;
  summary: string;
  categoryId: string | null;
  tagIds: string[];
  aiGenerated?: boolean;
  embedding?: {
    vector: number[];
    model: string;
  };
}

export async function addItem(uid: string, fields: ItemFields): Promise<string> {
  const ref = await addDoc(itemsRef(uid), {
    title: fields.title,
    link: fields.url,
    summary: fields.summary,
    categoryId: fields.categoryId,
    tagIds: fields.tagIds,
    isDone: false,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(fields.aiGenerated !== undefined && { aiGenerated: fields.aiGenerated }),
    ...(fields.embedding !== undefined && { embedding: fields.embedding }),
  });
  return ref.id;
}

export function updateItemFields(uid: string, itemId: string, fields: Partial<ItemFields>) {
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (fields.title !== undefined) patch.title = fields.title;
  if (fields.url !== undefined) patch.link = fields.url;
  if (fields.summary !== undefined) patch.summary = fields.summary;
  if (fields.categoryId !== undefined) patch.categoryId = fields.categoryId;
  if (fields.tagIds !== undefined) patch.tagIds = fields.tagIds;
  if (fields.aiGenerated !== undefined) patch.aiGenerated = fields.aiGenerated;
  if (fields.embedding !== undefined) patch.embedding = fields.embedding;
  return updateDoc(doc(itemsRef(uid), itemId), patch);
}

export function setItemDone(uid: string, itemId: string, isDone: boolean) {
  return updateDoc(doc(itemsRef(uid), itemId), { isDone, updatedAt: serverTimestamp() });
}

export function setItemDeleted(uid: string, itemId: string, isDeleted: boolean) {
  return updateDoc(doc(itemsRef(uid), itemId), { isDeleted, updatedAt: serverTimestamp() });
}

export function deleteItemPermanently(uid: string, itemId: string) {
  return deleteDoc(doc(itemsRef(uid), itemId));
}

// Moves every active (non-deleted) item in a category to trash, keeping
// categoryId intact so trashed cards can still show their original category.
export async function moveCategoryItemsToTrash(uid: string, categoryId: string) {
  const q = query(itemsRef(uid), where('categoryId', '==', categoryId), where('isDeleted', '==', false));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { isDeleted: true, updatedAt: serverTimestamp() }));
  await batch.commit();
}

// Strips a deleted tag's id out of every active item that referenced it.
export async function removeTagFromActiveItems(uid: string, tagId: string) {
  const q = query(itemsRef(uid), where('tagIds', 'array-contains', tagId), where('isDeleted', '==', false));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { tagIds: arrayRemove(tagId), updatedAt: serverTimestamp() }));
  await batch.commit();
}

// --- categories --------------------------------------------------------

export async function addCategory(uid: string, name: string): Promise<string> {
  const ref = await addDoc(categoriesRef(uid), { name, isDeleted: false, createdAt: serverTimestamp() });
  return ref.id;
}

export function renameCategory(uid: string, categoryId: string, name: string) {
  return updateDoc(doc(categoriesRef(uid), categoryId), { name });
}

// "Delete" is immediate and permanent from the user's perspective (no
// category trash/undo UI exists) — the doc is only soft-deleted internally
// so items that reference categoryId can still resolve a name.
export function softDeleteCategory(uid: string, categoryId: string) {
  return updateDoc(doc(categoriesRef(uid), categoryId), { isDeleted: true });
}

// --- tags ----------------------------------------------------------------

export async function addTag(uid: string, name: string, lastUsedAt: number): Promise<string> {
  const ref = await addDoc(tagsRef(uid), { name, lastUsedAt, isDeleted: false, createdAt: serverTimestamp() });
  return ref.id;
}

export function renameTag(uid: string, tagId: string, name: string) {
  return updateDoc(doc(tagsRef(uid), tagId), { name });
}

export function bumpTagUsage(uid: string, tagId: string, lastUsedAt: number) {
  return updateDoc(doc(tagsRef(uid), tagId), { lastUsedAt });
}

export function softDeleteTag(uid: string, tagId: string) {
  return updateDoc(doc(tagsRef(uid), tagId), { isDeleted: true });
}

export async function getTags(uid: string): Promise<Tag[]> {
  const snap = await getDocs(tagsRef(uid));
  return snap.docs.map(tagFromDoc);
}

// --- dev/test tools (SimulationPanel, dev-only) ---------------------------

// Hard-deletes every item/category/tag document for this user.
export async function clearAllUserData(uid: string) {
  const [itemsSnap, categoriesSnap, tagsSnap] = await Promise.all([
    getDocs(itemsRef(uid)),
    getDocs(categoriesRef(uid)),
    getDocs(tagsRef(uid)),
  ]);
  const batch = writeBatch(db);
  itemsSnap.docs.forEach((d) => batch.delete(d.ref));
  categoriesSnap.docs.forEach((d) => batch.delete(d.ref));
  tagsSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
