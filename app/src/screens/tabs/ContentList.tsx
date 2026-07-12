import { ContentCard } from '../../components/ContentCard';
import type { EnrichedContent, Language } from '../../types';

interface ContentListProps {
  items: EnrichedContent[];
  emptyMessage: string;
  language: Language;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
}

export function ContentList({
  items,
  emptyMessage,
  language,
  onEditItem,
  onDeleteItem,
}: ContentListProps) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4, fontSize: 13 }}>{emptyMessage}</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
          onUncomplete={item.onUncomplete}
          language={language}
          onEdit={onEditItem ? () => onEditItem(item.id) : undefined}
          onDelete={onDeleteItem ? () => onDeleteItem(item.id) : undefined}
        />
      ))}
    </div>
  );
}
