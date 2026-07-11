import { ContentList } from './ContentList';
import type { EnrichedContent } from '../../types';

interface HomeTabProps {
  pendingContents: EnrichedContent[];
}

export function HomeTab({ pendingContents }: HomeTabProps) {
  return (
    <div data-screen-label="홈">
      <div style={{ padding: 20 }}>
        <ContentList items={pendingContents} emptyMessage="아직 저장한 콘텐츠가 없어요" />
      </div>
    </div>
  );
}
