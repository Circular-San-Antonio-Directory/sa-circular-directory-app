import styles from './ActionIcon.module.scss';
import { ICON_SVGS } from './IconSVGs';
import { useActionsConfig } from './ActionsContext';
import type { ActionConfig } from '@/lib/getActions';

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
  blue:     { primary: 'var(--blue-700)',      secondary: 'var(--blue-400)',    lightBG: 'var(--blue-300)'     },
  fern:     { primary: 'var(--fern-700)',      secondary: 'var(--fern-400)',    lightBG: 'var(--fern-300)'     },
  violet:   { primary: 'var(--violet-600)',    secondary: 'var(--violet-400)',  lightBG: 'var(--violet-300)'   },
  spruce:   { primary: 'var(--spruce-700)',    secondary: 'var(--spruce-400)',  lightBG: 'var(--spruce-300)'   },
  orange:   { primary: 'var(--orange-700)',    secondary: 'var(--orange-400)',  lightBG: 'var(--orange-300)'   },
  merlot:   { primary: 'var(--merlot-700)',    secondary: 'var(--merlot-400)',  lightBG: 'var(--merlot-300)'   },
  mintChoc: { primary: 'var(--mintChoc-600)',  secondary: 'var(--mintChoc-400)', lightBG: 'var(--mintChoc-300)' },
  offWhite: { primary: 'var(--offWhite-800)',  secondary: 'var(--offWhite-500)', lightBG: 'var(--offWhite-300)' },
  mono:     { primary: 'var(--mono-900)',      secondary: 'var(--mono-500)',    lightBG: 'var(--mono-300)'     },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Returns the display label for an action.
 * Pass the actionsConfig from useActionsConfig() or page-level fetch.
 */
export function getActionLabel(action: ActionName, actionsConfig: ActionConfig[]): string {
  return actionsConfig.find((a) => a.actionName === action)?.label ?? action;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActionIconProps {
  action: ActionName;
  variant?: ActionIconVariant;
}

export function ActionIcon({ action, variant = 'icon' }: ActionIconProps) {
  const actionsConfig = useActionsConfig();
  const config = actionsConfig.find((a) => a.actionName === action);

  // Config not yet loaded or action not found — render nothing
  if (!config) return null;

  const { label, iconFile, colorway } = config;
  const colors = COLOR_VARS[colorway as ColorFamily] ?? COLOR_VARS.mono;
  const { primary, secondary, lightBG } = colors;
  const SvgIcon = ICON_SVGS[iconFile];

  // Icon file not found in registry — render nothing
  if (!SvgIcon) return null;

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
