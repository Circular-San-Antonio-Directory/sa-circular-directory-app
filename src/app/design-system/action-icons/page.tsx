import { Metadata } from 'next';
import { ActionIcon, ActionName } from '@/components/ActionIcon';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Action Icons — Design System',
};

const actions: { name: ActionName; label: string; color: string; iconFile: string }[] = [
  { name: 'donate',      label: 'Donate',       color: 'Blue',     iconFile: 'Action-3' },
  { name: 'buy',         label: 'Buy',           color: 'Fern', iconFile: 'Action-2' },
  { name: 'sell',        label: 'Sell',          color: 'Violet',   iconFile: 'Action-9' },
  { name: 'trade',       label: 'Trade',         color: 'Spruce',   iconFile: 'Action-4' },
  { name: 'repair',      label: 'Repair',        color: 'Orange',   iconFile: 'Action-5' },
  { name: 'recycle',     label: 'Recycle',       color: 'Merlot',   iconFile: 'Action-6' },
  { name: 'compost',     label: 'Compost',       color: 'Blue',     iconFile: 'Action-7' },
  { name: 'volunteer',   label: 'Volunteer',     color: 'Fern', iconFile: 'Action-8' },
  { name: 'refill',      label: 'Refill',        color: 'Mint Choc',   iconFile: 'Action-2' },
  { name: 'dineOrDrink', label: 'Dine or Drink', color: 'OffWhite', iconFile: 'Action-1' },
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
          {actions.map(({ name, label, iconFile }) => (
            <div key={name} className={styles.componentItem}>
              <ActionIcon action={name} variant="icon" />
              <span className={styles.typeSpecs}>{label}</span>
              <span className={styles.typeSpecs}>{iconFile}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Badge</p>
        <div className={styles.componentRow}>
          {actions.map(({ name, label, color, iconFile }) => (
            <div key={name} className={styles.componentItem}>
              <ActionIcon action={name} variant="badge" />
              <span className={styles.typeSpecs}>{label}</span>
              <span className={styles.typeSpecs}>{color}-300 · {iconFile}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
