'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ModalActionButton } from '@/components/ModalActionButton';
import styles from './MobileBackButton.module.scss';

interface MobileBackButtonProps {
  name?: string;
}

export function MobileBackButton({ name }: MobileBackButtonProps) {
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
    const onScroll = () => setScrolled(scrollEl.scrollTop > 4);
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className={`${styles.bar}${scrolled ? ` ${styles.scrolled}` : ''}`}
    >
      {name && <span className={`${styles.name}${scrolled ? ` ${styles.nameVisible}` : ''} label-small`}>{name}</span>}
      <ModalActionButton
        icon="fa-solid fa-xmark"
        surface="transparent"
        className={scrolled ? undefined : styles.photoOverlay}
        onClick={() => router.back()}
        aria-label="Close"
      />
    </div>
  );
}
