'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PageTransition.module.scss';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // requestAnimationFrame ensures the browser paints the initial (translated,
    // invisible) state before we add .entered and start the transition.
    const raf = requestAnimationFrame(() => {
      el.classList.add(styles.entered);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start tracking if the page is scrolled to the top
    if (window.scrollY <= 4) {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaT = Date.now() - touchStartTime.current;
    // Swipe down: >80px fast, or >140px any speed
    if (deltaY > 80 && (deltaT < 500 || deltaY > 140)) {
      router.back();
    }
    touchStartY.current = null;
  };

  return (
    <div
      ref={ref}
      className={styles.root}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
