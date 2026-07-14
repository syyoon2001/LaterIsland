import { PhoneFrame } from '../components/PhoneFrame';
import type { Language } from '../types';

interface CoverScreenProps {
  language: Language;
}

// Purely a splash screen: it auto-advances on a timer (see App.tsx) and has
// no interaction of its own, so it must not respond to taps/clicks at all.
export function CoverScreen({ language }: CoverScreenProps) {
  return (
    <PhoneFrame background="#E6F1E3" language={language}>
      <div
        className="cover-screen"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <img src="/assets/logo-book.png" alt="" style={{ width: 190, height: 190, objectFit: 'contain' }} />
        <img
          src="/assets/logo-wordmark.png"
          alt="Later Island"
          style={{ width: 220, objectFit: 'contain', marginTop: -14 }}
        />
      </div>
    </PhoneFrame>
  );
}
