import { Metadata } from 'next';
import { ActionIcon, ActionName } from '@/components/ActionIcon';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Action Icons — Design System',
};

const actions: ActionName[] = [
  'donate', 'buy', 'buyB2B', 'sell', 'consign', 'trade', 'repair',
  'recycle', 'compost', 'volunteer', 'refill', 'rent', 'process', 'dineOrDrink',
];

export default function ActionIconsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Action Icons</h1>
        <p className={styles.pageDescription}>
          Nine circular-economy actions, each with a dedicated icon and colorway. Two variants are available —{' '}
          <code>icon</code> (15px standalone) and <code>badge</code> (18px icon in a 32px colored container).
          Badge backgrounds use the 300-level surface of each action&apos;s color family.
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Icon</p>
        <div className={styles.componentRow}>
          {actions.map((name) => (
            <div key={name} className={styles.componentItem}>
              <ActionIcon action={name} variant="icon" />
              <span className={styles.typeSpecs}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Badge</p>
        <div className={styles.componentRow}>
          {actions.map((name) => (
            <div key={name} className={styles.componentItem}>
              <ActionIcon action={name} variant="badge" />
              <span className={styles.typeSpecs}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
