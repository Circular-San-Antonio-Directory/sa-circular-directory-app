import { Metadata } from 'next';
import { Pill, PillColor } from '@/components/Pill';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Pills — Design System',
};

const colors: { color: PillColor; label: string }[] = [
  { color: 'blue',      label: 'Blue' },
  { color: 'orange',    label: 'Orange' },
  { color: 'merlot',    label: 'Merlot' },
  { color: 'fern',      label: 'Fern' },
  { color: 'violet',    label: 'Violet' },
  { color: 'spruce',    label: 'Spruce' },
  { color: 'mintChoc',  label: 'Mint Choc' },
  { color: 'redAdobe',  label: 'Red Adobe' },
  { color: 'mono',      label: 'Mono' },
  { color: 'offWhite',  label: 'Off White' },
];

export default function PillsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pills</h1>
        <p className={styles.pageDescription}>
          Compact labels used to tag or categorize content. Two sizes (<code>small</code>, <code>large</code>),
          ten colorways, and an optional leading icon.
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Large — with icon</p>
        <div className={styles.componentRow}>
          {colors.map(({ color, label }) => (
            <div key={color} className={styles.componentItem}>
              <Pill label={label} color={color} size="large" icon="fa-solid fa-shirt" />
              <span className={styles.typeSpecs}>{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Large — no icon</p>
        <div className={styles.componentRow}>
          {colors.map(({ color, label }) => (
            <div key={color} className={styles.componentItem}>
              <Pill label={label} color={color} size="large" />
              <span className={styles.typeSpecs}>{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Small — with icon</p>
        <div className={styles.componentRow}>
          {colors.map(({ color, label }) => (
            <div key={color} className={styles.componentItem}>
              <Pill label={label} color={color} size="small" icon="fa-solid fa-shirt" />
              <span className={styles.typeSpecs}>{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Small — no icon</p>
        <div className={styles.componentRow}>
          {colors.map(({ color, label }) => (
            <div key={color} className={styles.componentItem}>
              <Pill label={label} color={color} size="small" />
              <span className={styles.typeSpecs}>{color}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
