import { useState, useCallback } from 'react';
import styles from './ContentCard.module.css';
import type { Language } from '../types';

export type ContentStatus = 'pending' | 'done' | 'trash';

export interface ContentCardProps {
  title: string;
  summary?: string;
  url?: string;
  imageUrl?: string | null;
  categoryName?: string;
  tagNames?: string[];
  status?: ContentStatus;
  onComplete?: (() => void) | null;
  onUncomplete?: (() => void) | null;
  language?: Language;

  // Kebab actions
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
}

export function ContentCard({
  title,
  summary = '',
  url = '',
  imageUrl = null,
  categoryName,
  tagNames = [],
  status = 'pending',
  onComplete = null,
  onUncomplete = null,
  language = 'ko',
  onEdit,
  onDelete,
  onRestore,
  onDeletePermanently,
}: ContentCardProps) {
  const hasSummary = !!summary;
  const hasUrl = !!url;
  const showComplete = status === 'pending' && !!onComplete;
  const isDone = status === 'done';
  const resolvedCategoryName = categoryName || (language === 'ko' ? '기타' : 'Other');

  const [kebabOpen, setKebabOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleCopy = useCallback(() => {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }, [url]);

  return (
    <>
    <div className={styles.card}>
      <div style={{ display: 'block' }}>
        <div style={{ float: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 12, marginBottom: 4, gap: 8 }}>
          {showComplete && (
            <button
              type="button"
              onClick={onComplete ?? undefined}
              className={styles.statusBadge}
            >
              {language === 'ko' ? '완료' : 'Mark Done'}
            </button>
          )}
          {isDone && (
            <button
              type="button"
              className={styles.statusBadge}
              onClick={onUncomplete ?? undefined}
              style={onUncomplete ? { cursor: 'pointer' } : undefined}
            >
              {language === 'ko' ? '미완료' : 'Mark Incomplete'}
            </button>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              onClick={() => setImageModalOpen(true)}
              style={{
                width: 52,
                height: 52,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid rgba(63,82,64,0.15)',
                cursor: 'pointer',
              }}
            />
          )}
        </div>
        <div className={styles.title}>{title}</div>
        <div style={{ clear: 'both' }}></div>
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

      {/* Bottom Row: kebab + copy + link, grouped tightly to the right */}
      <div className={styles.linkRow} style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 8, position: 'relative', marginTop: 12 }}>
        {/* Kebab menu */}
        <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setKebabOpen(!kebabOpen)}
              style={{
                width: 24,
                height: 24,
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
              }}
              className={styles.kebabTrigger}
            >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3F5240"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1.25"></circle>
              <circle cx="5" cy="12" r="1.25"></circle>
              <circle cx="19" cy="12" r="1.25"></circle>
            </svg>
          </button>

          {kebabOpen && (
            <>
              <div
                onClick={() => setKebabOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 28,
                  right: 0,
                  zIndex: 11,
                  background: '#F7F9F2',
                  border: '1px solid rgba(63,82,64,0.15)',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(63,82,64,0.15)',
                  padding: 4,
                  minWidth: 100,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {status === 'trash' ? (
                  <>
                    <div
                      onClick={() => {
                        onRestore?.();
                        setKebabOpen(false);
                      }}
                      className={styles.kebabItem}
                    >
                      {language === 'ko' ? '복구' : 'Restore'}
                    </div>
                    <div
                      onClick={() => {
                        onDeletePermanently?.();
                        setKebabOpen(false);
                      }}
                      className={styles.kebabItem}
                      style={{ color: '#B15C4A' }}
                    >
                      {language === 'ko' ? '영구 삭제' : 'Delete Permanently'}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => {
                        onEdit?.();
                        setKebabOpen(false);
                      }}
                      className={styles.kebabItem}
                    >
                      {language === 'ko' ? '편집' : 'Edit'}
                    </div>
                    <div
                      onClick={() => {
                        onDelete?.();
                        setKebabOpen(false);
                      }}
                      className={styles.kebabItem}
                      style={{ color: '#B15C4A' }}
                    >
                      {language === 'ko' ? '삭제' : 'Delete'}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {hasUrl && (
          <>
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
            <a href={url} target="_blank" rel="noopener" className={styles.link}>
              {language === 'ko' ? '바로가기 ↗' : 'View Link ↗'}
            </a>
          </>
        )}
      </div>
    </div>

    {imageModalOpen && imageUrl && (
      <div
        onClick={() => setImageModalOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={imageUrl}
          alt=""
          style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
        <a
          href={imageUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: 20,
            background: '#9CB5B1',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {language === 'ko' ? '다운로드' : 'Download'}
        </a>
      </div>
    )}
    </>
  );
}
