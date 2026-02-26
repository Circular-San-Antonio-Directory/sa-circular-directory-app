import { Metadata } from 'next';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Color — Design System',
};

interface ColorToken {
  name: string;
  ref: string;
  hexCode: string;
  hex: string;
}

interface ColorGroup {
  label: string;
  tokens: ColorToken[];
}

const colorGroups: ColorGroup[] = [
  {
    label: 'Surface',
    tokens: [
      { name: 'surface-base',   ref: '$offWhite-100', hexCode: '#F9F8F5', hex: 'var(--surface-base)' },
      { name: 'surface-raised', ref: '$mono-100',      hexCode: '#FFFFFF', hex: 'var(--surface-raised)' },
      { name: 'surface-sunken', ref: '$offWhite-300',  hexCode: '#EEECE8', hex: 'var(--surface-sunken)' },
    ],
  },
  {
    label: 'Text',
    tokens: [
      { name: 'text-default',           ref: '$mono-800',      hexCode: '#2F2F2F', hex: 'var(--text-default)' },
      { name: 'text-subtle',            ref: '$mono-600',      hexCode: '#6F6F6F', hex: 'var(--text-subtle)' },
      { name: 'text-disabled',          ref: '$offWhite-700',  hexCode: '#A6A29A', hex: 'var(--text-disabled)' },
      { name: 'text-inverse',           ref: '$mono-100',      hexCode: '#FFFFFF', hex: 'var(--text-inverse)' },
      { name: 'text-inverse-secondary', ref: '$mono-300',      hexCode: '#F0F0F0', hex: 'var(--text-inverse-secondary)' },
      { name: 'text-link',              ref: '$fern-700',      hexCode: '#1E5751', hex: 'var(--text-link)' },
    ],
  },
  {
    label: 'Border',
    tokens: [
      { name: 'border-default', ref: '$offWhite-400', hexCode: '#D6D4CE', hex: 'var(--border-default)' },
      { name: 'border-subtle',  ref: '$offWhite-300', hexCode: '#EEECE8', hex: 'var(--border-subtle)' },
      { name: 'border-medium',  ref: '$offWhite-500', hexCode: '#CAC7BE', hex: 'var(--border-medium)' },
      { name: 'border-strong',  ref: '$mono-800',     hexCode: '#2F2F2F', hex: 'var(--border-strong)' },
    ],
  },
  {
    label: 'Primary — Fern',
    tokens: [
      { name: 'primary-default', ref: '$fern-700',     hexCode: '#1E5751', hex: 'var(--primary-default)' },
      { name: 'primary-hover',   ref: '$fern-900',     hexCode: '#092620', hex: 'var(--primary-hover)' },
      { name: 'primary-active',  ref: '$fern-600',     hexCode: '#388A58', hex: 'var(--primary-active)' },
      { name: 'primary-subtle',  ref: '$fern-400-alt', hexCode: '#80B7B1', hex: 'var(--primary-subtle)' },
    ],
  },
  {
    label: 'Secondary — Merlot',
    tokens: [
      { name: 'secondary-default', ref: '$merlot-700', hexCode: '#851926', hex: 'var(--secondary-default)' },
      { name: 'secondary-hover',   ref: '$merlot-900', hexCode: '#3A0810', hex: 'var(--secondary-hover)' },
      { name: 'secondary-active',  ref: '$merlot-600', hexCode: '#9E4868', hex: 'var(--secondary-active)' },
      { name: 'secondary-subtle',  ref: '$merlot-400', hexCode: '#D4A8D8', hex: 'var(--secondary-subtle)' },
    ],
  },
  {
    label: 'Warning',
    tokens: [
      { name: 'warning-surface-dark',        ref: '$orange-600', hexCode: '#D97828', hex: 'var(--warning-surface-dark)' },
      { name: 'warning-surface-light',       ref: '$orange-200', hexCode: '#FDF3C2', hex: 'var(--warning-surface-light)' },
      { name: 'warning-text-surface-light',  ref: '$orange-800', hexCode: '#8A2A08', hex: 'var(--warning-text-surface-light)' },
      { name: 'warning-icon-surface-light',  ref: '$orange-700', hexCode: '#B43B0D', hex: 'var(--warning-icon-surface-light)' },
    ],
  },
  {
    label: 'Success',
    tokens: [
      { name: 'success-surface-dark',        ref: '$fern-600', hexCode: '#388A58', hex: 'var(--success-surface-dark)' },
      { name: 'success-surface-light',       ref: '$fern-200', hexCode: '#D8FAC2', hex: 'var(--success-surface-light)' },
      { name: 'success-text-surface-light',  ref: '$fern-800', hexCode: '#123D38', hex: 'var(--success-text-surface-light)' },
      { name: 'success-icon-surface-light',  ref: '$fern-700', hexCode: '#1E5751', hex: 'var(--success-icon-surface-light)' },
    ],
  },
  {
    label: 'Error',
    tokens: [
      { name: 'error-surface-dark',        ref: '$redAdobe-600', hexCode: '#C34242', hex: 'var(--error-surface-dark)' },
      { name: 'error-surface-light',       ref: '$redAdobe-200', hexCode: '#F9E8EC', hex: 'var(--error-surface-light)' },
      { name: 'error-text-surface-light',  ref: '$redAdobe-800', hexCode: '#7A1F1E', hex: 'var(--error-text-surface-light)' },
      { name: 'error-icon-surface-light',  ref: '$redAdobe-700', hexCode: '#A53331', hex: 'var(--error-icon-surface-light)' },
    ],
  },
  {
    label: 'Info',
    tokens: [
      { name: 'info-surface-dark',        ref: '$mintChoc-600', hexCode: '#5E5838', hex: 'var(--info-surface-dark)' },
      { name: 'info-surface-light',       ref: '$mintChoc-200', hexCode: '#E4F8EF', hex: 'var(--info-surface-light)' },
      { name: 'info-text-surface-light',  ref: '$mintChoc-800', hexCode: '#361808', hex: 'var(--info-text-surface-light)' },
      { name: 'info-icon-surface-light',  ref: '$mintChoc-700', hexCode: '#51270B', hex: 'var(--info-icon-surface-light)' },
    ],
  },
];

export default function ColorPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Color</h1>
        <p className={styles.pageDescription}>
          Semantic color tokens for the Circular Directory design system, mapped from the base color palette.
        </p>
      </div>

      {colorGroups.map((group) => (
        <div key={group.label} className={styles.section}>
          <p className={styles.sectionHeading}>{group.label}</p>
          <div className={styles.colorGrid}>
            {group.tokens.map((token) => (
              <div key={token.name} className={styles.colorCard}>
                <div
                  className={styles.swatchArea}
                  style={{ backgroundColor: token.hex }}
                />
                <div className={styles.colorCardBody}>
                  <span className={styles.tokenName}>${token.name}</span>
                  <span className={styles.tokenRef}>{token.ref}</span>
                  <span className={styles.tokenHexCode}>{token.hexCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}