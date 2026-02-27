import { Metadata } from 'next';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Iconography — Design System',
};

const solidIcons = [
  'house', 'user', 'magnifying-glass', 'gear', 'bell',
  'heart', 'star', 'check', 'xmark', 'plus',
  'minus', 'arrow-right', 'arrow-left', 'chevron-down', 'chevron-up',
  'bars', 'envelope', 'phone', 'location-dot', 'calendar',
  'clock', 'lock', 'trash', 'pen', 'circle-info',
];

const regularIcons = [
  'user', 'heart', 'star', 'bell', 'envelope',
  'calendar', 'clock', 'bookmark', 'comment', 'file',
  'folder', 'image', 'circle', 'square', 'circle-check',
  'circle-xmark', 'circle-question', 'eye', 'hand', 'face-smile',
  'face-frown', 'thumbs-up', 'thumbs-down', 'copy', 'paper-plane',
];

const brandIcons = [
  'github', 'x-twitter', 'facebook', 'instagram', 'linkedin',
  'youtube', 'google', 'apple', 'android', 'slack',
  'discord', 'tiktok', 'pinterest', 'reddit', 'whatsapp',
  'telegram', 'spotify', 'wordpress', 'shopify', 'stripe',
  'paypal', 'amazon', 'microsoft', 'vimeo', 'twitch',
];

interface IconSectionProps {
  title: string;
  prefix: string;
  icons: string[];
}

function IconSection({ title, prefix, icons }: IconSectionProps) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionHeading}>{title}</p>
      <div className={styles.iconGrid}>
        {icons.map((name) => (
          <div key={name} className={styles.iconItem}>
            <i className={`${prefix} fa-${name} ${styles.iconGlyph}`} aria-hidden="true" />
            <span className={styles.iconName}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IconographyPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Iconography</h1>
        <p className={styles.pageDescription}>
          Icons are provided by{' '}
          <a href="https://fontawesome.com" target="_blank" rel="noreferrer">Font Awesome Free</a>,
          loaded via CDN kit. Three styles are available: <strong>Solid</strong> (<code>fa-solid</code>),{' '}
          <strong>Regular</strong> (<code>fa-regular</code>), and <strong>Brands</strong> (<code>fa-brands</code>).
          Use the appropriate prefix class alongside the icon name class, e.g.{' '}
          <code>fa-solid fa-house</code>.
        </p>
      </div>

      <IconSection title="Solid" prefix="fa-solid" icons={solidIcons} />
      <IconSection title="Regular" prefix="fa-regular" icons={regularIcons} />
      <IconSection title="Brands" prefix="fa-brands" icons={brandIcons} />
    </>
  );
}
