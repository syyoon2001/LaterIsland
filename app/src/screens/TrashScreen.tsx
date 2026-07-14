import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { ContentCard } from '../components/ContentCard';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { useScrollThumb } from './useScrollThumb';

interface TrashItem {
  id: string;
  type: 'category' | 'tag' | 'content';
  title: string;
  summary?: string;
  categoryName?: string;
  tagNames?: string[];
  url?: string;
  imagePublicId?: string | null;
  imageUrl?: string | null;
}

interface TrashScreenProps {
  language: Language;
  onBack: () => void;
  trashItems: TrashItem[];
  restoreTrashItem: (id: string) => void;
  openConfirmDeleteSelectedPermanently: (ids: string[], onDone?: () => void) => void;
}

export function TrashScreen({
  language,
  onBack,
  trashItems,
  restoreTrashItem,
  openConfirmDeleteSelectedPermanently,
}: TrashScreenProps) {
  const t = translations[language];
  const thumbRef = useScrollThumb('trash-scroll-content');

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAllSelected = trashItems.length > 0 && trashItems.every((item) => selectedIds.includes(item.id));

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : trashItems.map((item) => item.id));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteSelected = () => {
    openConfirmDeleteSelectedPermanently(selectedIds, () => setSelectedIds([]));
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#E6F1E3', display: 'flex', flexDirection: 'column', zIndex: 15 }}>
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
          onClick={toggleSelectMode}
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
          {selectMode ? t.selectModeDone : t.selectMode}
        </button>
      </div>

      {/* Content */}
      <div
        id="trash-scroll-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}
      >
        {selectMode && trashItems.length > 0 && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
            <button
              type="button"
              onClick={toggleSelectAll}
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
              {t.selectAll}
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
                cursor: selectedIds.length === 0 ? 'default' : 'pointer',
                fontFamily: 'inherit',
                opacity: selectedIds.length === 0 ? 0.5 : 1,
              }}
            >
              {t.delete}
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
                imagePublicId={item.imagePublicId}
                imageUrl={item.imageUrl}
                categoryName={item.categoryName}
                tagNames={item.tagNames}
                status="trash"
                onRestore={() => restoreTrashItem(item.id)}
                language={language}
                isSelectMode={selectMode}
                selected={selectedIds.includes(item.id)}
                onToggleSelect={() => toggleSelectItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          right: 3,
          width: 4,
          borderRadius: 4,
          background: '#E0E8E1',
          top: 76,
          height: '20%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
