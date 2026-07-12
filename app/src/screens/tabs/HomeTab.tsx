import { ContentList } from './ContentList';
import type { EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface HomeTabProps {
  pendingContents: EnrichedContent[];
  language: Language;
}

export function HomeTab({ pendingContents, language }: HomeTabProps) {
  const t = translations[language];

  return (
    <div data-screen-label={language === 'ko' ? '홈' : 'Home'}>
      <div style={{ padding: 20 }}>
        <ContentList items={pendingContents} emptyMessage={t.homeEmpty} language={language} />
      </div>
    </div>
  );
}

