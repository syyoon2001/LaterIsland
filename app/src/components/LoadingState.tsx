import type { Language } from '../types';
import { translations } from '../data/translations';

interface LoadingStateProps {
  language: Language;
}

export function LoadingState({ language }: LoadingStateProps) {
  const t = translations[language];

  return (
    <div
      style={{
        padding: '60px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: 0.5,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '2.5px solid rgba(63,82,64,0.15)',
          borderTopColor: '#6E8C6A',
          animation: 'ls-spin 0.7s linear infinite',
        }}
      />
      <div style={{ fontSize: 13 }}>{t.loading}</div>
    </div>
  );
}
