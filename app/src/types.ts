export type CreatedBy = 'user' | 'ai';

export interface Category {
  id: string;
  name: string;
  createdBy: CreatedBy;
  // True once the category has been deleted from the UI (Firestore keeps the
  // doc around, soft-deleted, purely so items that referenced it can still
  // resolve a category name). Never shown/selectable once true.
  isDeleted?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  createdBy: CreatedBy;
  lastUsedAt: number;
  isDeleted?: boolean;
}

export type ContentStatus = 'pending' | 'done' | 'trash';
export type SourceType = 'link' | 'manual';

export interface ContentItem {
  id: string;
  sourceType: SourceType;
  title: string;
  url: string | null;
  summary: string;
  categoryId: string | null;
  originalCategoryName?: string;
  tagIds: string[];
  status: ContentStatus;
  aiGenerated?: boolean;
  embedding?: {
    vector: number[];
    model: string;
  };
  // Cloudinary public_id — card/modal thumbnails are derived from this via
  // on-the-fly transformation URLs (see lib/cloudinary.ts).
  imagePublicId?: string | null;
  // Cloudinary secure_url of the untouched original file, used only for
  // "download original" in the fullscreen image modal.
  imageUrl?: string | null;
  createdAt?: number;
}

export interface ContentForm {
  title: string;
  url: string;
  summary: string;
  categoryId: string | null;
  tagIds: string[];
  imagePublicId: string | null;
  imageUrl: string | null;
}

export type SortOrder = 'latest' | 'oldest' | 'alpha';

export type Tab = 'home' | 'category' | 'add' | 'tags' | 'done';

export interface DynamicConfirmDialog {
  title: string;
  body?: string;
  actionLabel: string;
  color: string;
  onConfirm: () => void;
  error?: string;
  confirming?: boolean;
}

export type ConfirmDialogType = DynamicConfirmDialog | null;

export type Language = 'ko' | 'en';

export interface EnrichedContent extends ContentItem {
  categoryName: string;
  tagNames: string[];
  onComplete: () => void;
  onUncomplete?: () => void;
}
