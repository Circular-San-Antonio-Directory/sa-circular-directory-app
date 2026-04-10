'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import styles from './Nav.module.scss';

const CLOSE_DURATION = 180; // ms — must match menuSlideOut duration in SCSS

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const THRESHOLD = 24; // $space-6 — matches pageInner padding-top on desktop
    function onScroll() {
      setScrolled(window.scrollY >= THRESHOLD);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function close() {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, CLOSE_DURATION);
  }

  return (
    <>
      <nav className={`${styles.nav}${scrolled ? ` ${styles.navScrolled}` : ''}`}>
        <Link href="/" className={styles.left}>
          <div className={styles.logoWrapper}>
            <Image
              src="/images/DirectoryLogo.svg"
              alt="SA Circular Directory logo"
              width={44}
              height={44}
              className={styles.logoImg}
            />
          </div>
          <div className={styles.wordmark}>
            <span className={styles.wordmarkTop}>San Antonio</span>
            <span className={styles.wordmarkBottom}>Circular Directory</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className={styles.desktopRight}>
          <div className={styles.navActions}>
            {/* <Button variant="ghost">Map</Button> */}
            <a
              href="https://www.circularsanantonio.org/projects/directory"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.joinLink}
            >
              <Button
                variant="secondary"
                icon="fa-solid fa-arrow-right-long"
                iconPosition="right"
              >
                Join the Directory
              </Button>
            </a>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className={styles.menuBtn}
          aria-label="Open navigation menu"
          onClick={() => setIsOpen(true)}
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile menu overlay — rendered outside <nav> to escape its stacking context */}
      {isOpen && (
        <div
          className={`${styles.mobileMenu} ${isClosing ? styles.mobileMenuClosing : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className={styles.mobileHeader}>
            <Link href="/" className={styles.left} onClick={close}>
              <div className={styles.logoWrapper}>
                <Image
                  src="/images/DirectoryLogo.svg"
                  alt="SA Circular Directory logo"
                  width={44}
                  height={44}
                  className={`${styles.logoImg} ${styles.logoImgInverse}`}
                />
              </div>
              <div className={styles.wordmarkInverse}>
                <span className={styles.wordmarkTop}>San Antonio</span>
                <span className={styles.wordmarkBottom}>Circular Directory</span>
              </div>
            </Link>
            <button
              className={styles.closeBtn}
              aria-label="Close navigation menu"
              onClick={close}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div className={styles.mobileBody}>
            <div className={styles.primaryLinks}>
              {/* <Link href="/" className={styles.primaryItem} onClick={close}>Map</Link> */}
              <a
                href="https://www.circularsanantonio.org/projects/directory"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryItem}
                onClick={close}
              >
                Join the Directory
                <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
              </a>
            </div>

            <div className={styles.secondaryLinks}>
              <span className={styles.secondaryItem}>
                Questions and Feedback
              </span>
              <a
                href="https://www.circularsanantonio.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryItem}
              >
                About Circular San Antonio
                <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
