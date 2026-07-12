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

  useEffect(() => {
    const handleJump = (e: any) => {
      const { target, lang } = e.detail;
      if (lang) setSettingsLanguage(lang);
      if (['home', 'category', 'add', 'tags', 'done'].includes(target)) {
        setActiveTab(target as Tab);
        setShowSettings(false);
      } else if (target === 'settings') {
        setShowSettings(true);
      }
    };
    window.addEventListener('simulation-jump', handleJump);
    return () => window.removeEventListener('simulation-jump', handleJump);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('simulation-sync', { detail: { screen: 'app', activeTab, showSettings, settingsLanguage } }));
  }, [activeTab, showSettings, settingsLanguage]);

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

  const openConfirm = (type: 'logout' | 'delete') => setConfirmDialog(type);
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
    setCategoryDropdownOpen(false);
    setTagDropdownOpen(false);
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

  const confirmMeta = {
    logout: {
      title: translations[settingsLanguage].confirmLogoutTitle,
      body: translations[settingsLanguage].confirmLogoutBody,
      actionLabel: translations[settingsLanguage].confirmLogoutAction,
      color: '#6E8C6A',
    },
    delete: {
      title: translations[settingsLanguage].confirmDeleteTitle,
      body: translations[settingsLanguage].confirmDeleteBody,
      actionLabel: translations[settingsLanguage].confirmDeleteAction,
      color: '#B15C4A',
    },
  };
  const activeConfirm = confirmDialog ? confirmMeta[confirmDialog] : null;

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
  };
}

export type LaterIslandState = ReturnType<typeof useLaterIslandState>;

