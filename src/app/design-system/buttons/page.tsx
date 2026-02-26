import { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Selector } from '@/components/Selector';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Buttons — Design System',
};

const variants = [
  {
    name: 'Primary',
    variant: 'primary' as const,
    description: '$primary-default bg · $text-inverse · hover: $primary-hover · active: $primary-active',
  },
  {
    name: 'Secondary',
    variant: 'secondary' as const,
    description: 'Transparent bg · $border-strong border · $text-default · hover: $border-default · active: $fern-300',
  },
  {
    name: 'Ghost',
    variant: 'ghost' as const,
    description: 'Transparent bg · no border · $text-link · hover: $surface-sunken · active: $fern-200 · padding: $space-2',
  },
  {
    name: 'Accent',
    variant: 'accent' as const,
    description: '$secondary-default bg (merlot) · $text-inverse · hover: $secondary-hover · active: $secondary-active',
  },
] as const;

export default function ButtonsPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Buttons</h1>
        <p className={styles.pageDescription}>
          Four variants — Primary, Secondary, Ghost, and Accent — each with default, hover, active, and disabled states.
          Use the <code>variant</code> prop to switch between them.
        </p>
      </div>

      {variants.map(({ name, variant, description }) => (
        <div key={variant} className={styles.section}>
          <p className={styles.sectionHeading}>{name}</p>
          <div className={styles.componentRow}>
            <div className={styles.componentItem}>
              <Button variant={variant}>Explore Systems</Button>
              <span className={styles.typeSpecs}>Default</span>
            </div>
            <div className={styles.componentItem}>
              <Button variant={variant} disabled>Explore Systems</Button>
              <span className={styles.typeSpecs}>Disabled</span>
            </div>
          </div>
          <p className={styles.typeSpecs} style={{ marginTop: 'var(--space-3)' }}>{description}</p>
        </div>
      ))}

      <div className={styles.section}>
        <h2 className="heading-3">Selector</h2>
        <p className={styles.pageDescription}>
          Toggle-style button for filter and selection UI. Two variants — Primary and Secondary —
          each with default, selected, hover, and disabled states. Use the <code>selected</code> prop
          to control active state.
        </p>

        {(['primary', 'secondary'] as const).map((variant) => (
          <div key={variant} className={styles.section}>
            <p className={styles.sectionHeading}>{variant.charAt(0).toUpperCase() + variant.slice(1)}</p>

            {(['default', 'small'] as const).map((size) => (
              <div key={size} style={{ marginBottom: 'var(--space-6)' }}>
                <span className={styles.typeSpecs} style={{ marginBottom: 'var(--space-3)', display: 'block' }}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </span>
                <div className={styles.componentRow}>
                  <div className={styles.componentItem}>
                    <Selector variant={variant} size={size}>Filter label</Selector>
                    <span className={styles.typeSpecs}>Default</span>
                  </div>
                  <div className={styles.componentItem}>
                    <Selector variant={variant} size={size} selected>Filter label</Selector>
                    <span className={styles.typeSpecs}>Selected</span>
                  </div>
                  <div className={styles.componentItem}>
                    <Selector variant={variant} size={size} disabled>Filter label</Selector>
                    <span className={styles.typeSpecs}>Disabled</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
