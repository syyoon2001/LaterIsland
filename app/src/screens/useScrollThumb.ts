import { useEffect, useRef } from 'react';

const HEADER_HEIGHT = 76;

export function useScrollThumb(scrollElId: string, headerHeight = HEADER_HEIGHT) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const updateThumb = (isScrolling = false) => {
    const scrollEl = document.getElementById(scrollElId);
    const thumbEl = thumbRef.current;
    if (!scrollEl || !thumbEl) return;
    
    const trackHeight = scrollEl.clientHeight;
    const shortThumbHeight = Math.max(24, trackHeight * 0.2);
    const scrollableDist = scrollEl.scrollHeight - scrollEl.clientHeight;
    const maxThumbTravel = trackHeight - shortThumbHeight;
    const ratio = scrollableDist > 0 ? scrollEl.scrollTop / scrollableDist : 0;
    
    thumbEl.style.height = shortThumbHeight + 'px';
    thumbEl.style.top = headerHeight + ratio * maxThumbTravel + 'px';
    thumbEl.style.transition = 'opacity 0.3s ease';

    if (scrollableDist > 0 && isScrolling) {
      thumbEl.style.opacity = '1';
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        if (thumbRef.current) {
          thumbRef.current.style.opacity = '0';
        }
      }, 1000);
    } else if (!isScrolling && scrollableDist <= 0) {
      thumbEl.style.opacity = '0';
    }
  };

  useEffect(() => {
    if (thumbRef.current) {
      thumbRef.current.style.opacity = '0';
    }
    const handler = (e: Event) => {
      if (e.target === document.getElementById(scrollElId)) {
        updateThumb(true);
      }
    };
    const resizeHandler = () => updateThumb(false);

    document.addEventListener('scroll', handler, true);
    window.addEventListener('resize', resizeHandler);
    
    return () => {
      document.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', resizeHandler);
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [scrollElId]);

  useEffect(() => {
    const timer = setTimeout(() => updateThumb(false), 0);
    return () => clearTimeout(timer);
  });

  return thumbRef;
}
