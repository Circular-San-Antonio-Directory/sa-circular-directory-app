'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ListingModal.module.scss';
import { ModalActionButton } from '@/components/ModalActionButton';

interface ListingModalProps {
  children: React.ReactNode;
  title?: string;
}

export function ListingModal({ children, title }: ListingModalProps) {
  const router = useRouter();

  const close = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [close]);

  useEffect(() => {
    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;
    const originalBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    const originalHtmlOverflow = html.style.overflow;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    html.style.overflow = 'hidden';

    return () => {
      body.style.overflow = originalBodyStyle.overflow;
      body.style.position = originalBodyStyle.position;
      body.style.top = originalBodyStyle.top;
      body.style.left = originalBodyStyle.left;
      body.style.right = originalBodyStyle.right;
      body.style.width = originalBodyStyle.width;
      html.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className={styles.overlay}
      onClick={close}
      aria-label="Close listing"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desktop: title + close button bar */}
        <div className={styles.closeButton}>
          {title && <span className={`label-large-strong ${styles.closeButtonTitle}`}>{title}</span>}
          <ModalActionButton surface="sunken" onClick={close} />
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
