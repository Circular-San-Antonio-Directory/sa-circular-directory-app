'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Banner.module.scss';

const DESKTOP_BREAKPOINT = 820;
const HIDE_DURATION = 350;

interface BannerProps {
  dismissable?: boolean;
}

function BannerContent({ dismissable = false }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [hiding, setHiding] = useState(false);

  function dismiss() {
    setHiding(true);
    setTimeout(() => {
      setDismissed(true);
      setHiding(false);
    }, HIDE_DURATION);
  }

  function handleFeedbackClick(e: React.MouseEvent) {
    e.preventDefault();
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      window.dispatchEvent(new CustomEvent('open-feedback-overlay'));
    } else {
      document.getElementById('questions-feedback')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (dismissed) return null;

  return (
    <div className={`${styles.banner}${hiding ? ` ${styles.hiding}` : ''}`} role="banner">
      <p className={styles.text}>
        {/* <i className={`fa-solid fa-seedling ${styles.icon}`} aria-hidden="true" /> */}
        This platform is freshly launched!
        <button className={styles.link} onClick={handleFeedbackClick}>
          Share your feedback
        </button>
      </p>
      {dismissable && (
        <button
          className={styles.closeBtn}
          onClick={dismiss}
          aria-label="Dismiss banner"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function Banner(props: BannerProps) {
  const pathname = usePathname();
  return <BannerContent key={pathname} {...props} />;
}
