import { useEffect, useRef } from 'react';

const HEADER_HEIGHT = 76;

export function useScrollThumb(scrollElId: string) {
  const thumbRef = useRef<HTMLDivElement>(null);

  const updateThumb = () => {
    const scrollEl = document.getElementById(scrollElId);
    const thumbEl = thumbRef.current;
    if (!scrollEl || !thumbEl) return;
    const trackHeight = scrollEl.clientHeight;
    const shortThumbHeight = Math.max(24, trackHeight * 0.2);
    const scrollableDist = scrollEl.scrollHeight - scrollEl.clientHeight;
    const maxThumbTravel = trackHeight - shortThumbHeight;
    const ratio = scrollableDist > 0 ? scrollEl.scrollTop / scrollableDist : 0;
    thumbEl.style.height = shortThumbHeight + 'px';
    thumbEl.style.top = HEADER_HEIGHT + ratio * maxThumbTravel + 'px';
    thumbEl.style.opacity = scrollableDist > 0 ? '1' : '0';
  };

  useEffect(() => {
    const handler = () => updateThumb();
    document.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    const initialTimer = setTimeout(updateThumb, 50);
    return () => {
      document.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
      clearTimeout(initialTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateThumb, 0);
    return () => clearTimeout(timer);
  });

  return thumbRef;
}
