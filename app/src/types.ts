export type CreatedBy = 'user' | 'ai';

export interface Category {
  id: string;
  name: string;
  createdBy: CreatedBy;
}

export interface Tag {
  id: string;
  name: string;
  createdBy: CreatedBy;
  lastUsedAt: number;
}

export type ContentStatus = 'pending' | 'done';
export type SourceType = 'link' | 'manual';

export interface ContentItem {
  id: string;
  sourceType: SourceType;
  title: string;
  url: string | null;
  summary: string;
  categoryId: string | null;
  tagIds: string[];
  status: ContentStatus;
}

export interface ContentForm {
  title: string;
  url: string;
  summary: string;
  categoryId: string | null;
  tagIds: string[];
}

export type SortOrder = 'latest' | 'oldest' | 'alpha';

export type Tab = 'home' | 'category' | 'add' | 'tags' | 'done';

export type ConfirmDialogType = 'logout' | 'delete' | null;

export type Language = 'ko' | 'en';

export interface EnrichedContent extends ContentItem {
  categoryName: string;
  tagNames: string[];
  onComplete: () => void;
}
