import styles from './Selector.module.scss';

export type SelectorVariant = 'primary' | 'secondary';
export type SelectorSize = 'default' | 'small';

interface SelectorProps {
  children: React.ReactNode;
  variant?: SelectorVariant;
  size?: SelectorSize;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Selector({
  children,
  variant = 'primary',
  size = 'default',
  selected,
  onClick,
  disabled,
  className,
}: SelectorProps) {
  const classes = [
    styles.selector,
    styles[variant],
    size === 'small' ? styles.small : null,
    selected ? styles.selected : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
