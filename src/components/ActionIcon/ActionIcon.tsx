import styles from './ActionIcon.module.scss';
import { ACTION_SVGS } from './ActionIconSVGs';

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

type ColorFamily =
  | 'blue'
  | 'fern'
  | 'violet'
  | 'spruce'
  | 'orange'
  | 'merlot'
  | 'mintChoc'
  | 'offWhite'
  | 'mono';

const COLOR_VARS: Record<ColorFamily, { primary: string; secondary: string; lightBG: string }> = {
  blue:     { 
    primary: 'var(--blue-700)',      
    secondary: 'var(--blue-400)',    
    lightBG: 'var(--blue-300)' },
  fern:     { 
    primary: 'var(--fern-700)',      
    secondary: 'var(--fern-400)',    
    lightBG: 'var(--fern-300)' },
  violet:   { 
    primary: 'var(--violet-600)',    
    secondary: 'var(--violet-400)',  
    lightBG: 'var(--violet-300)' },
  spruce:   { 
    primary: 'var(--spruce-700)',    
    secondary: 'var(--spruce-400)',  
    lightBG: 'var(--spruce-300)' },
  orange:   { 
    primary: 'var(--orange-600)',    
    secondary: 'var(--orange-400)',  
    lightBG: 'var(--orange-300)' },
  merlot:   { 
    primary: 'var(--merlot-700)',    
    secondary: 'var(--merlot-400)',  
    lightBG: 'var(--merlot-300)' },
  mintChoc: { 
    primary: 'var(--mintChoc-600)',  
    secondary: 'var(--mintChoc-400)',  
    lightBG: 'var(--mintChoc-300)' },
  offWhite: { 
    primary: 'var(--offWhite-800)',  
    secondary: 'var(--offWhite-500)',  
    lightBG: 'var(--offWhite-300)' },
  mono:     { 
    primary: 'var(--mono-900)',      
    secondary: 'var(--mono-500)',  
    lightBG: 'var(--mono-300)' },
};

const ACTION_MAP: Record<ActionName, { iconFile: string; label: string; colorFamily: ColorFamily }> = {
  donate:      { iconFile: 'Action-3',  label: 'Donate',        colorFamily: 'blue' },
  buy:         { iconFile: 'Action-10', label: 'Buy',           colorFamily: 'fern' },
  buyB2B:      { iconFile: 'Action-10', label: 'Buy (B2B)',     colorFamily: 'mintChoc' },      // TODO: replace with real icon
  sell:        { iconFile: 'Action-9',  label: 'Sell',          colorFamily: 'violet' },
  consign:     { iconFile: 'Action-6',  label: 'Consign',       colorFamily: 'spruce' },
  trade:       { iconFile: 'Action-4',  label: 'Trade',         colorFamily: 'violet' },
  repair:      { iconFile: 'Action-5',  label: 'Repair',        colorFamily: 'orange' },
  recycle:     { iconFile: 'Action-11', label: 'Recycle',       colorFamily: 'merlot' },
  compost:     { iconFile: 'Action-7',  label: 'Compost',       colorFamily: 'blue' },
  volunteer:   { iconFile: 'Action-8',  label: 'Volunteer',     colorFamily: 'fern' },
  refill:      { iconFile: 'Action-2',  label: 'Refill',        colorFamily: 'mintChoc' },
  rent:        { iconFile: 'Action-4',  label: 'Rent',          colorFamily: 'spruce' },    // TODO: replace with real icon
  process:     { iconFile: 'Action-11', label: 'Process',       colorFamily: 'merlot' },   // TODO: replace with real icon
  dineOrDrink: { iconFile: 'Action-1',  label: 'Dine or Drink', colorFamily: 'mono' }, // nearest token: offWhite-800 for primary; consider 'mono' if contrast is insufficient
};

interface ActionIconProps {
  action: ActionName;
  variant?: ActionIconVariant;
}

export function ActionIcon({ action, variant = 'icon' }: ActionIconProps) {
  const { iconFile, label, colorFamily } = ACTION_MAP[action];
  const { primary, secondary, lightBG } = COLOR_VARS[colorFamily];
  const SvgIcon = ACTION_SVGS[iconFile];

  if (variant === 'badge') {
    return (
      <div className={styles.badge} style={{ backgroundColor: lightBG }}>
        <div className={styles.iconWrapperLg}>
          <SvgIcon primary={primary} secondary={secondary} aria-label={label} />
        </div>
      </div>
    );
  }

  if (variant === 'icon-with-label') {
    return (
      <div className={styles.iconWithLabel}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <SvgIcon primary={primary} secondary={secondary} />
        </div>
        <span className={styles.iconWithLabelText}>{label}</span>
      </div>
    );
  }

  return (
    <div className={styles.iconWrapper}>
      <SvgIcon primary={primary} secondary={secondary} aria-label={label} />
    </div>
  );
}
