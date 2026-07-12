import { useState, useCallback, useEffect } from 'react';
import styles from './ContentCard.module.css';
import type { Language } from '../types';

export type ContentStatus = 'pending' | 'done' | 'trash';

export interface ContentCardProps {
  title: string;
  summary?: string;
  url?: string;
  categoryName?: string;
  tagNames?: string[];
  status?: ContentStatus;
  onComplete?: (() => void) | null;
  language?: Language;

  // New Edit props
  isEditMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onUpdateContent?: (fields: { title?: string; summary?: string; url?: string; tagNames?: string[] }) => void;
  onRestore?: (() => void) | null;
}

const editInputStyle = {
  fontSize: 'inherit',
  fontFamily: 'inherit',
  color: '#3F5240',
  background: '#fff',
  border: '1px solid #6E8C6A',
  borderRadius: 4,
  padding: '4px 6px',
  width: '100%',
  boxSizing: 'border-box' as const,
};

export function ContentCard({
  title,
  summary = '',
  url = '',
  categoryName,
  tagNames = [],
  status = 'pending',
  onComplete = null,
  language = 'ko',
  isEditMode = false,
  selected = false,
  onToggleSelect,
  onUpdateContent,
  onRestore = null,
}: ContentCardProps) {
  const hasSummary = !!summary;
  const hasUrl = !!url;
  const showComplete = status === 'pending' && !!onComplete && !isEditMode;
  const isDone = status === 'done';
  const resolvedCategoryName = categoryName || (language === 'ko' ? '기타' : 'Other');

  // Inline edit states
  const [editingField, setEditingField] = useState<'title' | 'summary' | 'url' | 'tags' | null>(null);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempSummary, setTempSummary] = useState(summary);
  const [tempUrl, setTempUrl] = useState(url);
  const [tempTags, setTempTags] = useState('');

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    setTempSummary(summary);
  }, [summary]);

  useEffect(() => {
    setTempUrl(url);
  }, [url]);

  useEffect(() => {
    setTempTags(tagNames.map((t) => `#${t}`).join(' '));
  }, [tagNames]);

  const handleCopy = useCallback(() => {
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }, [url]);

  const saveTitle = () => {
    if (tempTitle.trim() && tempTitle.trim() !== title) {
      onUpdateContent?.({ title: tempTitle.trim() });
    }
    setEditingField(null);
  };

  const saveSummary = () => {
    if (tempSummary.trim() !== summary) {
      onUpdateContent?.({ summary: tempSummary.trim() });
    }
    setEditingField(null);
  };

  const saveUrl = () => {
    if (tempUrl.trim() !== url) {
      onUpdateContent?.({ url: tempUrl.trim() });
    }
    setEditingField(null);
  };

  const saveTags = () => {
    const parsed = tempTags
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);
    onUpdateContent?.({ tagNames: parsed });
    setEditingField(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div style={{ flex: 1 }}>
          {isEditMode && editingField === 'title' ? (
            <input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              autoFocus
              style={editInputStyle}
            />
          ) : (
            <div
              className={styles.title}
              style={isEditMode ? { cursor: 'pointer', borderBottom: '1px dashed #6E8C6A' } : undefined}
              onClick={isEditMode ? () => setEditingField('title') : undefined}
            >
              {title}
            </div>
          )}
        </div>

        {isEditMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className={styles.roundCheckbox}
          />
        )}

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
        {status === 'trash' && !isEditMode && onRestore && (
          <button
            type="button"
            onClick={onRestore}
            className={styles.restoreButton}
          >
            {language === 'ko' ? '복구' : 'Restore'}
          </button>
        )}
      </div>

      {isEditMode && editingField === 'tags' ? (
        <div style={{ marginTop: 8 }}>
          <input
            value={tempTags}
            onChange={(e) => setTempTags(e.target.value)}
            onBlur={saveTags}
            onKeyDown={(e) => e.key === 'Enter' && saveTags()}
            autoFocus
            placeholder={language === 'ko' ? '태그 입력 (예: #힐링 #재테크)' : 'Enter tags (e.g. #Wellness #Finance)'}
            style={editInputStyle}
          />
        </div>
      ) : (
        <div
          className={styles.chipsRow}
          style={isEditMode ? { cursor: 'pointer', borderBottom: '1px dashed #6E8C6A', minHeight: 24, marginTop: 8 } : undefined}
          onClick={isEditMode ? () => setEditingField('tags') : undefined}
        >
          <div className={styles.categoryChip}>{resolvedCategoryName}</div>
          {tagNames.map((tagName) => (
            <div key={tagName} className={styles.tagChip}>
              #{tagName}
            </div>
          ))}
        </div>
      )}

      {isEditMode && editingField === 'summary' ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={tempSummary}
            onChange={(e) => setTempSummary(e.target.value)}
            onBlur={saveSummary}
            onKeyDown={(e) => e.key === 'Enter' && saveSummary()}
            autoFocus
            rows={2}
            style={{ ...editInputStyle, resize: 'none' }}
          />
        </div>
      ) : isEditMode ? (
        <div
          className={styles.summary}
          style={{ cursor: 'pointer', borderBottom: '1px dashed #6E8C6A', minHeight: 18, color: summary ? undefined : '#aaa', marginTop: 8 }}
          onClick={() => setEditingField('summary')}
        >
          {summary || (language === 'ko' ? '(요약 입력)' : '(Enter summary)')}
        </div>
      ) : (
        hasSummary && <div className={styles.summary}>{summary}</div>
      )}

      {isEditMode && editingField === 'url' ? (
        <div style={{ marginTop: 8 }}>
          <input
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            onBlur={saveUrl}
            onKeyDown={(e) => e.key === 'Enter' && saveUrl()}
            autoFocus
            style={editInputStyle}
          />
        </div>
      ) : isEditMode ? (
        <div className={styles.linkRow} style={{ marginTop: 8 }}>
          <span
            style={{ cursor: 'pointer', borderBottom: '1px dashed #6E8C6A', fontSize: 13, color: '#6E8C6A' }}
            onClick={() => setEditingField('url')}
          >
            {url || (language === 'ko' ? '(링크 입력)' : '(Enter link)')}
          </span>
        </div>
      ) : (
        hasUrl && (
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
        )
      )}
    </div>
  );
}


