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

  isEditMode?: boolean;
  selectedContentIds?: string[];
  setSelectedContentIds?: (ids: string[]) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onExitEditMode?: () => void;
  onUpdateContent?: (id: string, fields: any) => void;
  onUpdateTagName?: (id: string, newName: string) => void;
  onDeleteTag?: (tag: Tag) => void;
}

export function TagsTab({
  tagRows,
  selectedTag,
  tagFilteredContents,
  backFromTag,
  language,
  isEditMode = false,
  selectedContentIds = [],
  setSelectedContentIds,
  onDeleteSelected,
  onExitEditMode,
  onUpdateContent,
  onUpdateTagName,
  onDeleteTag,
}: TagsTabProps) {
  const t = translations[language];

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
                onClick={isEditMode ? undefined : tag.onSelect}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(63,82,64,0.12)',
                  cursor: isEditMode ? 'default' : 'pointer',
                }}
              >
                {isEditMode ? (
                  <div style={{ flex: 1, display: 'flex', gap: 10, alignItems: 'center' }}>
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
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => {
                          setEditingTagId(tag.id);
                          setEditingName(tag.name);
                        }}
                        style={{ fontSize: 15, fontWeight: 600, cursor: 'pointer', borderBottom: '1px dashed #6E8C6A' }}
                      >
                        #{tag.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 600 }}>#{tag.name}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTag?.({ id: tag.id, name: tag.name, createdBy: 'user', lastUsedAt: 0 });
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#B15C4A',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        fontFamily: 'inherit',
                      }}
                    >
                      {language === 'ko' ? '삭제' : 'Delete'}
                    </button>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(tag.count)}</div>
                      <div style={{ fontSize: 14 }}>→</div>
                    </>
                  )}
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
            isEditMode={isEditMode}
            selectedContentIds={selectedContentIds}
            setSelectedContentIds={setSelectedContentIds}
            onDeleteSelected={onDeleteSelected}
            onExitEditMode={onExitEditMode}
            onUpdateContent={onUpdateContent}
          />
        )}
      </div>
    </div>
  );
}

