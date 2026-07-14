import { useState, useEffect, useMemo } from 'react';

import { deleteCurrentUser, getAuthErrorMessage, signOutUser, subscribeToAuthState } from '../lib/auth';
import {
  addCategory,
  addItem,
  addTag,
  bumpTagUsage,
  clearAllUserData,
  deleteItemPermanently,
  getTags,
  moveCategoryItemsToTrash,
  removeTagFromActiveItems,
  renameCategory,
  renameTag,
  setItemDeleted,
  setItemDone,
  softDeleteCategory,
  softDeleteTag,
  subscribeCategories,
  subscribeItems,
  subscribeTags,
  updateItemFields,
  type ItemFields,
} from '../lib/firestore';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import type {
  Category,
  ConfirmDialogType,
  ContentForm,
  ContentItem,
  Language,
  SortOrder,
  Tab,
  Tag,
} from '../types';
import {
  translations,
  categoryTranslations,
  tagTranslations,
  contentTranslations,
} from '../data/translations';

// Finds an existing (non-deleted) category by name, or creates one in
// Firestore. Returns its id, or null if `name` is blank.
async function findOrCreateCategoryFs(uid: string, existing: Category[], name: string): Promise<string | null> {
  const trimmed = (name || '').trim().toLowerCase();
  if (!trimmed) return null;
  const match = existing.find((c) => {
    if (c.isDeleted) return false;
    if (c.name.toLowerCase() === trimmed) return true;
    const koName = categoryTranslations.ko[c.id]?.toLowerCase();
    const enName = categoryTranslations.en[c.id]?.toLowerCase();
    return koName === trimmed || enName === trimmed;
  });
  if (match) return match.id;
  return addCategory(uid, name.trim());
}

function matchExistingTag(existing: Tag[], name: string): Tag | undefined {
  const trimmed = (name || '').trim().toLowerCase();
  if (!trimmed) return undefined;
  return existing.find((t) => {
    if (t.isDeleted) return false;
    if (t.name.toLowerCase() === trimmed) return true;
    const koName = tagTranslations.ko[t.id]?.toLowerCase();
    const enName = tagTranslations.en[t.id]?.toLowerCase();
    return koName === trimmed || enName === trimmed;
  });
}

// Look up a tag by name without creating anything or writing to Firestore.
// Used while the user is still editing the form, before Save is pressed.
function findExistingTagId(existing: Tag[], name: string): string | null {
  return matchExistingTag(existing, name)?.id ?? null;
}

// Same idea for tags; also bumps recency usage on an existing match so the
// "recently used" tag ordering stays meaningful. Only call this at the point
// a tag is actually being committed (i.e. on Save) so browsing AI/manual tag
// suggestions never creates Firestore documents for tags the user discards.
async function findOrCreateTagFs(uid: string, existing: Tag[], name: string, usage: number): Promise<string | null> {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const match = matchExistingTag(existing, trimmed);
  if (match) {
    bumpTagUsage(uid, match.id, usage).catch(console.error);
    return match.id;
  }
  return addTag(uid, trimmed, usage);
}

// Tags the user has picked (via AI suggestion or manual "add new tag") that
// don't match an existing tag yet aren't written to Firestore immediately.
// They're kept in form state as a plain string prefixed with this marker,
// carrying the tag name, and only turned into a real Firestore tag (or
// resolved to a match) inside saveContent, once the user actually saves.
const PENDING_TAG_PREFIX = '__pending_tag__:';
const isPendingTagId = (id: string) => id.startsWith(PENDING_TAG_PREFIX);
const pendingTagId = (name: string) => `${PENDING_TAG_PREFIX}${name.trim()}`;
const pendingTagName = (id: string) => id.slice(PENDING_TAG_PREFIX.length);

const emptyForm: ContentForm = { title: '', url: '', summary: '', categoryId: null, tagIds: [], imagePublicId: null, imageUrl: null };

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function hasUnsavedFormInput(form: ContentForm): boolean {
  return Boolean(
    form.title.trim() || form.url.trim() || form.summary.trim() || form.categoryId || form.tagIds.length > 0
  );
}

export function useLaterIslandState() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchOrder, setAiSearchOrder] = useState<string[] | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLanguage, setSettingsLanguage] = useState<Language>('ko');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogType>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [form, setForm] = useState<ContentForm>(emptyForm);
  // A newly-picked (not yet uploaded) image file, plus a local object URL for
  // previewing it. `form.imageUrl` separately holds the already-persisted
  // Firestore image URL (set when editing, or cleared to null on removal).
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageObjectUrl, setSelectedImageObjectUrl] = useState<string | null>(null);
  const [aiLoadingStatus, setAiLoadingStatus] = useState<'idle' | 'fetching' | 'generating'>('idle');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // New Edit and Trash states
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [previousTab, setPreviousTab] = useState<Tab | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  // Current Firebase user's profile (works for both email/password signups
  // with a display name and Google sign-ins, which Firebase auto-fills).
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [uid, setUid] = useState<string | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setUserDisplayName(user?.displayName ?? '');
      setUserEmail(user?.email ?? '');
      setUid(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Reset AI search order when user starts typing a new query
    setAiSearchOrder(null);
  }, [searchQuery]);

  // Firestore-backed data: items (all statuses — trash is just isDeleted:true
  // on the same collection), categories, and tags. `rawCategories`/`rawTags`
  // include soft-deleted docs (kept only so old items can still resolve a
  // name); everything UI-facing filters those out below.
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawTags, setRawTags] = useState<Tag[]>([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  useEffect(() => {
    if (!uid) {
      setContents([]);
      setRawCategories([]);
      setRawTags([]);
      setItemsLoaded(false);
      setCategoriesLoaded(false);
      setTagsLoaded(false);
      return;
    }
    setItemsLoaded(false);
    setCategoriesLoaded(false);
    setTagsLoaded(false);
    const unsubItems = subscribeItems(uid, (items) => {
      setContents(items);
      setItemsLoaded(true);
    });
    const unsubCategories = subscribeCategories(uid, (cats) => {
      setRawCategories(cats);
      setCategoriesLoaded(true);
    });
    const unsubTags = subscribeTags(uid, (tgs) => {
      setRawTags(tgs);
      setTagsLoaded(true);
    });
    return () => {
      unsubItems();
      unsubCategories();
      unsubTags();
    };
  }, [uid]);

  const dataLoading = !uid || !itemsLoaded || !categoriesLoaded || !tagsLoaded;

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target, lang } = e.detail;
      if (lang) setSettingsLanguage(lang);
      if (['home', 'category', 'add', 'tags', 'done'].includes(target)) {
        setActiveTab(target as Tab);
        setShowSettings(false);
        setShowTrash(false);
      } else if (target === 'settings') {
        setShowSettings(true);
        setShowTrash(false);
      } else if (target === 'trash') {
        setShowTrash(true);
        setShowSettings(false);
      }
    };
    window.addEventListener('simulation-jump', handleJump);
    return () => window.removeEventListener('simulation-jump', handleJump);
  }, []);

  // Dev-only test tools (SimulationPanel). Write straight to Firestore so
  // they exercise the same path as the real UI.
  useEffect(() => {
    const handleClearAll = () => {
      if (uid) clearAllUserData(uid).catch(console.error);
    };
    window.addEventListener('simulation-clear-all', handleClearAll);
    return () => window.removeEventListener('simulation-clear-all', handleClearAll);
  }, [uid]);

  useEffect(() => {
    const handleGenerateDummy = async () => {
      if (!uid) return;
      const titles = ['React 19 Deep Dive', 'Weekend Vlog', 'Clean Code Practices', 'Best Design Systems', 'My Finance Journey'];
      const summaries = ['A great article on React', 'Relaxing weekend trip', 'How to write better code', 'Analysis of top design systems', 'Tips for saving money'];
      const catNames = ['Dev', 'Life', 'Dev', 'Design', 'Finance'];
      const tagNamess = [['Frontend', 'React'], ['Vlog'], ['CleanCode'], ['Design'], ['Finance', 'Tips']];

      for (let i = 0; i < 5; i++) {
        const categoryId = await findOrCreateCategoryFs(uid, rawCategories, catNames[i]);
        const tagIds: string[] = [];
        for (const tName of tagNamess[i]) {
          const tid = await findOrCreateTagFs(uid, rawTags, tName, Date.now() + i);
          if (tid) tagIds.push(tid);
        }
        await addItem(uid, {
          title: titles[i],
          url: 'https://example.com/dummy' + i,
          summary: summaries[i],
          categoryId,
          tagIds,
        });
      }
    };
    window.addEventListener('simulation-generate-dummy', handleGenerateDummy);
    return () => window.removeEventListener('simulation-generate-dummy', handleGenerateDummy);
  }, [uid, rawCategories, rawTags]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('simulation-sync', {
        detail: {
          screen: 'app',
          activeTab,
          showSettings,
          showTrash,
          settingsLanguage,
        },
      })
    );
  }, [activeTab, showSettings, showTrash, settingsLanguage]);

  // Leaving the (new-item, not editing) Add form with unfilled-but-unsaved
  // input needs a confirmation, since navigating away discards it. Editing
  // an existing item has its own explicit Cancel/Save flow and is untouched.
  const setTab = (tab: Tab) => {
    if (tab !== activeTab && activeTab === 'add' && !editingContentId && hasUnsavedFormInput(form)) {
      const t = translations[settingsLanguage];
      setConfirmDialog({
        title: t.confirmUnsavedTitle,
        actionLabel: t.confirmUnsavedAction,
        color: '#B15C4A',
        onConfirm: () => {
          setForm(emptyForm);
          setActiveTab(tab);
          setCategoryDropdownOpen(false);
          setTagDropdownOpen(false);
          setConfirmDialog(null);
        },
      });
      return;
    }
    setActiveTab(tab);
    setCategoryDropdownOpen(false);
    setTagDropdownOpen(false);
  };

  // Opens the inline search bar (see SearchBar.tsx). Closing is exclusively
  // the bar's own X button (closeSearch below), which already clears the
  // query — so every open is naturally blank, no toggle-close needed here.
  const openSearch = () => {
    setSearchOpen(true);
    setSortMenuOpen(false);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const toggleSortMenu = () => {
    setSortMenuOpen((v) => !v);
    setSearchOpen(false);
  };
  const closeSortMenu = () => setSortMenuOpen(false);
  const selectSort = (order: SortOrder) => {
    setSortOrder(order);
    setSortMenuOpen(false);
  };

  const goSettings = () => {
    setShowSettings(true);
    setSortMenuOpen(false);
  };
  const backFromSettings = () => setShowSettings(false);

  const openConfirm = (type: 'logout' | 'delete') => {
    if (type === 'logout') {
      setConfirmDialog({
        title: translations[settingsLanguage].confirmLogoutTitle,
        body: translations[settingsLanguage].confirmLogoutBody,
        actionLabel: translations[settingsLanguage].confirmLogoutAction,
        color: '#6E8C6A',
        onConfirm: () => {
          signOutUser();
          setConfirmDialog(null);
        },
      });
    } else {
      setConfirmDialog({
        title: translations[settingsLanguage].confirmDeleteTitle,
        body: translations[settingsLanguage].confirmDeleteBody,
        actionLabel: translations[settingsLanguage].confirmDeleteAction,
        color: '#B15C4A',
        onConfirm: async () => {
          setConfirmDialog((prev) => (prev ? { ...prev, confirming: true, error: undefined } : prev));
          try {
            await deleteCurrentUser();
            // Success: Firebase signs the user out as part of deletion, and the
            // app-level onAuthStateChanged listener (src/App.tsx) picks that up
            // and switches the screen to login automatically.
            setConfirmDialog(null);
          } catch (err: any) {
            if (err?.code === 'auth/requires-recent-login') {
              setConfirmDialog((prev) =>
                prev ? { ...prev, confirming: false, error: translations[settingsLanguage].reauthRequired } : prev
              );
              // Give the user a moment to read the guidance, then sign them out
              // so they land back on the login screen to re-authenticate.
              window.setTimeout(() => {
                signOutUser();
                setConfirmDialog(null);
              }, 1800);
            } else {
              setConfirmDialog((prev) =>
                prev ? { ...prev, confirming: false, error: getAuthErrorMessage(err, settingsLanguage) } : prev
              );
            }
          }
        },
      });
    }
  };
  const closeConfirm = () => setConfirmDialog(null);

  const toggleCategoryDropdown = () => setCategoryDropdownOpen((v) => !v);
  const toggleTagDropdown = () => setTagDropdownOpen((v) => !v);

  const selectCategory = (id: string) => {
    setForm((prev) => ({ ...prev, categoryId: id }));
    setCategoryDropdownOpen(false);
  };

  const addNewCategory = async () => {
    if (!uid) return;
    const id = await findOrCreateCategoryFs(uid, rawCategories, newCategoryInput);
    if (!id) return;
    setForm((prev) => ({ ...prev, categoryId: id }));
    setNewCategoryInput('');
    setCategoryDropdownOpen(false);
  };

  const toggleTagInForm = (id: string) => {
    // Pending (not-yet-created) tags have no Firestore doc to bump usage on.
    if (uid && !isPendingTagId(id)) bumpTagUsage(uid, id, Date.now()).catch(console.error);
    setForm((prev) => {
      const has = prev.tagIds.includes(id);
      const tagIds = has ? prev.tagIds.filter((x) => x !== id) : [...prev.tagIds, id];
      return { ...prev, tagIds };
    });
  };

  // Resolves a typed tag name to a real tag id if one already matches, or a
  // pending placeholder id otherwise. No Firestore write happens here — new
  // tags are only created in Firestore once the user actually saves the item.
  const addNewTag = () => {
    if (!uid) return;
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const id = findExistingTagId(rawTags, trimmed) ?? pendingTagId(trimmed);
    setForm((prev) => ({ ...prev, tagIds: prev.tagIds.includes(id) ? prev.tagIds : [...prev.tagIds, id] }));
    setNewTagInput('');
  };

  // Resets the form and any pending (unuploaded) image selection together,
  // so a stray preview never leaks into the next Add/Edit session.
  const resetFormAndImage = () => {
    setForm(emptyForm);
    setSelectedImageFile(null);
    setSelectedImageObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const selectImage = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert(settingsLanguage === 'ko' ? 'jpg, png, webp, gif 파일만 업로드할 수 있어요.' : 'Only jpg, png, webp, or gif files are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(settingsLanguage === 'ko' ? '이미지 용량은 5MB를 넘을 수 없어요.' : 'Image size must be 5MB or smaller.');
      return;
    }
    setSelectedImageFile(file);
    setSelectedImageObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  // Clears both a pending new selection and any already-persisted image —
  // saveContent treats form.imageUrl === null as "remove the image".
  const removeImage = () => {
    setSelectedImageFile(null);
    setSelectedImageObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setForm((prev) => ({ ...prev, imagePublicId: null, imageUrl: null }));
  };

  const generateAI = async () => {
    if (!uid) return;
    const { title, url, summary } = form;
    if (!title.trim() && !url.trim() && !summary.trim()) {
      alert(settingsLanguage === 'ko' ? '링크나 요약을 먼저 입력해주세요.' : 'Please enter a link or summary first.');
      return;
    }
    
    let textToAnalyze = summary;

    // 1. Fetch page content if URL is present
    if (url.trim()) {
      setAiLoadingStatus('fetching');
      try {
        const fetchRes = await fetch('/api/ai/fetch-page-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ link: url.trim() }),
        });
        if (fetchRes.ok) {
          const fetchData = await fetchRes.json();
          if (fetchData.extractedText) {
            textToAnalyze = summary ? `${summary}\n\n${fetchData.extractedText}` : fetchData.extractedText;
          }
        } else {
          // Fallback if blocked
          if (!summary.trim()) {
            alert(settingsLanguage === 'ko' ? '페이지 내용을 가져오지 못했어요. 직접 요약을 입력해주세요.' : 'Failed to fetch page. Please provide a manual summary.');
            setAiLoadingStatus('idle');
            return;
          }
        }
      } catch (err) {
        if (!summary.trim()) {
          alert(settingsLanguage === 'ko' ? '페이지 내용을 가져오지 못했어요. 직접 요약을 입력해주세요.' : 'Failed to fetch page. Please provide a manual summary.');
          setAiLoadingStatus('idle');
          return;
        }
      }
    }

    // 2. Generate Metadata
    setAiLoadingStatus('generating');
    try {
      const freshTags = await getTags(uid);
      const existingTags = freshTags.filter(t => !t.isDeleted).map(t => t.name);
      const res = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, link: url, summary: textToAnalyze, existingTags, outputLanguage: settingsLanguage }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const patch = { ...form };
      if (data.title) patch.title = data.title;
      if (data.summary) patch.summary = data.summary;
      
      // Falls back to "기타"/"Other" when the AI didn't return a category, so
      // an autofill always leaves the form with some category selected.
      const suggestedCategory = data.category || (settingsLanguage === 'ko' ? '기타' : 'Other');
      const catId = await findOrCreateCategoryFs(uid, rawCategories, suggestedCategory);
      if (catId) patch.categoryId = catId;
      if (data.tags && Array.isArray(data.tags)) {
        // Resolve suggestions to existing tag ids where possible; anything
        // without a match becomes a pending placeholder. Nothing is written
        // to Firestore here — tags the user removes via "x" before saving
        // must never end up as orphaned tag documents.
        const tagIds: string[] = [];
        for (const tn of data.tags) {
          const trimmed = (tn || '').trim();
          if (!trimmed) continue;
          const tid = findExistingTagId(freshTags, trimmed) ?? pendingTagId(trimmed);
          if (!tagIds.includes(tid)) tagIds.push(tid);
        }
        // 새 결과로 완전히 덮어씀 (기존 태그 초기화 후 새 태그만 할당)
        patch.tagIds = tagIds;
      }
      
      setForm(patch);
    } catch (e) {
      console.error(e);
      alert(settingsLanguage === 'ko' ? 'AI 자동생성에 실패했습니다.' : 'Failed to generate AI metadata.');
    } finally {
      setAiLoadingStatus('idle');
    }
  };

  const saveContent = async () => {
    if (!uid || !form.title.trim()) return;

    // Resolve any pending (not-yet-created) tags to real Firestore tag ids
    // now, at the moment of saving. This is the only point new tag documents
    // get created, so tags removed via "x" before Save never end up as
    // orphaned Firestore documents.
    const resolvedTagIds: string[] = [];
    const resolvedTagNames: string[] = [];
    for (const id of form.tagIds) {
      if (isPendingTagId(id)) {
        const name = pendingTagName(id);
        const realId = await findOrCreateTagFs(uid, rawTags, name, Date.now());
        if (realId && !resolvedTagIds.includes(realId)) {
          resolvedTagIds.push(realId);
          resolvedTagNames.push(name);
        }
      } else if (!resolvedTagIds.includes(id)) {
        resolvedTagIds.push(id);
        resolvedTagNames.push(tagMap[id] || '');
      }
    }

    // No "미분류" state: saving without a category picked silently falls
    // back to the user's "기타" category (created on demand if missing).
    const resolvedCategoryId =
      form.categoryId ?? (await findOrCreateCategoryFs(uid, rawCategories, settingsLanguage === 'ko' ? '기타' : 'Other'));

    const fields: ItemFields = {
      title: form.title.trim(),
      url: form.url.trim() || null,
      summary: form.summary.trim(),
      categoryId: resolvedCategoryId,
      tagIds: resolvedTagIds,
    };

    try {
      const tagNames = resolvedTagNames.filter(Boolean).join(' ');
      const textToEmbed = `${fields.title} ${fields.summary} ${tagNames}`.trim();
      if (textToEmbed) {
        const res = await fetch('/api/ai/generate-embedding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToEmbed })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.vector && data.model) {
            fields.embedding = { vector: data.vector, model: data.model };
          }
        } else {
          console.error("Embedding generation failed", await res.text());
        }
      }
    } catch (e) {
      console.error("Embedding generation error", e);
    }

    // Captured now so the background upload (below) still has the right
    // file/target even after the form is reset synchronously right after.
    const imageFileToUpload = selectedImageFile;
    const keptImagePublicId = form.imagePublicId;
    const keptImageUrl = form.imageUrl;

    if (editingContentId) {
      const itemId = editingContentId;
      (async () => {
        let imagePublicId = keptImagePublicId;
        let imageUrl = keptImageUrl;
        if (imageFileToUpload) {
          const uploaded = await uploadImageToCloudinary(imageFileToUpload);
          imagePublicId = uploaded.publicId;
          imageUrl = uploaded.url;
        }
        await updateItemFields(uid, itemId, { ...fields, imagePublicId, imageUrl });
      })().catch(console.error);
      setEditingContentId(null);
      resetFormAndImage();
      if (previousTab) {
        setActiveTab(previousTab);
      }
    } else {
      addItem(uid, fields)
        .then(async (itemId) => {
          if (imageFileToUpload) {
            const uploaded = await uploadImageToCloudinary(imageFileToUpload);
            await updateItemFields(uid, itemId, { imagePublicId: uploaded.publicId, imageUrl: uploaded.url });
          }
        })
        .catch(console.error);
      resetFormAndImage();
      setActiveTab('home');
    }
    setCategoryDropdownOpen(false);
    setTagDropdownOpen(false);
  };

  const startEditContent = (id: string) => {
    const item = contents.find((c) => c.id === id);
    if (!item) return;
    setPreviousTab(activeTab);
    setEditingContentId(id);
    setSelectedImageFile(null);
    setSelectedImageObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setForm({
      title: item.title,
      url: item.url || '',
      summary: item.summary,
      categoryId: item.categoryId,
      tagIds: item.tagIds,
      imagePublicId: item.imagePublicId ?? null,
      imageUrl: item.imageUrl ?? null,
    });
    setActiveTab('add');
  };

  const cancelEditContent = () => {
    setEditingContentId(null);
    resetFormAndImage();
    if (previousTab) {
      setActiveTab(previousTab);
    }
  };

  const markDone = (id: string) => {
    if (uid) setItemDone(uid, id, true).catch(console.error);
  };

  const selectCategoryFilter = (id: string) => setSelectedCategoryId(id);
  const backFromCategory = () => setSelectedCategoryId(null);

  const selectTagFilter = (id: string) => {
    if (uid) bumpTagUsage(uid, id, Date.now()).catch(console.error);
    setSelectedTagId(id);
  };
  const backFromTag = () => setSelectedTagId(null);

  const openConfirmDeleteCategory = (cat: Category) => {
    const t = translations[settingsLanguage];
    setConfirmDialog({
      title: t.confirmDeleteSingleTitle,
      body: t.confirmDeleteHint,
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid) {
          softDeleteCategory(uid, cat.id).catch(console.error);
          // Move the category's active items to trash; categoryId is kept so
          // trashed cards can still show their original category name.
          moveCategoryItemsToTrash(uid, cat.id).catch(console.error);
        }
        setConfirmDialog(null);
      },
    });
  };

  const openConfirmDeleteTag = (tag: Tag) => {
    const t = translations[settingsLanguage];
    setConfirmDialog({
      title: t.confirmDeleteSingleTitle,
      body: t.confirmDeleteHint,
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid) {
          softDeleteTag(uid, tag.id).catch(console.error);
          removeTagFromActiveItems(uid, tag.id).catch(console.error);
        }
        setConfirmDialog(null);
      },
    });
  };

  const openConfirmDeleteContent = (id: string) => {
    const t = translations[settingsLanguage];
    setConfirmDialog({
      title: t.confirmDeleteSingleTitle,
      body: t.confirmDeleteHint,
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid) setItemDeleted(uid, id, true).catch(console.error);
        setConfirmDialog(null);
      },
    });
  };

  // Used by the Trash screen's select mode. `onDone` lets the caller clear
  // its local selection state once the user actually confirms (not on
  // cancel). Handles both single- and multi-item selections.
  const openConfirmDeleteSelectedPermanently = (ids: string[], onDone?: () => void) => {
    if (ids.length === 0) return;
    const t = translations[settingsLanguage];
    setConfirmDialog({
      title: t.confirmDeleteSelectedTitle(ids.length),
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid) {
          ids.forEach((id) => {
            if (id.startsWith('content_')) {
              deleteItemPermanently(uid, id.replace('content_', '')).catch(console.error);
            }
          });
        }
        setConfirmDialog(null);
        onDone?.();
      },
    });
  };

  const restoreTrashItem = (id: string) => {
    if (!uid || !id.startsWith('content_')) return;
    const contentId = id.replace('content_', '');
    setItemDeleted(uid, contentId, false).catch(console.error);
  };

  const updateContentItem = (id: string, fields: Partial<ContentItem>) => {
    if (!uid) return;
    const { status, title, url, summary, categoryId, tagIds } = fields;
    if (status === 'done') setItemDone(uid, id, true).catch(console.error);
    if (status === 'pending') setItemDone(uid, id, false).catch(console.error);
    if (status === 'trash') setItemDeleted(uid, id, true).catch(console.error);

    const patch: Partial<ItemFields> = {};
    if (title !== undefined) patch.title = title;
    if (url !== undefined) patch.url = url;
    if (summary !== undefined) patch.summary = summary;
    if (categoryId !== undefined) patch.categoryId = categoryId;
    if (tagIds !== undefined) patch.tagIds = tagIds;
    if (Object.keys(patch).length > 0) updateItemFields(uid, id, patch).catch(console.error);
  };

  const updateContentTags = async (id: string, tagNames: string[]) => {
    if (!uid) return;
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const tid = await findOrCreateTagFs(uid, rawTags, name, Date.now());
      if (tid) tagIds.push(tid);
    }
    updateItemFields(uid, id, { tagIds }).catch(console.error);
  };

  const updateCategoryName = (id: string, newName: string) => {
    if (uid) renameCategory(uid, id, newName).catch(console.error);
  };

  const updateTagName = (id: string, newName: string) => {
    if (uid) renameTag(uid, id, newName).catch(console.error);
  };

  // --- derived values (mirrors renderVals in the original prototype) ---

  // Active (non-deleted) categories/tags — everything selectable in the UI.
  const activeCategories = rawCategories.filter((c) => !c.isDeleted);
  const activeTags = rawTags.filter((t) => !t.isDeleted);

  const translatedCategories = activeCategories.map((cat) => ({
    ...cat,
    name: categoryTranslations[settingsLanguage][cat.id] || cat.name,
  }));

  const translatedTags = activeTags.map((tag) => ({
    ...tag,
    name: tagTranslations[settingsLanguage][tag.id] || tag.name,
  }));

  const translatedContents = contents.map((c) => {
    const translation = contentTranslations[settingsLanguage][c.id];
    return {
      ...c,
      title: translation ? translation.title : c.title,
      summary: translation ? translation.summary : c.summary,
    };
  });

  // Includes soft-deleted categories so cards/trash can still show the
  // original category name after it's been "permanently" removed from the UI.
  const catMapAll: Record<string, string> = {};
  rawCategories.forEach((c) => {
    catMapAll[c.id] = categoryTranslations[settingsLanguage][c.id] || c.name;
  });

  const catMap: Record<string, string> = {};
  translatedCategories.forEach((c) => {
    catMap[c.id] = c.name;
  });
  const tagMap: Record<string, string> = {};
  translatedTags.forEach((t) => {
    tagMap[t.id] = t.name;
  });

  const performAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    setAiSearchOrder(null);
    try {
      const res = await fetch('/api/ai/generate-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: searchQuery })
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      const queryVector = data.vector;
      if (!queryVector) throw new Error('No vector returned');

      const dotProduct = (a: number[], b: number[]) => a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magnitude = (v: number[]) => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
      const qMag = magnitude(queryVector);

      const scored = translatedContents
        .filter(c => c.embedding?.vector)
        .map(c => {
          const v = c.embedding!.vector;
          const sim = dotProduct(queryVector, v) / (qMag * magnitude(v));
          return { id: c.id, sim };
        });
      
      scored.sort((a, b) => b.sim - a.sim);
      setAiSearchOrder(scored.map(s => s.id));
    } catch(e) {
      console.error('AI search failed', e);
      alert(settingsLanguage === 'ko' ? 'AI 검색에 실패했습니다.' : 'AI search failed.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const searchedContents = useMemo(() => {
    if (aiSearchOrder) {
      const map = new Map();
      translatedContents.forEach(c => map.set(c.id, c));
      return aiSearchOrder.map(id => map.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
    } else {
      const filtered = translatedContents.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const tags = (c.tagIds || []).map(id => tagMap[id] || '').join(' ').toLowerCase();
        return c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q) || tags.includes(q);
      });
      const sorted = filtered.sort((a, b) => {
        if (sortOrder === 'alpha') {
          return a.title.localeCompare(b.title);
        } else if (sortOrder === 'oldest') {
          return (a.createdAt || 0) - (b.createdAt || 0);
        } else {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
      });
      return sorted;
    }
  }, [translatedContents, searchQuery, aiSearchOrder, tagMap, sortOrder]);

  // No item should ever lack a resolvable category post-migration (saving
  // always assigns one), but this stays as a defensive fallback for any
  // categoryId that doesn't resolve to a real doc.
  const enrichmentCategoryNameFallback = settingsLanguage === 'ko' ? '기타' : 'Other';
  const enrich = (c: ContentItem) => ({
    ...c,
    categoryName: catMapAll[c.categoryId ?? ''] || enrichmentCategoryNameFallback,
    tagNames: (c.tagIds || []).map((id: string) => tagMap[id]).filter(Boolean),
    onComplete: () => markDone(c.id),
    onUncomplete: () => updateContentItem(c.id, { status: 'pending' }),
  });

  const pendingContents = searchedContents.filter((c) => c.status === 'pending').map(enrich);
  const doneContents = searchedContents.filter((c) => c.status === 'done').map(enrich);

  const categoryRows = translatedCategories
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'alpha') return a.name.localeCompare(b.name);
      if (sortOrder === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .map((cat) => {
      const count = searchedContents.filter((c) => c.categoryId === cat.id && c.status === 'pending').length;
      return {
        id: cat.id,
        name: cat.name,
        count,
        onSelect: () => selectCategoryFilter(cat.id),
      };
    });
  const selectedCategory = translatedCategories.find((c) => c.id === selectedCategoryId) || null;
  const categoryFilteredContents = selectedCategoryId
    ? searchedContents.filter((c) => c.categoryId === selectedCategoryId && c.status === 'pending').map(enrich)
    : [];

  const tagRows = translatedTags
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'alpha') return a.name.localeCompare(b.name);
      if (sortOrder === 'oldest') return (a.createdAt || 0) - (b.createdAt || 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .map((t) => {
      const count = searchedContents.filter((c) => (c.tagIds || []).includes(t.id) && c.status === 'pending').length;
      return {
        id: t.id,
        name: t.name,
        count,
        onSelect: () => selectTagFilter(t.id),
      };
    });
  const selectedTag = translatedTags.find((t) => t.id === selectedTagId) || null;
  const tagFilteredContents = selectedTagId
    ? searchedContents.filter((c) => (c.tagIds || []).includes(selectedTagId) && c.status === 'pending').map(enrich)
    : [];

  const formCategoryRows = translatedCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    bg: form.categoryId === cat.id ? '#6E8C6A' : '#F7F9F2',
    fg: form.categoryId === cat.id ? '#fff' : '#3F5240',
    onSelect: () => selectCategory(cat.id),
  }));
  const selectedCategoryLabel = form.categoryId
    ? catMap[form.categoryId] || (settingsLanguage === 'ko' ? '선택' : 'Selected')
    : (translations[settingsLanguage].formCategoryPlaceholder);

  const formTagRows = translatedTags.map((t) => ({
    id: t.id,
    name: t.name,
    mark: form.tagIds.includes(t.id) ? '☑' : '☐',
    onToggle: () => toggleTagInForm(t.id),
  }));
  const selectedFormTagChips = form.tagIds.map((id) => ({
    id,
    name: isPendingTagId(id) ? pendingTagName(id) : (tagMap[id] || ''),
    onRemove: () => toggleTagInForm(id),
  }));
  // What the Add/Edit form should actually show as the image thumbnail: a
  // freshly-picked file's local preview takes priority, else the existing
  // persisted image (if editing and not removed).
  const imagePreviewUrl = selectedImageObjectUrl ?? form.imageUrl;

  const sortLabels = {
    latest: translations[settingsLanguage].sortLatest,
    oldest: translations[settingsLanguage].sortOldest,
    alpha: translations[settingsLanguage].sortAlpha,
  };

  const activeConfirm = confirmDialog;

  const trashItems = searchedContents
    .filter((c) => c.status === 'trash')
    .map((c) => {
      const categoryName = catMapAll[c.categoryId ?? ''] || enrichmentCategoryNameFallback;
      const tagNames = (c.tagIds || []).map((id: string) => tagMap[id]).filter(Boolean);
      return {
        id: 'content_' + c.id,
        type: 'content' as const,
        title: c.title,
        summary: c.summary,
        categoryName,
        tagNames,
        imagePublicId: c.imagePublicId ?? null,
        imageUrl: c.imageUrl ?? null,
      };
    });

  return {
    // shell / header
    searchOpen,
    searchQuery,
    setSearchQuery,
    performAiSearch,
    isAiSearching,
    openSearch,
    closeSearch,
    sortMenuOpen,
    toggleSortMenu,
    closeSortMenu,
    sortOrderLabel: sortLabels[sortOrder],
    sortOrder,
    selectSort,
    goSettings,

    showSettings,
    settingsLanguage,
    setSettingsLanguage,
    backFromSettings,
    openConfirm,
    userDisplayName,
    userEmail,

    confirmDialog,
    activeConfirm,
    closeConfirm,

    activeTab,
    setTab,

    dataLoading,

    // tab data
    pendingContents,
    isHomeEmpty: pendingContents.length === 0,
    doneContents,
    isDoneEmpty: doneContents.length === 0,

    categoryRows,
    selectedCategory,
    categoryFilteredContents,
    isCategoryFilteredEmpty: categoryFilteredContents.length === 0,
    backFromCategory,

    tagRows,
    selectedTag,
    tagFilteredContents,
    isTagFilteredEmpty: tagFilteredContents.length === 0,
    backFromTag,

    // add form
    form,
    setFormTitle: (title: string) => setForm((prev) => ({ ...prev, title })),
    setFormUrl: (url: string) => setForm((prev) => ({ ...prev, url })),
    setFormSummary: (summary: string) => setForm((prev) => ({ ...prev, summary })),

    categoryDropdownOpen,
    toggleCategoryDropdown,
    selectedCategoryLabel,
    formCategoryRows,
    newCategoryInput,
    setNewCategoryInput,
    addNewCategory,

    tagDropdownOpen,
    toggleTagDropdown,
    selectedFormTagChips,
    formTagRows,
    newTagInput,
    setNewTagInput,
    addNewTag,

    imagePreviewUrl,
    selectImage,
    removeImage,

    generateAI,
    aiLoadingStatus,
    saveContent,

    // edit & trash
    editingContentId,
    startEditContent,
    cancelEditContent,
    showTrash,
    setShowTrash,
    trashItems,
    openConfirmDeleteCategory,
    openConfirmDeleteTag,
    openConfirmDeleteContent,
    openConfirmDeleteSelectedPermanently,
    restoreTrashItem,
    updateContentItem,
    updateContentTags,
    updateCategoryName,
    updateTagName,

    // PWA
    deferredPrompt,
    setDeferredPrompt,
    isIOS,
  };
}

export type LaterIslandState = ReturnType<typeof useLaterIslandState>;
