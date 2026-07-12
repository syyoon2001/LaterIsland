import type { CSSProperties, ReactNode } from 'react';
import type { Language } from '../types';

interface PhoneFrameProps {
  background: string;
  children: ReactNode;
  language?: Language;
}

const frameStyle = (background: string, language: Language): CSSProperties => ({
  background,
  color: '#3F5240',
  fontFamily: language === 'en' ? "'Plus Jakarta Sans', sans-serif" : "'Pretendard', sans-serif",
});

export function PhoneFrame({ background, children, language = 'ko' }: PhoneFrameProps) {
  return (
    <div className="phone-frame" style={frameStyle(background, language)}>
      {children}
    </div>
  );
}
