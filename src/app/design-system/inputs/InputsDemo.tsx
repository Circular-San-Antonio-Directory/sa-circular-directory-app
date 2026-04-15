'use client';

import { useState } from 'react';
import { TextField } from '@/components/TextField';
import { TextArea } from '@/components/TextArea';
import styles from '../design-system.module.scss';

export function InputsDemo() {
  const [clearDemoValue, setClearDemoValue] = useState('Sample text');
  const [textAreaValue, setTextAreaValue] = useState('');

  return (
    <>
      {/* ── Text Field ──────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Inputs</h1>
        <p className={styles.pageDescription}>
          Text Field and Text Area components with initial, hover, focus, and disabled states.
          Hover or click into any field below to see the interactive states live.
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Text Field</p>

        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <TextField placeholder="Placeholder text" style={{ width: 240 }} />
            <span className={styles.typeSpecs}>Default</span>
          </div>

          <div className={styles.componentItem}>
            <TextField
              iconLeft="fa-solid fa-magnifying-glass"
              placeholder="Search..."
              style={{ width: 240 }}
            />
            <span className={styles.typeSpecs}>With Left Icon</span>
          </div>

          <div className={styles.componentItem}>
            <TextField
              placeholder="Placeholder text"
              disabled
              style={{ width: 240 }}
            />
            <span className={styles.typeSpecs}>Disabled</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Text Field — With Clear</p>

        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <TextField
              iconLeft="fa-solid fa-magnifying-glass"
              iconClear
              value={clearDemoValue}
              onChange={(e) => setClearDemoValue(e.target.value)}
              placeholder="Type something..."
              style={{ width: 280 }}
            />
            <span className={styles.typeSpecs}>
              iconLeft + iconClear — type to populate, × clears
            </span>
          </div>

          <div className={styles.componentItem}>
            <TextField
              iconClear
              value={clearDemoValue}
              onChange={(e) => setClearDemoValue(e.target.value)}
              placeholder="Type something..."
              style={{ width: 240 }}
            />
            <span className={styles.typeSpecs}>iconClear only</span>
          </div>
        </div>
      </div>

      {/* ── Text Area ────────────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionHeading}>Text Area</p>

        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <TextArea
              placeholder="Enter a description..."
              value={textAreaValue}
              onChange={(e) => setTextAreaValue(e.target.value)}
              style={{ width: 320 }}
            />
            <span className={styles.typeSpecs}>Default</span>
          </div>

          <div className={styles.componentItem}>
            <TextArea
              placeholder="Enter a description..."
              disabled
              style={{ width: 320 }}
            />
            <span className={styles.typeSpecs}>Disabled</span>
          </div>
        </div>
      </div>

      {/* ── Token Reference ──────────────────────────────────── */}
      <div className={styles.section}>
        <p className={styles.sectionHeading}>Token Reference</p>
        <p className={styles.typeSpecs}>
          Default — $surface-raised bg · $border-default border · $shadow-sm
        </p>
        <p className={styles.typeSpecs}>
          Hover — border → $mono-500
        </p>
        <p className={styles.typeSpecs}>
          Focus — border → $primary-default · box-shadow 0 0 0 3px rgba($fern-700, 0.15)
        </p>
        <p className={styles.typeSpecs}>
          Disabled — $surface-sunken bg · $border-subtle border · $text-disabled text
        </p>
      </div>
    </>
  );
}
