import { ContentList } from './ContentList';
import type { EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface DoneTabProps {
  doneContents: EnrichedContent[];
  language: Language;
  isEditMode?: boolean;
  selectedContentIds?: string[];
  setSelectedContentIds?: (ids: string[]) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onExitEditMode?: () => void;
  onUpdateContent?: (id: string, fields: any) => void;
}

export function DoneTab({
  doneContents,
  language,
  isEditMode,
  selectedContentIds,
  setSelectedContentIds,
  onDeleteSelected,
  onExitEditMode,
  onUpdateContent,
}: DoneTabProps) {
  const t = translations[language];

  return (
    <div data-screen-label={language === 'ko' ? '완료함' : 'Done'}>
      <div style={{ padding: 20 }}>
        <ContentList
          items={doneContents}
          emptyMessage={t.doneEmpty}
          language={language}
          isEditMode={isEditMode}
          selectedContentIds={selectedContentIds}
          setSelectedContentIds={setSelectedContentIds}
          onDeleteSelected={onDeleteSelected}
          onExitEditMode={onExitEditMode}
          onUpdateContent={onUpdateContent}
        />
      </div>
    </div>
  );
}

