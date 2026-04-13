import type { Listing } from '@/lib/getListings';
import { Pill } from '@/components/Pill';
import styles from './SystemsMapping.module.scss';

interface SystemsMappingProps {
  fields: Listing['fields'];
}

export function SystemsMapping({ fields: f }: SystemsMappingProps) {
  if (f.coreMaterialSystem.length === 0 && f.enablingSystem.length === 0) return null;

  const rows = [
    f.coreMaterialSystem.length > 0 && (
      <details key="core" name="system-row" className={styles.systemRow}>
        <summary className={styles.systemSummary}>
          <span className={styles.systemSummaryLabel}>Core Material Systems</span>
          <i className={`fa-solid fa-chevron-down ${styles.systemChevron}`} aria-hidden="true" />
        </summary>
        <div className={styles.systemContent}>
          {f.coreMaterialSystem.map((m) => (
            <Pill key={m} label={m} color="violet" size="small" />
          ))}
        </div>
      </details>
    ),
    f.enablingSystem.length > 0 && (
      <details key="enabling" name="system-row" className={styles.systemRow}>
        <summary className={styles.systemSummary}>
          <span className={styles.systemSummaryLabel}>This Business Enables</span>
          <i className={`fa-solid fa-chevron-down ${styles.systemChevron}`} aria-hidden="true" />
        </summary>
        <div className={styles.systemContent}>
          {f.enablingSystem.map((s) => (
            <Pill key={s} label={s} color="violet" size="small" />
          ))}
        </div>
      </details>
    ),
  ].filter(Boolean);

  return (
    <div>
      <p className={styles.sectionLabel}>Systems Mapping</p>
      <div className={styles.systemsBlock}>
        {rows.flatMap((row, i) =>
          i === 0
            ? [row]
            : [<div key={`divider-${i}`} className={styles.systemDivider} aria-hidden="true" />, row]
        )}
      </div>
    </div>
  );
}
