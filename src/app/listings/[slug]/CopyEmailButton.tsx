'use client';

import { useState } from 'react';
import styles from './page.module.scss';

interface CopyEmailButtonProps {
  email: string;
}

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleCopy} className={styles.copyEmailButton} title="Copy email">
      <i
        className={`${copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} ${styles.copyEmailIcon}`}
        aria-hidden="true"
      />
      <span>{copied ? 'Copied!' : email}</span>
    </button>
  );
}
