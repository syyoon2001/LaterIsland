import { useState } from 'react';
import { ContentCard } from './components/ContentCard';

export default function App() {
  const [done, setDone] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e6f1e3',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 20,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: 390,
        margin: '0 auto',
      }}
    >
      <ContentCard
        title="AI 시대의 글쓰기: 왜 여전히 손으로 써야 하는가"
        summary="AI가 문장을 대신 써주는 시대에도 손글씨가 사고를 정리하는 데 어떤 역할을 하는지 다룬 에세이."
        url="https://example.com/writing-in-the-age-of-ai"
        categoryName="글"
        tagNames={['생산성', '글쓰기']}
        status={done ? 'done' : 'pending'}
        onComplete={() => setDone(true)}
      />
      <ContentCard
        title="완료된 콘텐츠 카드 예시"
        categoryName="영상"
        tagNames={['디자인']}
        status="done"
      />
      <ContentCard title="요약도 링크도 없는 최소 카드" categoryName="기타" />
    </div>
  );
}
