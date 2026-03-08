import styles from './ModalActionButton.module.scss';

export interface ModalActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  iconColor?: string;
  surface?: 'base' | 'sunken' | 'transparent';
}

export function ModalActionButton({
  icon = 'fa-solid fa-xmark',
  iconColor,
  surface = 'base',
  className,
  'aria-label': ariaLabel = 'Close',
  ...rest
}: ModalActionButtonProps) {
  const surfaceClass = surface !== 'base' ? styles[surface] : '';
  return (
    <button
      className={`${styles.root}${surfaceClass ? ` ${surfaceClass}` : ''}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
      {...rest}
    >
      <i className={icon} style={iconColor ? { color: iconColor } : undefined} aria-hidden="true" />
    </button>
  );
}
