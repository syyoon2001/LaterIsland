import { ContentList } from './ContentList';
import type { EnrichedContent } from '../../types';

interface DoneTabProps {
  doneContents: EnrichedContent[];
}

export function DoneTab({ doneContents }: DoneTabProps) {
  return (
    <div data-screen-label="완료함">
      <div style={{ padding: 20 }}>
        <ContentList items={doneContents} emptyMessage="완료한 콘텐츠가 없어요" />
      </div>
    </div>
  );
}
