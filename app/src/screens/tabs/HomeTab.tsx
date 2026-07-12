import { ContentList } from './ContentList';
import type { EnrichedContent, Language } from '../../types';
import { translations } from '../../data/translations';

interface HomeTabProps {
  pendingContents: EnrichedContent[];
  language: Language;
  isEditMode?: boolean;
  selectedContentIds?: string[];
  setSelectedContentIds?: (ids: string[]) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onExitEditMode?: () => void;
  onUpdateContent?: (id: string, fields: any) => void;
}

export function HomeTab({
  pendingContents,
  language,
  isEditMode,
  selectedContentIds,
  setSelectedContentIds,
  onDeleteSelected,
  onExitEditMode,
  onUpdateContent,
}: HomeTabProps) {
  const t = translations[language];

  return (
    <div data-screen-label={language === 'ko' ? '홈' : 'Home'}>
      <div style={{ padding: 20 }}>
        <ContentList
          items={pendingContents}
          emptyMessage={t.homeEmpty}
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

