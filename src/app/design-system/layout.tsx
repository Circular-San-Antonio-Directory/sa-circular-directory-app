'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './design-system.module.scss';

const foundationItems = [
  { label: 'Typography', href: '/design-system/typography' },
  { label: 'Color', href: '/design-system/color' },
  { label: 'Iconography', href: '/design-system/iconography' },
];

const componentItems = [
  { label: 'Buttons', href: '/design-system/buttons' },
];

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Design System</span>
          <span className={styles.sidebarSubtitle}>Circular Directory</span>
        </div>
        <div className={styles.sidebarDivider} />
        <p className={styles.navSection}>Foundations</p>
        <ul className={styles.nav}>
          {foundationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink}${pathname === item.href ? ` ${styles.navLinkActive}` : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.navSection}>Components</p>
        <ul className={styles.nav}>
          {componentItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink}${pathname === item.href ? ` ${styles.navLinkActive}` : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}