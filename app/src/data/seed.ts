import type { Category, ContentItem, Tag } from '../types';

export const seedCategories: Category[] = [
  { id: 'c1', name: '책', createdBy: 'user' },
  { id: 'c2', name: '웹툰', createdBy: 'user' },
  { id: 'c3', name: '드라마', createdBy: 'user' },
  { id: 'c4', name: '영상', createdBy: 'user' },
  { id: 'c5', name: '글', createdBy: 'user' },
  { id: 'c6', name: '기타', createdBy: 'user' },
];

export const seedTags: Tag[] = [
  { id: 't1', name: '재테크', createdBy: 'user', lastUsedAt: 6 },
  { id: 't2', name: '자기계발', createdBy: 'user', lastUsedAt: 5 },
  { id: 't3', name: '힐링', createdBy: 'user', lastUsedAt: 4 },
  { id: 't4', name: '개발', createdBy: 'user', lastUsedAt: 3 },
  { id: 't5', name: '디자인', createdBy: 'user', lastUsedAt: 2 },
  { id: 't6', name: '육아', createdBy: 'user', lastUsedAt: 1 },
];

export const seedContents: ContentItem[] = [
  { id: 'ct1', sourceType: 'link', title: '퇴사 후 1년, 파이어족이 된 이야기', url: 'https://example.com/fire-story', summary: '', categoryId: 'c5', tagIds: ['t1', 't2'], status: 'pending' },
  { id: 'ct2', sourceType: 'manual', title: '원피스 1100화', url: null, summary: '', categoryId: 'c2', tagIds: [], status: 'pending' },
  { id: 'ct3', sourceType: 'link', title: '디자인 시스템 만들기 실전 가이드', url: 'https://example.com/design-system', summary: '토큰 설계부터 컴포넌트 문서화까지 정리한 글', categoryId: 'c5', tagIds: ['t5'], status: 'pending' },
  { id: 'ct4', sourceType: 'link', title: '요즘 뜨는 재테크 유튜버 모음', url: 'https://youtube.com/watch?v=abc', summary: '', categoryId: 'c4', tagIds: ['t1'], status: 'pending' },
  { id: 'ct5', sourceType: 'manual', title: '사피엔스', url: null, summary: '', categoryId: 'c1', tagIds: ['t2'], status: 'done' },
  { id: 'ct6', sourceType: 'link', title: '미래에서 온 편지 (드라마)', url: 'https://example.com/drama-ep1', summary: '', categoryId: 'c3', tagIds: ['t3'], status: 'pending' },
  { id: 'ct7', sourceType: 'link', title: '개발자를 위한 시간 관리법', url: 'https://example.com/dev-time', summary: '포모도로와 타임블로킹 비교', categoryId: 'c5', tagIds: ['t4', 't2'], status: 'done' },
  { id: 'ct8', sourceType: 'manual', title: '육아휴직 전 알아둘 것들', url: null, summary: '', categoryId: 'c5', tagIds: ['t6'], status: 'pending' },
];
