import { getHoursStatus } from '@/lib/hoursUtils';
import type { BusinessHoursJson } from '@/lib/getListings';
import styles from './BusinessHoursBlock.module.scss';

interface Props {
  hoursJson: BusinessHoursJson | null;
}

export function BusinessHoursBlock({ hoursJson }: Props) {
  const { state, label } = getHoursStatus(hoursJson);

  const headerContent = (
    <div className={`${styles.header} ${styles[`header--${state}`]}`}>
      <div className={styles.info}>
        <div className={styles.labelRow}>
          <i className={`fa-regular fa-clock ${styles.clock}`} aria-hidden="true" />
          <span className={`label-caption-strong ${styles.labelText}`}>Hours</span>
        </div>
        <div className={styles.statusRow}>
          {state === 'open' && (
            <>
              <span className={styles.statusText}>Currently Open</span>
              <span className={styles.statusAccent}>{label}</span>
            </>
          )}
          {state === 'closed' && (
            <>
              <span className={styles.statusText}>Currently Closed</span>
              {label && <span className={styles.statusAccent}>{label}</span>}
            </>
          )}
          {state === 'special' && (
            <span className={styles.statusText}>Currently: {label}</span>
          )}
          {state === 'unknown' && (
            <span className={styles.statusText}>Please view website or social media for hours.</span>
          )}
        </div>
      </div>
      {state !== 'unknown' && (
        <i className={`fa-solid fa-chevron-down ${styles.chevron}`} aria-hidden="true" />
      )}
    </div>
  );

  if (state === 'unknown') {
    return headerContent;
  }

  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        {headerContent}
      </summary>
      {hoursJson?.display && hoursJson.display.length > 0 && (
        <div className={styles.panel}>
          {hoursJson.display.map((row, i) => (
            <div key={i} className={styles.panelRow}>
              <span className={styles.dayName}>{row.days}</span>
              <span className={styles.dayTime}>{row.time}</span>
            </div>
          ))}
          {hoursJson.note && (
            <p className={styles.panelNote}>{hoursJson.note}</p>
          )}
        </div>
      )}
    </details>
  );
}
