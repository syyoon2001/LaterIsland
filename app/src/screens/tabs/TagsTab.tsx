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
}

export function TagsTab({ tagRows, selectedTag, tagFilteredContents, backFromTag, language }: TagsTabProps) {
  const t = translations[language];

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
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(tag.count)}</div>
                  <div style={{ fontSize: 14 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTag && <ContentList items={tagFilteredContents} emptyMessage={t.tagsEmpty} language={language} />}
      </div>
    </div>
  );
}

