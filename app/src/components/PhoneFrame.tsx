import type { CSSProperties, ReactNode } from 'react';
import type { Language } from '../types';

interface PhoneFrameProps {
  background: string;
  children: ReactNode;
  language?: Language;
}

const frameStyle = (background: string, language: Language): CSSProperties => ({
  aspectRatio: '9 / 16',
  height: '100vh',
  maxHeight: '100vh',
  width: 'min(100vw, calc(100vh * 9 / 16))',
  background,
  color: '#3F5240',
  fontFamily: language === 'en' ? "'Plus Jakarta Sans', sans-serif" : "'Pretendard', sans-serif",
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(63,82,64,0.15)',
  borderRadius: 28,
  boxShadow: '0 8px 30px rgba(63,82,64,0.12)',
  boxSizing: 'border-box',
});

export function PhoneFrame({ background, children, language = 'ko' }: PhoneFrameProps) {
  return <div style={frameStyle(background, language)}>{children}</div>;
}

