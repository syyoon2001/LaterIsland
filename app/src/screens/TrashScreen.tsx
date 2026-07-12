import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ContentCard } from '../components/ContentCard';
import type { Language } from '../types';
import { translations } from '../data/translations';

interface TrashItem {
  id: string;
  type: 'category' | 'tag' | 'content';
  title: string;
  summary?: string;
  categoryName?: string;
  tagNames?: string[];
  url?: string;
}

interface TrashScreenProps {
  language: Language;
  onBack: () => void;
  trashItems: TrashItem[];
  restoreTrashItem: (id: string) => void;
  openConfirmDeleteSelected: (selectedIds: string[], isTrash: boolean) => void;
}

export function TrashScreen({
  language,
  onBack,
  trashItems,
  restoreTrashItem,
  openConfirmDeleteSelected,
}: TrashScreenProps) {
  const t = translations[language];
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = trashItems.length > 0 && trashItems.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const itemIds = trashItems.map((x) => x.id);
      setSelectedIds(selectedIds.filter((id) => !itemIds.includes(id)));
    } else {
      const itemIds = trashItems.map((x) => x.id);
      const newSelected = Array.from(new Set([...selectedIds, ...itemIds]));
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const presentSelected = trashItems.map((x) => x.id).filter((id) => selectedIds.includes(id));
    if (presentSelected.length > 0) {
      openConfirmDeleteSelected(presentSelected, true);
    }
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F7F9F2', display: 'flex', flexDirection: 'column', zIndex: 15 }}>
      {/* Header */}
      <div
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          borderBottom: '1px solid rgba(63,82,64,0.12)',
          background: '#E6F1E3',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <BackButton onClick={onBack} size={36} />
        <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{t.trash}</div>
        <button
          type="button"
          onClick={() => {
            setIsEditMode(!isEditMode);
            setSelectedIds([]);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#3F5240',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {isEditMode ? (language === 'ko' ? '완료' : 'Done') : (language === 'ko' ? '편집' : 'Edit')}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}
      >
        {isEditMode && trashItems.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              style={{
                border: '1px solid rgba(63,82,64,0.3)',
                background: isAllSelected ? '#6E8C6A' : '#fff',
                color: isAllSelected ? '#fff' : '#3F5240',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {language === 'ko' ? '전체 선택' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              style={{
                border: '1px solid #B15C4A',
                background: '#B15C4A',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: selectedIds.length === 0 ? 0.5 : 1,
              }}
            >
              {language === 'ko' ? '삭제' : 'Delete'}
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => {
                setIsEditMode(false);
                setSelectedIds([]);
              }}
              style={{
                border: '1px solid rgba(63,82,64,0.3)',
                background: '#fff',
                color: '#3F5240',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {language === 'ko' ? '완료' : 'Done'}
            </button>
          </div>
        )}

        {trashItems.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4, fontSize: 13 }}>
            {language === 'ko' ? '휴지통이 비어 있습니다' : 'Trash is empty'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {trashItems.map((item) => (
              <ContentCard
                key={item.id}
                title={item.title}
                summary={item.summary}
                url={item.url}
                categoryName={item.categoryName}
                tagNames={item.tagNames}
                status="trash"
                onRestore={() => restoreTrashItem(item.id)}
                language={language}
                isEditMode={isEditMode}
                selected={selectedIds.includes(item.id)}
                onToggleSelect={() => {
                  const has = selectedIds.includes(item.id);
                  setSelectedIds(
                    has ? selectedIds.filter((x) => x !== item.id) : [...selectedIds, item.id]
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
