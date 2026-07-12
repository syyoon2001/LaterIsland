import { ContentCard } from '../../components/ContentCard';
import type { EnrichedContent, Language } from '../../types';

interface ContentListProps {
  items: EnrichedContent[];
  emptyMessage: string;
  language: Language;
  isEditMode?: boolean;
  selectedContentIds?: string[];
  setSelectedContentIds?: (ids: string[]) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onExitEditMode?: () => void;
  onUpdateContent?: (id: string, fields: { title?: string; summary?: string; url?: string; tagNames?: string[] }) => void;
}

export function ContentList({
  items,
  emptyMessage,
  language,
  isEditMode = false,
  selectedContentIds = [],
  setSelectedContentIds,
  onDeleteSelected,
  onExitEditMode,
  onUpdateContent,
}: ContentListProps) {
  const isAllSelected = items.length > 0 && items.every((item) => selectedContentIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (!setSelectedContentIds) return;
    const itemIds = items.map((x) => x.id);
    if (isAllSelected) {
      setSelectedContentIds(selectedContentIds.filter((id) => !itemIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedContentIds, ...itemIds]));
      setSelectedContentIds(newSelected);
    }
  };

  const handleDelete = () => {
    if (selectedContentIds.length === 0) return;
    const presentSelected = items.map((x) => x.id).filter((id) => selectedContentIds.includes(id));
    if (presentSelected.length > 0) {
      onDeleteSelected?.(presentSelected);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4, fontSize: 13 }}>{emptyMessage}</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isEditMode && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
            onClick={handleDelete}
            disabled={selectedContentIds.length === 0}
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
              opacity: selectedContentIds.length === 0 ? 0.5 : 1,
            }}
          >
            {language === 'ko' ? '삭제' : 'Delete'}
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onExitEditMode}
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

      {items.map((item) => (
        <ContentCard
          key={item.id}
          title={item.title}
          summary={item.summary}
          url={item.url ?? undefined}
          categoryName={item.categoryName}
          tagNames={item.tagNames}
          status={item.status}
          onComplete={item.onComplete}
          language={language}
          isEditMode={isEditMode}
          selected={selectedContentIds.includes(item.id)}
          onToggleSelect={() => {
            if (!setSelectedContentIds) return;
            const has = selectedContentIds.includes(item.id);
            setSelectedContentIds(
              has ? selectedContentIds.filter((x) => x !== item.id) : [...selectedContentIds, item.id]
            );
          }}
          onUpdateContent={(fields) => {
            if (fields.tagNames) {
              onUpdateContent?.(item.id, { tagNames: fields.tagNames } as any);
            } else {
              onUpdateContent?.(item.id, fields);
            }
          }}
        />
      ))}
    </div>
  );
}


