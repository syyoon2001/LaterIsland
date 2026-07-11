import type { CSSProperties, ReactNode } from 'react';

interface PhoneFrameProps {
  background: string;
  children: ReactNode;
}

const frameStyle = (background: string): CSSProperties => ({
  aspectRatio: '9 / 16',
  height: '100vh',
  maxHeight: '100vh',
  width: 'min(100vw, calc(100vh * 9 / 16))',
  background,
  color: '#3F5240',
  fontFamily: "'Space Grotesk', sans-serif",
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(63,82,64,0.15)',
  borderRadius: 28,
  boxShadow: '0 8px 30px rgba(63,82,64,0.12)',
  boxSizing: 'border-box',
});

export function PhoneFrame({ background, children }: PhoneFrameProps) {
  return <div style={frameStyle(background)}>{children}</div>;
}
