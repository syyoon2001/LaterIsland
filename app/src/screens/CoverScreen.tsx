import { PhoneFrame } from '../components/PhoneFrame';
import type { Language } from '../types';

interface CoverScreenProps {
  onEnter: () => void;
  language: Language;
}

export function CoverScreen({ onEnter, language }: CoverScreenProps) {
  return (
    <PhoneFrame background="#E6F1E3" language={language}>
      <button
        type="button"
        onClick={onEnter}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          textDecoration: 'none',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <img src="/assets/logo-book.png" alt="" style={{ width: 190, height: 190, objectFit: 'contain' }} />
        <img
          src="/assets/logo-wordmark.png"
          alt="Later Island"
          style={{ width: 220, objectFit: 'contain', marginTop: -14 }}
        />
      </button>
    </PhoneFrame>
  );
}
