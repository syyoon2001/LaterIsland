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

// Same idea for tags; also bumps recency usage on an existing match so the
// "recently used" tag ordering stays meaningful.
async function findOrCreateTagFs(uid: string, existing: Tag[], name: string, usage: number): Promise<string | null> {
  const trimmed = (name || '').trim().toLowerCase();
  if (!trimmed) return null;
  const match = existing.find((t) => {
    if (t.isDeleted) return false;
    if (t.name.toLowerCase() === trimmed) return true;
    const koName = tagTranslations.ko[t.id]?.toLowerCase();
    const enName = tagTranslations.en[t.id]?.toLowerCase();
    return koName === trimmed || enName === trimmed;
  });
  if (match) {
    bumpTagUsage(uid, match.id, usage).catch(console.error);
    return match.id;
  }
  return addTag(uid, name.trim(), usage);
}

const emptyForm: ContentForm = { title: '', url: '', summary: '', categoryId: null, tagIds: [] };

export function useLaterIslandState() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchOrder, setAiSearchOrder] = useState<string[] | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortSubmenuOpen, setSortSubmenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLanguage, setSettingsLanguage] = useState<Language>('ko');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogType>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [form, setForm] = useState<ContentForm>(emptyForm);
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

  const setTab = (tab: Tab) => {
    setActiveTab(tab);
    setCategoryDropdownOpen(false);
    setTagDropdownOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((v) => !v);
    setMenuOpen(false);
    setSortSubmenuOpen(false);
  };
  const closeSearch = () => setSearchOpen(false);

  const toggleMenu = () => {
    setMenuOpen((v) => !v);
    setSearchOpen(false);
    setSortSubmenuOpen(false);
  };
  const closeMenu = () => {
    setMenuOpen(false);
    setSortSubmenuOpen(false);
  };
  const toggleSortSubmenu = () => setSortSubmenuOpen((v) => !v);
  const selectSort = (order: SortOrder) => {
    setSortOrder(order);
    setSortSubmenuOpen(false);
    setMenuOpen(false);
  };

  const goSettings = () => {
    setShowSettings(true);
    setMenuOpen(false);
    setSortSubmenuOpen(false);
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
    if (uid) bumpTagUsage(uid, id, Date.now()).catch(console.error);
    setForm((prev) => {
      const has = prev.tagIds.includes(id);
      const tagIds = has ? prev.tagIds.filter((x) => x !== id) : [...prev.tagIds, id];
      return { ...prev, tagIds };
    });
  };

  const addNewTag = async () => {
    if (!uid) return;
    const id = await findOrCreateTagFs(uid, rawTags, newTagInput, Date.now());
    if (!id) return;
    setForm((prev) => ({ ...prev, tagIds: prev.tagIds.includes(id) ? prev.tagIds : [...prev.tagIds, id] }));
    setNewTagInput('');
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
        body: JSON.stringify({ title, link: url, summary: textToAnalyze, existingTags }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      const patch = { ...form };
      if (data.title) patch.title = data.title;
      if (data.summary) patch.summary = data.summary;
      
      if (data.category) {
        const catId = await findOrCreateCategoryFs(uid, rawCategories, data.category);
        if (catId) patch.categoryId = catId;
      }
      if (data.tags && Array.isArray(data.tags)) {
        const tagIds = [];
        for (const tn of data.tags) {
          const tid = await findOrCreateTagFs(uid, rawTags, tn, Date.now());
          if (tid) tagIds.push(tid);
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
    const fields: ItemFields = {
      title: form.title.trim(),
      url: form.url.trim() || null,
      summary: form.summary.trim(),
      categoryId: form.categoryId,
      tagIds: form.tagIds,
    };
    
    try {
      const tagNames = fields.tagIds.map(id => tagMap[id] || '').filter(Boolean).join(' ');
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

    if (editingContentId) {
      updateItemFields(uid, editingContentId, fields).catch(console.error);
      setEditingContentId(null);
      setForm(emptyForm);
      if (previousTab) {
        setActiveTab(previousTab);
      }
    } else {
      addItem(uid, fields).catch(console.error);
      setForm(emptyForm);
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
    setForm({
      title: item.title,
      url: item.url || '',
      summary: item.summary,
      categoryId: item.categoryId,
      tagIds: item.tagIds,
    });
    setActiveTab('add');
  };

  const cancelEditContent = () => {
    setEditingContentId(null);
    setForm(emptyForm);
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
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid) setItemDeleted(uid, id, true).catch(console.error);
        setConfirmDialog(null);
      },
    });
  };

  const openConfirmDeletePermanently = (id: string) => {
    const t = translations[settingsLanguage];
    setConfirmDialog({
      title: t.confirmDeletePermanentlyTitle,
      actionLabel: t.delete,
      color: '#B15C4A',
      onConfirm: () => {
        if (uid && id.startsWith('content_')) {
          const contentId = id.replace('content_', '');
          deleteItemPermanently(uid, contentId).catch(console.error);
        }
        setConfirmDialog(null);
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
      return translatedContents.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const tags = (c.tagIds || []).map(id => tagMap[id] || '').join(' ').toLowerCase();
        return c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q) || tags.includes(q);
      });
    }
  }, [translatedContents, searchQuery, aiSearchOrder, tagMap]);

  const enrichmentCategoryNameFallback = settingsLanguage === 'ko' ? '미분류' : 'Uncategorized';
  const enrich = (c: ContentItem) => ({
    ...c,
    categoryName: catMapAll[c.categoryId ?? ''] || enrichmentCategoryNameFallback,
    tagNames: (c.tagIds || []).map((id: string) => tagMap[id]).filter(Boolean),
    onComplete: () => markDone(c.id),
    onUncomplete: () => updateContentItem(c.id, { status: 'pending' }),
  });

  const pendingContents = searchedContents.filter((c) => c.status === 'pending').map(enrich);
  const doneContents = searchedContents.filter((c) => c.status === 'done').map(enrich);

  const categoryRows = translatedCategories.map((cat) => {
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
    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
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
    name: tagMap[id] || '',
    onRemove: () => toggleTagInForm(id),
  }));

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
      };
    });

  return {
    // shell / header
    searchOpen,
    searchQuery,
    setSearchQuery,
    performAiSearch,
    isAiSearching,
    toggleSearch,
    closeSearch,
    menuOpen,
    toggleMenu,
    closeMenu,
    sortSubmenuOpen,
    toggleSortSubmenu,
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
    openConfirmDeletePermanently,
    restoreTrashItem,
    updateContentItem,
    updateContentTags,
    updateCategoryName,
    updateTagName,
  };
}

export type LaterIslandState = ReturnType<typeof useLaterIslandState>;
