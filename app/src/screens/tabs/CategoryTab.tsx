import { useState } from 'react';
import { BackButton } from '../../components/BackButton';
import { ContentList } from './ContentList';
import type { Category, EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface CategoryRow {
  id: string;
  name: string;
  count: number;
  onSelect: () => void;
}

interface CategoryTabProps {
  categoryRows: CategoryRow[];
  selectedCategory: Category | null;
  categoryFilteredContents: EnrichedContent[];
  backFromCategory: () => void;
  language: Language;
  
  isEditMode?: boolean;
  selectedContentIds?: string[];
  setSelectedContentIds?: (ids: string[]) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onExitEditMode?: () => void;
  onUpdateContent?: (id: string, fields: any) => void;
  onUpdateCategoryName?: (id: string, newName: string) => void;
  onDeleteCategory?: (cat: Category) => void;
}

export function CategoryTab({
  categoryRows,
  selectedCategory,
  categoryFilteredContents,
  backFromCategory,
  language,
  isEditMode = false,
  selectedContentIds = [],
  setSelectedContentIds,
  onDeleteSelected,
  onExitEditMode,
  onUpdateContent,
  onUpdateCategoryName,
  onDeleteCategory,
}: CategoryTabProps) {
  const t = translations[language];

  // Inline editing states for categories
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  return (
    <div data-screen-label={language === 'ko' ? '카테고리' : 'Category'}>
      <div style={{ padding: 20 }}>
        {selectedCategory && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BackButton onClick={backFromCategory} />
            <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedCategory.name}</div>
          </div>
        )}

        {!selectedCategory && (
          <div>
            {categoryRows.map((cat) => (
              <div
                key={cat.id}
                onClick={isEditMode ? undefined : cat.onSelect}
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
                    {editingCategoryId === cat.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim()) {
                            onUpdateCategoryName?.(cat.id, editingName.trim());
                          }
                          setEditingCategoryId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingName.trim()) {
                              onUpdateCategoryName?.(cat.id, editingName.trim());
                            }
                            setEditingCategoryId(null);
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
                          setEditingCategoryId(cat.id);
                          setEditingName(cat.name);
                        }}
                        style={{ fontSize: 15, fontWeight: 600, cursor: 'pointer', borderBottom: '1px dashed #6E8C6A' }}
                      >
                        {cat.name}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{cat.name}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory?.({ id: cat.id, name: cat.name, createdBy: 'user' });
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
                      <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(cat.count)}</div>
                      <div style={{ fontSize: 14 }}>→</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCategory && (
          <ContentList
            items={categoryFilteredContents}
            emptyMessage={t.categoryEmpty}
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

