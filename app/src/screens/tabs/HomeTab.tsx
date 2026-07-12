import { ContentList } from './ContentList';
import type { EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface HomeTabProps {
  pendingContents: EnrichedContent[];
  language: Language;
  onEditItem?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
}

export function HomeTab({
  pendingContents,
  language,
  onEditItem,
  onDeleteItem,
}: HomeTabProps) {
  const t = translations[language];

  return (
    <div data-screen-label={language === 'ko' ? '홈' : 'Home'}>
      <div style={{ padding: 20 }}>
        <ContentList
          items={pendingContents}
          emptyMessage={t.homeEmpty}
          language={language}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      </div>
    </div>
  );
}
