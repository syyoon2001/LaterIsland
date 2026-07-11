import { BackButton } from '../../components/BackButton';
import { ContentList } from './ContentList';
import type { EnrichedContent, Tag } from '../../types';

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
}

export function TagsTab({ tagRows, selectedTag, tagFilteredContents, backFromTag }: TagsTabProps) {
  return (
    <div data-screen-label="태그 모음">
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
                onClick={tag.onSelect}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(63,82,64,0.12)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>#{tag.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{tag.count}개</div>
                  <div style={{ fontSize: 14 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTag && <ContentList items={tagFilteredContents} emptyMessage="해당 태그의 콘텐츠가 없어요" />}
      </div>
    </div>
  );
}
