import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ContentCard.module.css';
import type { Language } from '../types';
import { cloudinaryModalUrl, cloudinaryThumbUrl } from '../lib/cloudinary';

export type ContentStatus = 'pending' | 'done' | 'trash';

export interface ContentCardProps {
  title: string;
  summary?: string;
  url?: string;
  // Preferred image source: a Cloudinary public_id, transformed on the fly
  // into an optimized thumbnail/modal URL. `imageUrl` (the untouched
  // original) is the fallback for older items uploaded before Cloudinary
  // was wired up, and is always what "download" hands the user.
  imagePublicId?: string | null;
  imageUrl?: string | null;
  categoryName?: string;
  tagNames?: string[];
  status?: ContentStatus;
  onComplete?: (() => void) | null;
  onUncomplete?: (() => void) | null;
  language?: Language;

  // Kebab actions (non-trash only; trash cards use the inline restore
  // button + select-mode checkbox instead of a kebab menu)
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;

  // Trash screen's select mode (bulk permanent delete). Only meaningful when
  // status === 'trash'.
  isSelectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function ContentCard({
  title,
  summary = '',
  url = '',
  imagePublicId = null,
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
  isSelectMode = false,
  selected = false,
  onToggleSelect,
}: ContentCardProps) {
  const hasSummary = !!summary;
  const hasUrl = !!url;
  const hasImage = !!imagePublicId || !!imageUrl;
  const thumbSrc = imagePublicId ? cloudinaryThumbUrl(imagePublicId) : imageUrl;
  const modalSrc = imagePublicId ? cloudinaryModalUrl(imagePublicId) : imageUrl;
  const showComplete = status === 'pending' && !!onComplete;
  const isDone = status === 'done';
  const resolvedCategoryName = categoryName || (language === 'ko' ? '기타' : 'Other');

  const [kebabOpen, setKebabOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Measured heights driving the summary's expand/collapse animation:
  // `collapsedHeight` is the natural 2-line-clamped height, `expandedHeight`
  // is the full unclamped text height (from a hidden, always-unclamped
  // measurer). Using measured pixel values (rather than a large arbitrary
  // max-height) keeps the transition duration visually consistent in both
  // directions regardless of how long the summary actually is.
  const summaryRef = useRef<HTMLDivElement>(null);
  const fullSummaryRef = useRef<HTMLDivElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number>();
  const [expandedHeight, setExpandedHeight] = useState<number>();

  useEffect(() => {
    if (fullSummaryRef.current) setExpandedHeight(fullSummaryRef.current.scrollHeight);
  }, [summary]);

  useEffect(() => {
    if (!expanded && summaryRef.current) setCollapsedHeight(summaryRef.current.clientHeight);
  }, [summary, expanded]);

  const handleCopy = useCallback(() => {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }, [url]);

  return (
    <>
    <div className={styles.card} onClick={() => setExpanded((v) => !v)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div className={styles.title} style={{ minWidth: 0 }}>{title}</div>
        {showComplete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
            className={styles.statusBadge}
            style={{ flexShrink: 0 }}
          >
            {language === 'ko' ? '완료' : 'Mark Done'}
          </button>
        )}
        {isDone && (
          <button
            type="button"
            className={styles.statusBadge}
            onClick={(e) => { e.stopPropagation(); onUncomplete?.(); }}
            style={{ flexShrink: 0, cursor: onUncomplete ? 'pointer' : undefined }}
          >
            {language === 'ko' ? '미완료' : 'Mark Incomplete'}
          </button>
        )}
        {status === 'trash' && isSelectMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className={styles.selectCheckbox}
            style={{ flexShrink: 0 }}
          />
        )}
        {status === 'trash' && !isSelectMode && onRestore && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRestore(); }}
            className={styles.restoreButton}
          >
            {language === 'ko' ? '복구' : 'Restore'}
          </button>
        )}
      </div>

      <div className={styles.chipsRow}>
        <div className={styles.categoryChip}>{resolvedCategoryName}</div>
        {tagNames.map((tagName) => (
          <div key={tagName} className={styles.tagChip}>
            #{tagName}
          </div>
        ))}
        {hasImage && (
          <img
            src={thumbSrc ?? undefined}
            alt=""
            onClick={(e) => { e.stopPropagation(); setImageModalOpen(true); }}
            style={{
              width: 36,
              height: 36,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid rgba(63,82,64,0.15)',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          />
        )}
      </div>

      {hasSummary && (
        <div
          style={{
            marginTop: 10,
            overflow: 'hidden',
            transition: 'max-height 0.25s ease',
            maxHeight: expanded ? expandedHeight : collapsedHeight,
            position: 'relative',
          }}
        >
          <div
            ref={summaryRef}
            className={styles.summary}
            style={{
              margin: 0,
              ...(expanded
                ? { display: 'block' }
                : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }),
            }}
          >
            {summary}
          </div>
          {/* Hidden, always-unclamped copy used only to measure the full text height. */}
          <div
            ref={fullSummaryRef}
            className={styles.summary}
            aria-hidden
            style={{ margin: 0, position: 'absolute', visibility: 'hidden', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: -1 }}
          >
            {summary}
          </div>
        </div>
      )}

      {/* Bottom Row: kebab (non-trash only) + copy + link, grouped tightly to the right */}
      <div className={styles.linkRow} style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 8, position: 'relative', marginTop: 12 }}>
        {/* Kebab menu — trash cards use the inline restore button / select-mode checkbox instead */}
        {status !== 'trash' && (
          <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
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
                </div>
              </>
            )}
          </div>
        )}

        {hasUrl && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
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
            <a href={url} target="_blank" rel="noopener" className={styles.link} onClick={(e) => e.stopPropagation()}>
              {language === 'ko' ? '바로가기 ↗' : 'View Link ↗'}
            </a>
          </>
        )}
      </div>
    </div>

    {imageModalOpen && hasImage && (
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
          src={modalSrc ?? undefined}
          alt=""
          style={{ maxWidth: '90%', maxHeight: '80%', objectFit: 'contain', borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
        <a
          href={imageUrl ?? undefined}
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
