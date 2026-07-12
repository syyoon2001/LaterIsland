import { ContentList } from './ContentList';
import type { EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface DoneTabProps {
  doneContents: EnrichedContent[];
  language: Language;
}

export function DoneTab({ doneContents, language }: DoneTabProps) {
  const t = translations[language];

  return (
    <div data-screen-label={language === 'ko' ? '완료함' : 'Done'}>
      <div style={{ padding: 20 }}>
        <ContentList items={doneContents} emptyMessage={t.doneEmpty} language={language} />
      </div>
    </div>
  );
}

