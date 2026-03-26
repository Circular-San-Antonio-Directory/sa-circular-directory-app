import { Metadata } from 'next';
import { ActionIcon, ActionName } from '@/components/ActionIcon';
import { ICON_SVGS } from '@/components/ActionIcon/IconSVGs';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Action Icons — Design System',
};

const actions: ActionName[] = [
  'donate', 'buy', 'buyB2B', 'sell', 'consign', 'trade', 'repair',
  'recycle', 'compost', 'volunteer', 'refill', 'rent', 'process', 'dineOrDrink',
];

const svgKeys = Object.keys(ICON_SVGS).sort((a, b) => {
  const n = (k: string) => parseInt(k.replace('Icon-', ''), 10);
  return n(a) - n(b);
});

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
        <p className={styles.sectionHeading}>SVG Reference — By Number</p>
        <div className={styles.iconGrid}>
          {svgKeys.map((key) => {
            const SvgIcon = ICON_SVGS[key];
            return (
              <div key={key} className={styles.iconItem}>
                <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                  <SvgIcon primary="var(--text-default)" secondary="var(--text-disabled)" />
                </div>
                <span className={styles.iconName}>{key}</span>
              </div>
            );
          })}
        </div>
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
