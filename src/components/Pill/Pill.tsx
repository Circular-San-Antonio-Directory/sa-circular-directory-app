import styles from './Pill.module.scss';

export type PillColor =
  | 'blue'
  | 'orange'
  | 'merlot'
  | 'fern'
  | 'violet'
  | 'spruce'
  | 'mintChoc'
  | 'redAdobe'
  | 'mono'
  | 'offWhite';

export type PillSize = 'small' | 'large';

interface PillProps {
  label: string;
  color: PillColor;
  size?: PillSize;
  /** Font Awesome icon class, e.g. "fa-solid fa-shirt". Omit for no-icon variant. */
  icon?: string;
}

const COLOR_CLASS: Record<PillColor, string> = {
  blue:      styles.colorBlue,
  orange:    styles.colorOrange,
  merlot:    styles.colorMerlot,
  fern:      styles.colorFern,
  violet:    styles.colorViolet,
  spruce:    styles.colorSpruce,
  mintChoc:  styles.colorMintChoc,
  redAdobe:  styles.colorRedAdobe,
  mono:      styles.colorMono,
  offWhite:  styles.colorOffWhite,
};

export function Pill({ label, color, size = 'large', icon }: PillProps) {
  const classes = [
    styles.pill,
    COLOR_CLASS[color],
    size === 'large' ? styles.large : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          <i className={icon} />
        </span>
      )}
      {label}
    </span>
  );
}
