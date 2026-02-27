import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import styles from './Nav.module.scss';

export function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
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
      </div>

      {/* Desktop nav links */}
      <div className={styles.desktopRight}>
        <Link href="/about" className={styles.navLink}>About</Link>
        <Link href="/explore" className={styles.navLink}>Explore Systems</Link>
        <Button
          variant="accent"
          icon="fa-solid fa-arrow-right-long"
          iconPosition="right"
          className={styles.joinBtn}
        >
          Join the Directory
        </Button>
      </div>

      {/* Mobile hamburger */}
      <button className={styles.menuBtn} aria-label="Open navigation menu">
        <i className="fa-solid fa-bars" aria-hidden="true" />
      </button>
    </nav>
  );
}
