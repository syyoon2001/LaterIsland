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
}

export function CategoryTab({
  categoryRows,
  selectedCategory,
  categoryFilteredContents,
  backFromCategory,
  language,
}: CategoryTabProps) {
  const t = translations[language];

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
                onClick={cat.onSelect}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(63,82,64,0.12)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600 }}>{cat.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>{t.itemsCount(cat.count)}</div>
                  <div style={{ fontSize: 14 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCategory && (
          <ContentList items={categoryFilteredContents} emptyMessage={t.categoryEmpty} language={language} />
        )}
      </div>
    </div>
  );
}

