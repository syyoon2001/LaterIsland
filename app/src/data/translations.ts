import type { Language } from '../types';

export const translations = {
  ko: {
    tabHome: '홈',
    tabCategory: '카테고리',
    tabAdd: '추가',
    tabTags: '태그',
    tabDone: '완료',
    
    // Header
    searchPlaceholder: '검색',
    searchAi: '✦ AI 검색',
    sortBy: '정렬 기준',
    sortLatest: '최신순',
    sortOldest: '오래된순',
    sortAlpha: '가나다순',
    edit: '편집',
    settings: '설정',
    
    // HomeTab
    homeEmpty: '아직 저장한 콘텐츠가 없어요',
    
    // CategoryTab
    categoryEmpty: '해당 카테고리의 콘텐츠가 없어요',
    categoryTitle: '카테고리',
    itemsCount: (count: number) => `${count}개`,
    
    // AddTab
    addTitle: '콘텐츠 추가',
    formTitleLabel: '제목 *',
    formTitlePlaceholder: '제목을 입력하세요',
    formLinkLabel: '링크 (선택)',
    formLinkPlaceholder: 'https://...',
    formSummaryLabel: '요약 (선택)',
    formSummaryPlaceholder: '나중에 참고할 요약을 남겨보세요',
    formCategoryLabel: '카테고리 (형식)',
    formCategorySelect: '선택',
    formCategoryPlaceholder: '카테고리를 선택하세요',
    formCategoryAddNew: '+ 새 카테고리',
    formCategoryAddBtn: '추가',
    formTagLabel: '태그 (주제)',
    formTagSelectPlaceholder: '태그 선택 / 추가',
    formTagAddNew: '+ 새 태그',
    formTagAddBtn: '추가',
    formAiAutofill: '✦ AI 자동생성',
    formSave: '저장',
    
    // TagsTab
    tagsTitle: '태그 모음',
    tagsEmpty: '해당 태그의 콘텐츠가 없어요',
    
    // DoneTab
    doneTitle: '완료함',
    doneEmpty: '완료한 콘텐츠가 없어요',
    
    // SettingsScreen
    profileName: '나중에',
    settingsLanguageLabel: '언어',
    langKo: '한국어',
    langEn: 'English',
    logout: '로그아웃',
    deleteAccount: '계정 삭제',
    
    // Confirm Dialogs
    confirmLogoutTitle: '로그아웃 하시겠어요?',
    confirmLogoutBody: '다시 로그인하면 저장한 콘텐츠를 그대로 볼 수 있어요.',
    confirmLogoutAction: '로그아웃',
    confirmDeleteTitle: '계정을 삭제할까요?',
    confirmDeleteBody: '삭제하면 저장된 모든 콘텐츠가 영구적으로 사라지며 복구할 수 없어요.',
    confirmDeleteAction: '삭제',
    confirmCancel: '취소',

    // New Trash & Edit keys
    trash: '휴지통',
    selectAll: '전체 선택',
    delete: '삭제',
    restore: '복구',
    confirmDeleteSelectedTitle: (count: number) => `선택한 ${count}개 항목을 삭제하시겠습니까?`,
    confirmDeleteSingleTitle: '이 항목을 삭제하시겠습니까?',
    confirmDeleteTagTitle: (name: string) => `'#${name}' 태그를 삭제하시겠습니까?`,
    confirmDeleteCategoryTitle: '이 카테고리를 삭제하시겠습니까?',
    confirmDeletePermanentlyTitle: '완전히 삭제하시겠습니까?',
  },
  en: {
    tabHome: 'Home',
    tabCategory: 'Category',
    tabAdd: 'Add',
    tabTags: 'Tag',
    tabDone: 'Done',
    
    // Header
    searchPlaceholder: 'Search',
    searchAi: '✦ AI Search',
    sortBy: 'Sort by',
    sortLatest: 'Newest',
    sortOldest: 'Oldest',
    sortAlpha: 'A–Z',
    edit: 'Edit',
    settings: 'Settings',
    
    // HomeTab
    homeEmpty: 'No saved content yet',
    
    // CategoryTab
    categoryEmpty: 'No content in this category',
    categoryTitle: 'Category',
    itemsCount: (count: number) => `${count} ${count === 1 ? 'item' : 'items'}`,
    
    // AddTab
    addTitle: 'Add Content',
    formTitleLabel: 'Title *',
    formTitlePlaceholder: 'Enter a title',
    formLinkLabel: 'Link (optional)',
    formLinkPlaceholder: 'https://...',
    formSummaryLabel: 'Summary (optional)',
    formSummaryPlaceholder: 'Leave a summary for later',
    formCategoryLabel: 'Category (format)',
    formCategorySelect: 'Selected',
    formCategoryPlaceholder: 'Choose a category',
    formCategoryAddNew: '+ New category',
    formCategoryAddBtn: 'Add',
    formTagLabel: 'Tags (topic)',
    formTagSelectPlaceholder: 'Select / add tags',
    formTagAddNew: '+ New tag',
    formTagAddBtn: 'Add',
    formAiAutofill: '✦ AI Autofill',
    formSave: 'Save',
    
    // TagsTab
    tagsTitle: 'Tags',
    tagsEmpty: 'No content with this tag',
    
    // DoneTab
    doneTitle: 'Done',
    doneEmpty: 'No completed content yet',
    
    // SettingsScreen
    profileName: 'Alex Kim',
    settingsLanguageLabel: 'Language',
    langKo: 'Korean',
    langEn: 'English',
    logout: 'Log Out',
    deleteAccount: 'Delete Account',
    
    // Confirm Dialogs
    confirmLogoutTitle: 'Log out?',
    confirmLogoutBody: "You'll still see all your saved content when you log back in.",
    confirmLogoutAction: 'Log Out',
    confirmDeleteTitle: 'Delete your account?',
    confirmDeleteBody: 'This permanently removes all your saved content and cannot be undone.',
    confirmDeleteAction: 'Delete',
    confirmCancel: 'Cancel',

    // New Trash & Edit keys
    trash: 'Trash',
    selectAll: 'Select All',
    delete: 'Delete',
    restore: 'Restore',
    confirmDeleteSelectedTitle: (count: number) => `Delete ${count} selected items?`,
    confirmDeleteSingleTitle: 'Delete this item?',
    confirmDeleteTagTitle: (name: string) => `Delete '#${name}' tag?`,
    confirmDeleteCategoryTitle: 'Delete this category?',
    confirmDeletePermanentlyTitle: 'Delete permanently?',
  },
};

// Mappings for translating categories
export const categoryTranslations: Record<Language, Record<string, string>> = {
  ko: {
    c1: '책',
    c2: '웹툰',
    c3: '드라마',
    c4: '영상',
    c5: '글',
    c6: '기타',
  },
  en: {
    c1: 'Book',
    c2: 'Webtoon',
    c3: 'Drama',
    c4: 'Video',
    c5: 'Article',
    c6: 'Other',
  },
};

// Mappings for translating tags
export const tagTranslations: Record<Language, Record<string, string>> = {
  ko: {
    t1: '재테크',
    t2: '자기계발',
    t3: '힐링',
    t4: '개발',
    t5: '디자인',
    t6: '육아',
  },
  en: {
    t1: 'Finance',
    t2: 'Self-growth',
    t3: 'Wellness',
    t4: 'Dev',
    t5: 'Design',
    t6: 'Parenting',
  },
};

// Mappings for translating content items
export const contentTranslations: Record<Language, Record<string, { title: string; summary: string }>> = {
  ko: {
    ct1: { title: '퇴사 후 1년, 파이어족이 된 이야기', summary: '' },
    ct2: { title: '원피스 1100화', summary: '' },
    ct3: { title: '디자인 시스템 만들기 실전 가이드', summary: '토큰 설계부터 컴포넌트 문서화까지 정리한 글' },
    ct4: { title: '요즘 뜨는 재테크 유튜버 모음', summary: '' },
    ct5: { title: '사피엔스', summary: '' },
    ct6: { title: '미래에서 온 편지 (드라마)', summary: '' },
    ct7: { title: '개발자를 위한 시간 관리법', summary: '포모도로와 타임블로킹 비교' },
    ct8: { title: '육아휴직 전 알아둘 것들', summary: '' },
  },
  en: {
    ct1: { title: 'One Year After Quitting: My FIRE Journey', summary: '' },
    ct2: { title: 'One Piece Episode 1100', summary: '' },
    ct3: { title: 'A Practical Guide to Building Design Systems', summary: 'From token design to component documentation' },
    ct4: { title: 'Popular Finance YouTubers Right Now', summary: '' },
    ct5: { title: 'Sapiens', summary: '' },
    ct6: { title: 'A Letter from the Future (Drama)', summary: '' },
    ct7: { title: 'Time Management for Developers', summary: 'Comparing Pomodoro and time-blocking' },
    ct8: { title: 'What to Know Before Parental Leave', summary: '' },
  },
};

// AI Autofill pools in English
export const aiPoolsEn = [
  { category: 'Article', tags: ['Self-growth', 'Wellness'], tail: 'An article summarizing the key points.' },
  { category: 'Video', tags: ['Finance'], tail: 'A video covering the main takeaways.' },
  { category: 'Book', tags: ['Self-growth'], tail: 'A book summarizing its core message.' },
  { category: 'Drama', tags: ['Wellness'], tail: 'A summary of the plot and highlights.' },
];
