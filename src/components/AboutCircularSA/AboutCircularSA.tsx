import { Button } from '@/components/Button';
import styles from './AboutCircularSA.module.scss';

interface AboutCircularSAProps {
  /** Removes the photo and uses compact mobile padding/typography */
  mobile?: boolean;
}

export function AboutCircularSA({ mobile = false }: AboutCircularSAProps) {
  return (
    <section className={`${styles.root}${mobile ? ` ${styles.rootMobile}` : ''}`}>
      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/circular-sa-logo-white.svg"
            alt="Circular San Antonio"
            className={styles.logo}
          />
          <h2 className={styles.heading}>
            <span className={styles.headingDefault}>
              This directory is built and maintained by{' '}
            </span>
            <span className={styles.headingAccent}>Circular San Antonio.</span>
          </h2>
          <p className={styles.body}>
            Circular San Antonio is a locally rooted nonprofit doing the work of
            keeping materials in use by fostering economic innovation, community
            connection, and cross-sector collaboration.
          </p>
        </div>
        <div className={styles.actions}>
          <a href="https://www.circularsanantonio.org/" target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
            <Button variant="accent" surface="dark">
              Learn More
            </Button>
          </a>
          <a href="https://www.circularsanantonio.org/join" target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
            <Button variant="secondary" surface="dark">
              Explore Membership
            </Button>
          </a>
        </div>
      </div>

      {!mobile && (
        <div className={styles.imageSection} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img
            src="/images/stroked-border-rectangle.svg"
            alt=""
            className={styles.strokeBorder}
          /> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/circular-sa-group-2.png"
            alt=""
            className={styles.photo}
          />
        </div>
      )}
    </section>
  );
}
