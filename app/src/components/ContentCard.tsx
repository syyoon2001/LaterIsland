import { useCallback } from 'react';
import styles from './ContentCard.module.css';
import type { Language } from '../types';

export type ContentStatus = 'pending' | 'done';

export interface ContentCardProps {
  title: string;
  summary?: string;
  url?: string;
  categoryName?: string;
  tagNames?: string[];
  status?: ContentStatus;
  onComplete?: (() => void) | null;
  language?: Language;
}

export function ContentCard({
  title,
  summary = '',
  url = '',
  categoryName,
  tagNames = [],
  status = 'pending',
  onComplete = null,
  language = 'ko',
}: ContentCardProps) {
  const hasSummary = !!summary;
  const hasUrl = !!url;
  const showComplete = status === 'pending' && !!onComplete;
  const isDone = status === 'done';
  const resolvedCategoryName = categoryName || (language === 'ko' ? '기타' : 'Other');

  const handleCopy = useCallback(() => {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }, [url]);

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.title}>{title}</div>
        {showComplete && (
          <button
            type="button"
            onClick={onComplete ?? undefined}
            className={styles.completeButton}
          >
            {language === 'ko' ? '완료' : 'Mark Done'}
          </button>
        )}
        {isDone && <div className={styles.doneBadge}>{language === 'ko' ? '완료됨' : 'Done'}</div>}
      </div>

      <div className={styles.chipsRow}>
        <div className={styles.categoryChip}>{resolvedCategoryName}</div>
        {tagNames.map((tagName) => (
          <div key={tagName} className={styles.tagChip}>
            #{tagName}
          </div>
        ))}
      </div>

      {hasSummary && <div className={styles.summary}>{summary}</div>}

      {hasUrl && (
        <div className={styles.linkRow}>
          <a href={url} target="_blank" rel="noopener" className={styles.link}>
            {language === 'ko' ? '바로가기 ↗' : 'View Link ↗'}
          </a>
          <button
            type="button"
            onClick={handleCopy}
            title={language === 'ko' ? '링크 복사' : 'Copy Link'}
            className={styles.copyButton}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3F5240"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="12" height="12" rx="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

