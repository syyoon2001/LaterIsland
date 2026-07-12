import { useState, useEffect } from 'react';
import { seedCategories, seedContents, seedTags } from '../data/seed';
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
  aiPoolsEn,
} from '../data/translations';

function findOrCreateCategory(categoriesArr: Category[], name: string) {
  const trimmed = (name || '').trim().toLowerCase();
  if (!trimmed) return { categories: categoriesArr, id: null as string | null };
  const existing = categoriesArr.find((c) => {
    if (c.name.toLowerCase() === trimmed) return true;
    const koName = categoryTranslations.ko[c.id]?.toLowerCase();
    const enName = categoryTranslations.en[c.id]?.toLowerCase();
    return koName === trimmed || enName === trimmed;
  });
  if (existing) return { categories: categoriesArr, id: existing.id };
  const newCat: Category = { id: 'c_' + Date.now() + Math.random().toString(36).slice(2, 6), name: name.trim(), createdBy: 'user' };
  return { categories: [...categoriesArr, newCat], id: newCat.id };
}

function findOrCreateTag(tagsArr: Tag[], name: string, usage: number) {
  const trimmed = (name || '').trim().toLowerCase();
  if (!trimmed) return { tags: tagsArr, id: null as string | null };
  const existing = tagsArr.find((t) => {
    if (t.name.toLowerCase() === trimmed) return true;
    const koName = tagTranslations.ko[t.id]?.toLowerCase();
    const enName = tagTranslations.en[t.id]?.toLowerCase();
    return koName === trimmed || enName === trimmed;
  });
  if (existing) {
    const updated = tagsArr.map((t) => (t.id === existing.id ? { ...t, lastUsedAt: usage } : t));
    return { tags: updated, id: existing.id };
  }
  const newTag: Tag = { id: 't_' + Date.now() + Math.random().toString(36).slice(2, 6), name: name.trim(), createdBy: 'user', lastUsedAt: usage };
  return { tags: [...tagsArr, newTag], id: newTag.id };
}

const emptyForm: ContentForm = { title: '', url: '', summary: '', categoryId: null, tagIds: [] };

const aiPools = [
  { category: '글', tags: ['자기계발', '힐링'], tail: '핵심 내용을 정리한 아티클입니다.' },
  { category: '영상', tags: ['재테크'], tail: '주요 포인트를 짚어주는 영상입니다.' },
  { category: '책', tags: ['자기계발'], tail: '핵심 메시지를 요약한 책입니다.' },
  { category: '드라마', tags: ['힐링'], tail: '줄거리와 감상 포인트를 정리했습니다.' },
];


export function useLaterIslandState() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortSubmenuOpen, setSortSubmenuOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLanguage, setSettingsLanguage] = useState<Language>('ko');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogType>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [tags, setTags] = useState<Tag[]>(seedTags);
  const [contents, setContents] = useState<ContentItem[]>(seedContents);
  const [clickCounter, setClickCounter] = useState(6);

  const [form, setForm] = useState<ContentForm>(emptyForm);
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
  const [trashContents, setTrashContents] = useState<ContentItem[]>([]);
  const [trashCategories, setTrashCategories] = useState<Category[]>([]);
  const [trashTags, setTrashTags] = useState<{ tag: Tag; originalItemIds: string[] }[]>([]);

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
        onConfirm: () => setConfirmDialog(null),
      });
    } else {
      setConfirmDialog({
        title: translations[settingsLanguage].confirmDeleteTitle,
        body: translations[settingsLanguage].confirmDeleteBody,
        actionLabel: translations[settingsLanguage].confirmDeleteAction,
        color: '#B15C4A',
        onConfirm: () => setConfirmDialog(null),
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

  const addNewCategory = () => {
    const { categories: nextCategories, id } = findOrCreateCategory(categories, newCategoryInput);
    if (!id) return;
    setCategories(nextCategories);
    setForm((prev) => ({ ...prev, categoryId: id }));
    setNewCategoryInput('');
    setCategoryDropdownOpen(false);
  };

  const toggleTagInForm = (id: string) => {
    const usage = clickCounter + 1;
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, lastUsedAt: usage } : t)));
    setClickCounter(usage);
    setForm((prev) => {
      const has = prev.tagIds.includes(id);
      const tagIds = has ? prev.tagIds.filter((x) => x !== id) : [...prev.tagIds, id];
      return { ...prev, tagIds };
    });
  };

  const addNewTag = () => {
    const usage = clickCounter + 1;
    const { tags: nextTags, id } = findOrCreateTag(tags, newTagInput, usage);
    if (!id) return;
    setTags(nextTags);
    setClickCounter(usage);
    setForm((prev) => ({ ...prev, tagIds: prev.tagIds.includes(id) ? prev.tagIds : [...prev.tagIds, id] }));
    setNewTagInput('');
  };

  const generateAI = () => {
    const pools = settingsLanguage === 'ko' ? aiPools : aiPoolsEn;
    const seed = (contents.length + form.title.length) % pools.length;
    const pick = pools[seed];
    let title = form.title.trim();
    if (!title) {
      title = form.url ? form.url.replace(/^https?:\/\//, '').split('/')[0] : (settingsLanguage === 'ko' ? '제목 없음' : 'Untitled');
    }
    let usage = clickCounter;
    const catRes = findOrCreateCategory(categories, pick.category);
    let nextTags = tags;
    const tagIds: string[] = [];
    pick.tags.forEach((tn) => {
      usage += 1;
      const tagRes = findOrCreateTag(nextTags, tn, usage);
      nextTags = tagRes.tags;
      if (tagRes.id) tagIds.push(tagRes.id);
    });
    const summary = title + ' — ' + pick.tail;

    setCategories(catRes.categories);
    setTags(nextTags);
    setClickCounter(usage);
    setForm((prev) => ({ ...prev, title, summary, categoryId: catRes.id, tagIds }));
  };

  const saveContent = () => {
    if (!form.title.trim()) return;
    if (editingContentId) {
      setContents((prev) =>
        prev.map((c) =>
          c.id === editingContentId
            ? {
                ...c,
                title: form.title.trim(),
                url: form.url.trim() || null,
                summary: form.summary.trim(),
                categoryId: form.categoryId,
                tagIds: form.tagIds,
                sourceType: form.url.trim() ? 'link' : 'manual',
              }
            : c
        )
      );
      setEditingContentId(null);
      setForm(emptyForm);
      if (previousTab) {
        setActiveTab(previousTab);
      }
    } else {
      const newContent: ContentItem = {
        id: 'ct_' + Date.now(),
        sourceType: form.url.trim() ? 'link' : 'manual',
        url: form.url.trim() || null,
        title: form.title.trim(),
        summary: form.summary.trim(),
        categoryId: form.categoryId,
        tagIds: form.tagIds,
        status: 'pending',
      };
      setContents((prev) => [newContent, ...prev]);
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
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'done' } : c)));
  };

  const selectCategoryFilter = (id: string) => setSelectedCategoryId(id);
  const backFromCategory = () => setSelectedCategoryId(null);

  const selectTagFilter = (id: string) => {
    const usage = clickCounter + 1;
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, lastUsedAt: usage } : t)));
    setClickCounter(usage);
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
        setCategories((prev) => prev.filter((x) => x.id !== cat.id));
        setTrashCategories((prev) => [...prev, cat]);
        // Move all contents in this category to trash
        const contentsInCat = contents.filter((c) => c.categoryId === cat.id);
        setContents((prev) => prev.filter((c) => c.categoryId !== cat.id));
        setTrashContents((prev) => [...prev, ...contentsInCat.map((c) => ({ ...c, status: 'trash' as const }))]);
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
        setTags((prev) => prev.filter((x) => x.id !== tag.id));
        const itemIdsWithTag = contents.filter((c) => c.tagIds.includes(tag.id)).map((c) => c.id);
        setContents((prev) =>
          prev.map((c) => ({
            ...c,
            tagIds: c.tagIds.filter((x) => x !== tag.id),
          }))
        );
        setTrashTags((prev) => [...prev, { tag, originalItemIds: itemIdsWithTag }]);
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
        const item = contents.find((c) => c.id === id);
        if (item) {
          setContents((prev) => prev.filter((c) => c.id !== id));
          setTrashContents((prev) => [...prev, { ...item, status: 'trash' as const }]);
        }
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
        if (id.startsWith('cat_')) {
          const catId = id.replace('cat_', '');
          setTrashCategories((prev) => prev.filter((c) => c.id !== catId));
        } else if (id.startsWith('tag_')) {
          const tagId = id.replace('tag_', '');
          setTrashTags((prev) => prev.filter((x) => x.tag.id !== tagId));
        } else if (id.startsWith('content_')) {
          const contentId = id.replace('content_', '');
          setTrashContents((prev) => prev.filter((c) => c.id !== contentId));
        }
        setConfirmDialog(null);
      },
    });
  };

  const restoreTrashItem = (id: string) => {
    if (id.startsWith('cat_')) {
      const catId = id.replace('cat_', '');
      const cat = trashCategories.find((c) => c.id === catId);
      if (cat) {
        setCategories((prev) => [...prev, cat]);
        setTrashCategories((prev) => prev.filter((c) => c.id !== catId));
        // Restore all contents with this categoryId that are in trash
        const itemsToRestore = trashContents.filter((c) => c.categoryId === catId);
        setTrashContents((prev) => prev.filter((c) => c.categoryId !== catId));
        setContents((prev) => [...prev, ...itemsToRestore.map((c) => ({ ...c, status: 'pending' as const }))]);
      }
    } else if (id.startsWith('tag_')) {
      const tagId = id.replace('tag_', '');
      const trashTagItem = trashTags.find((t) => t.tag.id === tagId);
      if (trashTagItem) {
        setTags((prev) => [...prev, trashTagItem.tag]);
        setTrashTags((prev) => prev.filter((t) => t.tag.id !== tagId));
        // Restore tag back to its original items
        setContents((prev) =>
          prev.map((c) => {
            if (trashTagItem.originalItemIds.includes(c.id)) {
              return {
                ...c,
                tagIds: c.tagIds.includes(tagId) ? c.tagIds : [...c.tagIds, tagId],
              };
            }
            return c;
          })
        );
      }
    } else if (id.startsWith('content_')) {
      const contentId = id.replace('content_', '');
      const content = trashContents.find((c) => c.id === contentId);
      if (content) {
        setContents((prev) => [...prev, { ...content, status: 'pending' as const }]);
        setTrashContents((prev) => prev.filter((c) => c.id !== contentId));
      }
    }
  };

  const updateContentItem = (id: string, fields: Partial<ContentItem>) => {
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };

  const updateContentTags = (id: string, tagNames: string[]) => {
    let nextTags = tags;
    let clickCount = clickCounter;
    const tagIds = tagNames
      .map((name) => {
        clickCount += 1;
        const res = findOrCreateTag(nextTags, name, clickCount);
        nextTags = res.tags;
        return res.id;
      })
      .filter(Boolean) as string[];

    setTags(nextTags);
    setClickCounter(clickCount);
    setContents((prev) => prev.map((c) => (c.id === id ? { ...c, tagIds } : c)));
  };

  const updateCategoryName = (id: string, newName: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
  };

  const updateTagName = (id: string, newName: string) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, name: newName } : t)));
  };

  // --- derived values (mirrors renderVals in the original prototype) ---

  const translatedCategories = categories.map((cat) => ({
    ...cat,
    name: categoryTranslations[settingsLanguage][cat.id] || cat.name,
  }));

  const translatedTags = tags.map((tag) => ({
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

  const catMap: Record<string, string> = {};
  translatedCategories.forEach((c) => {
    catMap[c.id] = c.name;
  });
  const tagMap: Record<string, string> = {};
  translatedTags.forEach((t) => {
    tagMap[t.id] = t.name;
  });

  const enrichmentCategoryNameFallback = settingsLanguage === 'ko' ? '미분류' : 'Uncategorized';
  const enrich = (c: ContentItem) => ({
    ...c,
    categoryName: catMap[c.categoryId ?? ''] || enrichmentCategoryNameFallback,
    tagNames: (c.tagIds || []).map((id) => tagMap[id]).filter(Boolean),
    onComplete: () => markDone(c.id),
  });

  const pendingContents = translatedContents.filter((c) => c.status === 'pending').map(enrich);
  const doneContents = translatedContents.filter((c) => c.status === 'done').map(enrich);

  const categoryRows = translatedCategories.map((cat) => {
    const count = translatedContents.filter((c) => c.categoryId === cat.id).length;
    return {
      id: cat.id,
      name: cat.name,
      count,
      onSelect: () => selectCategoryFilter(cat.id),
    };
  });
  const selectedCategory = translatedCategories.find((c) => c.id === selectedCategoryId) || null;
  const categoryFilteredContents = selectedCategoryId
    ? translatedContents.filter((c) => c.categoryId === selectedCategoryId).map(enrich)
    : [];

  const tagRows = translatedTags
    .slice()
    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    .map((t) => {
      const count = translatedContents.filter((c) => (c.tagIds || []).includes(t.id)).length;
      return {
        id: t.id,
        name: t.name,
        count,
        onSelect: () => selectTagFilter(t.id),
      };
    });
  const selectedTag = translatedTags.find((t) => t.id === selectedTagId) || null;
  const tagFilteredContents = selectedTagId
    ? translatedContents.filter((c) => (c.tagIds || []).includes(selectedTagId)).map(enrich)
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

  const trashItems = [
    ...trashCategories.map((cat) => ({
      id: 'cat_' + cat.id,
      type: 'category' as const,
      title: settingsLanguage === 'ko' ? `[카테고리] ${cat.name}` : `[Category] ${cat.name}`,
      summary: settingsLanguage === 'ko' ? '카테고리와 하위 항목들' : 'Category and its items',
      categoryName: '',
      tagNames: [],
    })),
    ...trashTags.map((t) => ({
      id: 'tag_' + t.tag.id,
      type: 'tag' as const,
      title: settingsLanguage === 'ko' ? `[태그] ${t.tag.name}` : `[Tag] ${t.tag.name}`,
      summary: settingsLanguage === 'ko' ? '태그' : 'Tag',
      categoryName: '',
      tagNames: [],
    })),
    ...trashContents.map((c) => {
      const translation = contentTranslations[settingsLanguage][c.id];
      const title = translation ? translation.title : c.title;
      const summary = translation ? translation.summary : c.summary;
      const categoryName = catMap[c.categoryId ?? ''] || (settingsLanguage === 'ko' ? '미분류' : 'Uncategorized');
      const tagNames = (c.tagIds || []).map((id) => tagMap[id]).filter(Boolean);
      return {
        id: 'content_' + c.id,
        type: 'content' as const,
        title,
        summary,
        categoryName,
        tagNames,
      };
    }),
  ];

  return {
    // shell / header
    searchOpen,
    searchQuery,
    setSearchQuery,
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

    confirmDialog,
    activeConfirm,
    closeConfirm,

    activeTab,
    setTab,

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

