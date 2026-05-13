import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/siteUrl';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Map | SA Circular Directory',
  alternates: { canonical: absoluteUrl('/map') },
};
import { getListings } from '@/lib/getListings';
import { getCategories } from '@/lib/getCategories';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import type { ActionName } from '@/components/ActionIcon';
import { AboutCircularSA } from '@/components/AboutCircularSA';
import { QuestionsOrFeedback } from '@/components/QuestionsOrFeedback';
import { DirectoryClient } from '@/components/DirectoryClient';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const [{ q, action }, listings, categories, actions] = await Promise.all([
    searchParams,
    getListings(),
    getCategories(),
    getActions(),
  ]);

  return (
    <div className={styles.page}>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          <ActionsProvider actions={actions}>
            <DirectoryClient
              listings={listings}
              categories={categories}
              initialSearch={q ?? ''}
              initialActionFilter={(action as ActionName) ?? null}
            />
          </ActionsProvider>
        </div>

        <div className={styles.aboutSection}>
          <AboutCircularSA />
        </div>
      </div>

      <QuestionsOrFeedback />

    </div>
  );
}
