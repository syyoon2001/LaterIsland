import { useState } from 'react';
import { BackButton } from '../../components/BackButton';
import { ContentList } from './ContentList';
import type { EnrichedContent, Tag, Language } from '../../types';
import { translations } from '../../data/translations';

interface TagRow {
  id: string;
  name: string;
  count: number;
  onSelect: () => void;
}

interface TagsTabProps {
  tagRows: TagRow[];
  selectedTag: Tag | null;
  tagFilteredContents: EnrichedContent[];
  backFromTag: () => void;
  language: Language;

  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onUpdateTagName?: (id: string, newName: string) => void;
  onDeleteTag?: (tag: Tag) => void;
}

export function TagsTab({
  tagRows,
  selectedTag,
  tagFilteredContents,
  backFromTag,
  language,
  onEditItem,
  onDeleteItem,
  onUpdateTagName,
  onDeleteTag,
}: TagsTabProps) {
  const t = translations[language];

  // Kebab state
  const [kebabOpenId, setKebabOpenId] = useState<string | null>(null);
  const [hoveredKebabItemId, setHoveredKebabItemId] = useState<string | null>(null);

  // Inline editing states for tags
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  return (
    <div data-screen-label={language === 'ko' ? '태그 모음' : 'Tags'}>
      <div style={{ padding: '20px 20px 0' }}>
        {selectedTag && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BackButton onClick={backFromTag} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>#{selectedTag.name}</div>
          </div>
        )}
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        {!selectedTag && (
          <div>
            {tagRows.map((tag) => (
              <div
                key={tag.id}
                onClick={editingTagId === tag.id ? undefined : tag.onSelect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(63,82,64,0.12)',
                  cursor: editingTagId === tag.id ? 'default' : 'pointer',
                }}
              >
                {/* Kebab menu on the left end */}
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setKebabOpenId(kebabOpenId === tag.id ? null : tag.id)}
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
                      <circle cx="12" cy="5" r="1.25"></circle>
                      <circle cx="12" cy="19" r="1.25"></circle>
                    </svg>
                  </button>

                  {kebabOpenId === tag.id && (
                    <>
                      <div
                        onClick={() => setKebabOpenId(null)}
                        style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 24,
                          left: 0,
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
                            setEditingTagId(tag.id);
                            setEditingName(tag.name);
                            setKebabOpenId(null);
                          }}
                          onMouseEnter={() => setHoveredKebabItemId(`edit_${tag.id}`)}
                          onMouseLeave={() => setHoveredKebabItemId(null)}
                          style={{
                            padding: '8px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: 6,
                            textAlign: 'center',
                            color: '#3F5240',
                            background: hoveredKebabItemId === `edit_${tag.id}` ? 'rgba(63,82,64,0.08)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {language === 'ko' ? '편집' : 'Edit'}
                        </div>
                        <div
                          onClick={() => {
                            onDeleteTag?.({ id: tag.id, name: tag.name, createdBy: 'user', lastUsedAt: 0 });
                            setKebabOpenId(null);
                          }}
                          onMouseEnter={() => setHoveredKebabItemId(`del_${tag.id}`)}
                          onMouseLeave={() => setHoveredKebabItemId(null)}
                          style={{
                            padding: '8px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: 6,
                            textAlign: 'center',
                            color: '#B15C4A',
                            background: hoveredKebabItemId === `del_${tag.id}` ? 'rgba(63,82,64,0.08)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {language === 'ko' ? '삭제' : 'Delete'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Name display or input */}
                <div
                  style={{ flex: 1, display: 'flex', alignItems: 'center' }}
                  onClick={(e) => editingTagId === tag.id && e.stopPropagation()}
                >
                  {editingTagId === tag.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        if (editingName.trim()) {
                          onUpdateTagName?.(tag.id, editingName.trim());
                        }
                        setEditingTagId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingName.trim()) {
                            onUpdateTagName?.(tag.id, editingName.trim());
                          }
                          setEditingTagId(null);
                        }
                      }}
                      autoFocus
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        border: '1px solid #6E8C6A',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontFamily: 'inherit',
                        color: '#3F5240',
                        width: '80%',
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: 600 }}>#{tag.name}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(tag.count)}</div>
                  <div style={{ fontSize: 14 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTag && (
          <ContentList
            items={tagFilteredContents}
            emptyMessage={t.tagsEmpty}
            language={language}
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        )}
      </div>
    </div>
  );
}
