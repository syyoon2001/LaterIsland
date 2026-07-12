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

  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onUpdateCategoryName?: (id: string, newName: string) => void;
  onDeleteCategory?: (cat: Category) => void;
}

export function CategoryTab({
  categoryRows,
  selectedCategory,
  categoryFilteredContents,
  backFromCategory,
  language,
  onEditItem,
  onDeleteItem,
  onUpdateCategoryName,
  onDeleteCategory,
}: CategoryTabProps) {
  const t = translations[language];

  // Kebab state
  const [kebabOpenId, setKebabOpenId] = useState<string | null>(null);
  const [hoveredKebabItemId, setHoveredKebabItemId] = useState<string | null>(null);

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
                onClick={editingCategoryId === cat.id ? undefined : cat.onSelect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(63,82,64,0.12)',
                  cursor: editingCategoryId === cat.id ? 'default' : 'pointer',
                }}
              >
                {/* Kebab menu on the left end */}
                <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setKebabOpenId(kebabOpenId === cat.id ? null : cat.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
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

                  {kebabOpenId === cat.id && (
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
                            setEditingCategoryId(cat.id);
                            setEditingName(cat.name);
                            setKebabOpenId(null);
                          }}
                          onMouseEnter={() => setHoveredKebabItemId(`edit_${cat.id}`)}
                          onMouseLeave={() => setHoveredKebabItemId(null)}
                          style={{
                            padding: '8px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: 6,
                            textAlign: 'center',
                            color: '#3F5240',
                            background: hoveredKebabItemId === `edit_${cat.id}` ? 'rgba(63,82,64,0.08)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {language === 'ko' ? '편집' : 'Edit'}
                        </div>
                        <div
                          onClick={() => {
                            onDeleteCategory?.({ id: cat.id, name: cat.name, createdBy: 'user' });
                            setKebabOpenId(null);
                          }}
                          onMouseEnter={() => setHoveredKebabItemId(`del_${cat.id}`)}
                          onMouseLeave={() => setHoveredKebabItemId(null)}
                          style={{
                            padding: '8px 12px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: 6,
                            textAlign: 'center',
                            color: '#B15C4A',
                            background: hoveredKebabItemId === `del_${cat.id}` ? 'rgba(63,82,64,0.08)' : 'transparent',
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
                  onClick={(e) => editingCategoryId === cat.id && e.stopPropagation()}
                >
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
                        width: '80%',
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{cat.name}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(cat.count)}</div>
                  <div style={{ fontSize: 14 }}>→</div>
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
            onEditItem={onEditItem}
            onDeleteItem={onDeleteItem}
          />
        )}
      </div>
    </div>
  );
}
