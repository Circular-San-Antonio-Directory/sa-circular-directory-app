'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './MobileBackButton.module.scss';

export function MobileBackButton() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Walk up the DOM to find the nearest scrollable ancestor (the modal's .content div)
    let el: HTMLElement | null = barRef.current?.parentElement ?? null;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      el = el.parentElement;
    }
    if (!el) return;

    const scrollEl = el;
    const onScroll = () => setScrolled(scrollEl.scrollTop > 160);
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className={`${styles.bar}${scrolled ? ` ${styles.scrolled}` : ''}`}
    >
      <button
        className={`${styles.button}${scrolled ? ` ${styles.buttonScrolled}` : ''}`}
        onClick={() => router.back()}
        aria-label="Back"
      >
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
    </div>
  );
}
