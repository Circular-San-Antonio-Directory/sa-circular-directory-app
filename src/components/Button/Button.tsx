import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-compact' | 'accent';
export type ButtonIconPosition = 'left' | 'right' | 'only';
export type ButtonSurface = 'light' | 'dark';

// Extends all native <button> attributes (onClick, disabled, type, aria-label, etc.)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  /** Full Font Awesome class string, e.g. "fa-solid fa-house" or "fa-brands fa-github" */
  icon?: string;
  /** Where the icon renders relative to the label. Ignored when no icon is provided.
   *  For 'only', omit children and pass aria-label for accessibility. */
  iconPosition?: ButtonIconPosition;
  /** Light (default) or dark surface color scheme. */
  surface?: ButtonSurface;
}

export function Button({
  children,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  surface = 'light',
  className,
  ...rest
}: ButtonProps) {
  const iconEl = icon ? <i className={`${icon} ${styles.icon}`} aria-hidden="true" /> : null;
  const iconClass = icon ? ` ${styles[iconPosition]}` : '';
  const surfaceClass = surface === 'dark' ? ` ${styles.dark}` : '';

  return (
    <button
      className={`${styles.button} ${styles[variant]}${iconClass}${surfaceClass}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {iconEl && iconPosition !== 'right' && iconEl}
      {iconPosition !== 'only' && children}
      {iconEl && iconPosition === 'right' && iconEl}
    </button>
  );
}
