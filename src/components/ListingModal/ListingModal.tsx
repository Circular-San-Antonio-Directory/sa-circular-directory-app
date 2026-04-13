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
