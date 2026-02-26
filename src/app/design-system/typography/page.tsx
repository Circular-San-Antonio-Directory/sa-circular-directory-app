import { Metadata } from 'next';
import styles from '../design-system.module.scss';

export const metadata: Metadata = {
  title: 'Typography — Design System',
};

const sections = [
  {
    heading: 'Hero — Archivo',
    specimens: [
      { className: 'hero-1',       name: 'Hero 1',          specs: 'Archivo · 62px · 400 · 1.1', text: 'Circular' },
      { className: 'hero-2-strong', name: 'Hero 2 Strong',   specs: 'Archivo · 50px · 500 · 1.1', text: 'Circular Directory' },
      { className: 'hero-2-light',  name: 'Hero 2 Light',    specs: 'Archivo · 50px · 300 · 1.1', text: 'Circular Directory' },
      { className: 'hero-3',       name: 'Hero 3',          specs: 'Archivo · 40px · 400 · 1.1', text: 'Circular Directory' },
      { className: 'hero-4',       name: 'Hero 4',          specs: 'Archivo · 28px · 500 · 1.1', text: 'The circular economy reinvented' },
    ],
  },
  {
    heading: 'Headings — Geist',
    specimens: [
      { className: 'heading-1', name: 'Heading 1', specs: 'Geist · 40px · 500 · 1.2',  text: 'Heading One' },
      { className: 'heading-2', name: 'Heading 2', specs: 'Geist · 28px · 500 · 1.4',  text: 'Heading Two Title' },
      { className: 'heading-3', name: 'Heading 3', specs: 'Geist · 20px · 500 · 1.2',  text: 'Heading Three Section Title' },
      { className: 'heading-4', name: 'Heading 4', specs: 'Geist · 17px · 500 · 1.2',  text: 'Heading Four Subsection' },
      { className: 'heading-5', name: 'Heading 5', specs: 'Geist · 15px · 500 · 1.25', text: 'Heading Five Small Label' },
    ],
  },
  {
    heading: 'Body — Geist',
    specimens: [
      { className: 'body-large-regular',    name: 'Body Large · Regular', specs: 'Geist · 20px · 400 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-large-medium',    name: 'Body Large · Medium',  specs: 'Geist · 20px · 500 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-large-bold',   name: 'Body Large · Bold',    specs: 'Geist · 20px · 700 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-default-regular',  name: 'Body Default · Regular',specs: 'Geist · 17px · 400 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-default-medium',  name: 'Body Default · Medium', specs: 'Geist · 17px · 500 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-default-bold', name: 'Body Default · Bold',   specs: 'Geist · 17px · 700 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-small-regular',    name: 'Body Small · Regular',  specs: 'Geist · 15px · 400 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-small-medium',    name: 'Body Small · Medium',   specs: 'Geist · 15px · 500 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
      { className: 'body-small-bold',   name: 'Body Small · Bold',     specs: 'Geist · 15px · 700 · 1.4', text: 'The quick brown fox jumps over the lazy dog' },
    ],
  },
  {
    heading: 'Caption — Geist',
    specimens: [
      { className: 'caption-regular',   name: 'Caption · Regular',   specs: 'Geist · 13px · 400 · 1.4', text: 'Small supporting text for annotations and metadata' },
      { className: 'caption-bold',  name: 'Caption · Bold',      specs: 'Geist · 13px · 600 · 1.4', text: 'Small supporting text for annotations and metadata' },
      { className: 'caption-extrabold', name: 'Caption · Extrabold', specs: 'Geist · 13px · 800 · 1.4', text: 'Small supporting text for annotations and metadata' },
    ],
  },
  {
    heading: 'Labels — Geist',
    specimens: [
      { className: 'label-large',      name: 'Label Large',          specs: 'Geist · 20px · 400 · 1.1', text: 'Button label' },
      { className: 'label-large-strong',   name: 'Label Large · Strong', specs: 'Geist · 20px · 600 · 1.1', text: 'Button label' },
      { className: 'label-default',    name: 'Label Default',        specs: 'Geist · 17px · 500 · 1.1', text: 'Button label' },
      { className: 'label-default-strong', name: 'Label Default · Strong',specs: 'Geist · 17px · 600 · 1.1', text: 'Button label' },
      { className: 'label-small',      name: 'Label Small',          specs: 'Geist · 15px · 500 · 1.1', text: 'Tag or badge text' },
      { className: 'label-small-strong',   name: 'Label Small · Strong', specs: 'Geist · 15px · 600 · 1.1', text: 'Tag or badge text' },
      { className: 'label-caption',    name: 'Label Caption',        specs: 'Geist · 13px · 500 · 1.1', text: 'Tag or badge text' },
      { className: 'label-caption-strong', name: 'Label Caption · Strong',specs: 'Geist · 13px · 600 · 1.1', text: 'Tag or badge text' },
    ],
  },
];

export default function TypographyPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Typography</h1>
        <p className={styles.pageDescription}>
          Type styles for the Circular Directory design system. Hero styles use Archivo; headings, body, and labels use Geist.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.heading} className={styles.section}>
          <p className={styles.sectionHeading}>{section.heading}</p>
          <table className={styles.typeTable}>
            <tbody>
              {section.specimens.map((specimen) => (
                <tr key={specimen.name} className={styles.typeRow}>
                  <td className={styles.typePreview}>
                    <span className={specimen.className}>{specimen.text}</span>
                  </td>
                  <td className={styles.typeMeta}>
                    <span className={styles.typeStyleName}>{specimen.name}</span>
                    <span className={styles.typeSpecs}>{specimen.specs}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}