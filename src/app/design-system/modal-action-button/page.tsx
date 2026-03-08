import { Metadata } from 'next';
import { ModalActionButton } from '@/components/ModalActionButton';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Modal Action Button — Design System',
};

export default function ModalActionButtonPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Modal Action Button</h1>
        <p className={styles.pageDescription}>
          A circular icon button used for contextual modal actions. Accepts any Font Awesome icon
          and an optional icon color. Two surface variants match the modal background it sits on —{' '}
          <code>base</code> (default) and <code>sunken</code>. Background color transitions
          smoothly on hover and press.
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Surface variants</p>
        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <ModalActionButton surface="base" />
            <span className={styles.typeSpecs}>surface="base"</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton surface="sunken" />
            <span className={styles.typeSpecs}>surface="sunken"</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton surface="transparent" />
            <span className={styles.typeSpecs}>surface="transparent"</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Custom icons</p>
        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <ModalActionButton icon="fa-solid fa-xmark" />
            <span className={styles.typeSpecs}>fa-xmark (default)</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton icon="fa-solid fa-arrow-left" />
            <span className={styles.typeSpecs}>fa-arrow-left</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton icon="fa-solid fa-chevron-down" />
            <span className={styles.typeSpecs}>fa-chevron-down</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton icon="fa-solid fa-share" />
            <span className={styles.typeSpecs}>fa-share</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionHeading}>Custom icon color</p>
        <div className={styles.componentRow}>
          <div className={styles.componentItem}>
            <ModalActionButton iconColor="var(--primary-default)" />
            <span className={styles.typeSpecs}>primary-default</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton iconColor="var(--secondary-default)" />
            <span className={styles.typeSpecs}>secondary-default</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton iconColor="var(--text-subtle)" />
            <span className={styles.typeSpecs}>text-subtle</span>
          </div>
          <div className={styles.componentItem}>
            <ModalActionButton surface="sunken" iconColor="var(--primary-default)" />
            <span className={styles.typeSpecs}>sunken + primary</span>
          </div>
        </div>
      </div>
    </>
  );
}
