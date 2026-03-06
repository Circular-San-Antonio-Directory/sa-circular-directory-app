import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import styles from './Nav.module.scss';

export function Nav() {
  return (
    <nav className={styles.nav}>
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
        <a
          href="https://www.circularsanantonio.org/projects/directory"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.joinLink}
        >
          <Button
            variant="accent"
            icon="fa-solid fa-arrow-right-long"
            iconPosition="right"
          >
            Join the Directory
          </Button>
        </a>
      </div>

      {/* Mobile hamburger */}
      <button className={styles.menuBtn} aria-label="Open navigation menu">
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>
    </nav>
  );
}
