import styles from './ActionIcon.module.scss';

export type ActionName =
  | 'donate'
  | 'buy'
  | 'buyB2B'
  | 'sell'
  | 'consign'
  | 'trade'
  | 'repair'
  | 'recycle'
  | 'compost'
  | 'volunteer'
  | 'refill'
  | 'rent'
  | 'process'
  | 'dineOrDrink';

export type ActionIconVariant = 'icon' | 'badge' | 'icon-with-label';

interface ActionIconProps {
  action: ActionName;
  variant?: ActionIconVariant;
}

const ACTION_MAP: Record<ActionName, { iconFile: string; label: string }> = {
  donate:      { iconFile: 'Action-3', label: 'Donate' },
  buy:         { iconFile: 'Action-10', label: 'Buy' },
  buyB2B:      { iconFile: 'Action-10', label: 'Buy (B2B)' }, // TODO: replace with real icon
  sell:        { iconFile: 'Action-9', label: 'Sell' },
  consign:     { iconFile: 'Action-6', label: 'Consign' },
  trade:       { iconFile: 'Action-4', label: 'Trade' },
  repair:      { iconFile: 'Action-5', label: 'Repair' },
  recycle:     { iconFile: 'Action-11', label: 'Recycle' },
  compost:     { iconFile: 'Action-7', label: 'Compost' },
  volunteer:   { iconFile: 'Action-8', label: 'Volunteer' },
  refill:      { iconFile: 'Action-2', label: 'Refill' },
  rent:        { iconFile: 'Action-4', label: 'Rent' },        // TODO: replace with real icon
  process:     { iconFile: 'Action-11', label: 'Process' },   // TODO: replace with real icon
  dineOrDrink: { iconFile: 'Action-1', label: 'Dine or Drink' },
};

export function ActionIcon({ action, variant = 'icon' }: ActionIconProps) {
  const { iconFile, label } = ACTION_MAP[action];
  const src = `/images/actionIconsLibrary/${iconFile}.svg`;

  if (variant === 'badge') {
    return (
      <div className={`${styles.badge} ${styles[action]}`}>
        <div className={styles.iconWrapperLg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} width={18} height={18} />
        </div>
      </div>
    );
  }

  if (variant === 'icon-with-label') {
    return (
      <div className={styles.iconWithLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden="true" width={15} height={15} />
        <span className={styles.iconWithLabelText}>{label}</span>
      </div>
    );
  }

  return (
    <div className={styles.iconWrapper}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} width={15} height={15} />
    </div>
  );
}
