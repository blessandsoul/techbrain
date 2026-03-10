'use client';

import { useState, useEffect, useCallback } from 'react';

export function ReadingProgress(): React.ReactElement {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback((): void => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    setProgress(Math.min((scrollTop / docHeight) * 100, 100));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return (): void => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="fixed top-17 left-0 right-0 z-40 h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
