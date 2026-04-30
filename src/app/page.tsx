import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Button } from '@/components/Button';
import { AboutCircularSA } from '@/components/AboutCircularSA';
import { QuestionsOrFeedback } from '@/components/QuestionsOrFeedback';
import { ActionsProvider } from '@/components/ActionIcon';
import { DirectorySearch } from '@/components/DirectorySearch';
import { getListings } from '@/lib/getListings';
import { getCategories } from '@/lib/getCategories';
import { getActions } from '@/lib/getActions';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [listings, categories, actions] = await Promise.all([
    getListings(),
    getCategories(),
    getActions(),
  ]);

  return (
    <div className={styles.page}>

      {/* pageInner mirrors map page structure exactly:
          - Nav is a direct flex child → sticky bounded by pageInner (full-page height)
          - padding: $space-6 $space-8 on desktop → navScrolled break-out works identically */}
      <div className={styles.pageInner}>
        <Nav />

        {/* ── Hero content ────────────────────────────────────────────────── */}
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroHeading} accent-1`}>
            Donate, repair, reuse in S.A.{' '}
            <span className={styles.heroAccent}>All in one place.</span>
          </h1>
          <p className={`${styles.heroBody} body-default-regular`}>
            Find places to <strong>donate</strong>, <strong>repair</strong> or{' '}
            <strong>recycle</strong> your items or where to buy secondhand,
            recycled or sustainable items in the San Antonio area.
          </p>
          <Link href="/map">
            <Button
              variant="primary"
              surface="dark"
              icon="fa-solid fa-circle-arrow-right"
              iconPosition="right"
            >
              Explore the Map
            </Button>
          </Link>
        </div>

        {/* ── Description + Accent Visual ─────────────────────────────────── */}
        <section className={styles.descriptionSection}>
          <div className={styles.descriptionTextGroup}>
            <p className={`${styles.descriptionText} body-default-regular`}>
              The San Antonio Circular Directory is the searchable platform that maps
              San Antonio&rsquo;s circular economy. Built by Circular San Antonio,
              powered by local businesses.
            </p>
            <p className={`${styles.descriptionAccentText} heading-2`}>Are you a business that enables secondhand,
              recycling or circularity?{' '}
              <Link href="https://www.circularsanantonio.org/projects/directory" className={styles.descriptionLink} target="_blank" rel="noopener noreferrer">
                Join the Directory
              </Link>
            </p>
          </div>
          <div className={styles.accentVisual} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/home-accent-visual.png" alt="" />
          </div>
        </section>

        {/* ── Where do you want to start? ─────────────────────────────────── */}
        <section className={styles.searchSection}>
          <div className={styles.searchInner}>
            <div className={styles.searchTextCol}>
              <h2 className={`${styles.searchHeading} hero-3`}>
                Where do you want to start?
              </h2>
              <p className={`${styles.searchSubtext} body-default-regular`}>
                Start by selecting an action and searching an item or category.
              </p>
            </div>
            <div className={styles.searchWidgetCol}>
              <div className={styles.searchWidgetInner}>
                <ActionsProvider actions={actions}>
                  <DirectorySearch listings={listings} categories={categories} />
                </ActionsProvider>
              </div>
            </div>
          </div>
        </section>

        {/* ── Circular SA About ───────────────────────────────────────────── */}
        <div className={styles.aboutSection}>
          <AboutCircularSA />
        </div>

      </div>{/* end pageInner */}

      {/* ── Questions & Feedback — full-bleed, outside pageInner ────────── */}
      <QuestionsOrFeedback />

    </div>
  );
}
