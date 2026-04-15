'use client';

import { useRef, useState } from 'react';
import styles from './TextField.module.scss';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Full Font Awesome class string, e.g. "fa-solid fa-magnifying-glass" */
  iconLeft?: string;
  /** When true, renders an × button that clears the input when it has a value. */
  iconClear?: boolean;
}

export function TextField({
  iconLeft,
  iconClear,
  onChange,
  value,
  disabled,
  className,
  ...rest
}: TextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState('');

  const currentValue = isControlled ? String(value) : uncontrolledValue;
  const showClear = iconClear && !disabled && currentValue.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) setUncontrolledValue('');
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    inputRef.current?.focus();
  };

  const wrapperClass = [
    styles.wrapper,
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {iconLeft && (
        <i className={`${iconLeft} ${styles.iconLeft}`} aria-hidden="true" />
      )}
      <input
        ref={inputRef}
        value={isControlled ? value : uncontrolledValue}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
      {showClear && (
        <button
          className={styles.clearBtn}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // keep input focused
            handleClear();
          }}
          aria-label="Clear"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
