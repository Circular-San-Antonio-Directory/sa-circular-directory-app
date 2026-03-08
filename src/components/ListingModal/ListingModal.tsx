'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ListingModal.module.scss';
import { ModalActionButton } from '@/components/ModalActionButton';

interface ListingModalProps {
  children: React.ReactNode;
}

export function ListingModal({ children }: ListingModalProps) {
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
        {/* Desktop: floating X button */}
        <div className={styles.closeButton}>
          <ModalActionButton surface="sunken" onClick={close} />
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
