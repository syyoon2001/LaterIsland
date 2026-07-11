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

function findOrCreateCategory(categoriesArr: Category[], name: string) {
  const trimmed = (name || '').trim();
  if (!trimmed) return { categories: categoriesArr, id: null as string | null };
  const existing = categoriesArr.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return { categories: categoriesArr, id: existing.id };
  const newCat: Category = { id: 'c_' + Date.now() + Math.random().toString(36).slice(2, 6), name: trimmed, createdBy: 'user' };
  return { categories: [...categoriesArr, newCat], id: newCat.id };
}

function findOrCreateTag(tagsArr: Tag[], name: string, usage: number) {
  const trimmed = (name || '').trim();
  if (!trimmed) return { tags: tagsArr, id: null as string | null };
  const existing = tagsArr.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    const updated = tagsArr.map((t) => (t.id === existing.id ? { ...t, lastUsedAt: usage } : t));
    return { tags: updated, id: existing.id };
  }
  const newTag: Tag = { id: 't_' + Date.now() + Math.random().toString(36).slice(2, 6), name: trimmed, createdBy: 'user', lastUsedAt: usage };
  return { tags: [...tagsArr, newTag], id: newTag.id };
}

const emptyForm: ContentForm = { title: '', url: '', summary: '', categoryId: null, tagIds: [] };

const sortLabels: Record<SortOrder, string> = { latest: '최신순', oldest: '오래된순', alpha: '가나다순' };

const confirmMeta: Record<'logout' | 'delete', { title: string; body: string; actionLabel: string; color: string }> = {
  logout: { title: '로그아웃 하시겠어요?', body: '다시 로그인하면 저장한 콘텐츠를 그대로 볼 수 있어요.', actionLabel: '로그아웃', color: '#6E8C6A' },
  delete: { title: '계정을 삭제할까요?', body: '삭제하면 저장된 모든 콘텐츠가 영구적으로 사라지며 복구할 수 없어요.', actionLabel: '삭제', color: '#B15C4A' },
};

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
    const seed = (contents.length + form.title.length) % aiPools.length;
    const pick = aiPools[seed];
    let title = form.title.trim();
    if (!title) {
      title = form.url ? form.url.replace(/^https?:\/\//, '').split('/')[0] : '제목 없음';
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

  const catMap: Record<string, string> = {};
  categories.forEach((c) => {
    catMap[c.id] = c.name;
  });
  const tagMap: Record<string, string> = {};
  tags.forEach((t) => {
    tagMap[t.id] = t.name;
  });

  const enrich = (c: ContentItem) => ({
    ...c,
    categoryName: catMap[c.categoryId ?? ''] || '미분류',
    tagNames: (c.tagIds || []).map((id) => tagMap[id]).filter(Boolean),
    onComplete: () => markDone(c.id),
  });

  const pendingContents = contents.filter((c) => c.status === 'pending').map(enrich);
  const doneContents = contents.filter((c) => c.status === 'done').map(enrich);

  const categoryRows = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    count: contents.filter((c) => c.categoryId === cat.id).length,
    onSelect: () => selectCategoryFilter(cat.id),
  }));
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;
  const categoryFilteredContents = selectedCategoryId
    ? contents.filter((c) => c.categoryId === selectedCategoryId).map(enrich)
    : [];

  const tagRows = tags
    .slice()
    .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    .map((t) => ({
      id: t.id,
      name: t.name,
      count: contents.filter((c) => (c.tagIds || []).includes(t.id)).length,
      onSelect: () => selectTagFilter(t.id),
    }));
  const selectedTag = tags.find((t) => t.id === selectedTagId) || null;
  const tagFilteredContents = selectedTagId
    ? contents.filter((c) => (c.tagIds || []).includes(selectedTagId)).map(enrich)
    : [];

  const formCategoryRows = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    bg: form.categoryId === cat.id ? '#6E8C6A' : '#F7F9F2',
    fg: form.categoryId === cat.id ? '#fff' : '#3F5240',
    onSelect: () => selectCategory(cat.id),
  }));
  const selectedCategoryLabel = form.categoryId ? catMap[form.categoryId] || '선택' : '카테고리를 선택하세요';

  const formTagRows = tags.map((t) => ({
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
