import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { getListings } from '@/lib/getListings';
import { getCategories } from '@/lib/getCategories';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import { AboutCircularSA } from '@/components/AboutCircularSA';
import { QuestionsOrFeedback } from '@/components/QuestionsOrFeedback';
import { DirectoryClient } from './DirectoryClient';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

const HOME_DESCRIPTION =
  "Browse San Antonio's circular economy business directory. Find local shops and services to donate, buy secondhand, repair, recycle, refill, rent, and more — mapped across the city.";

// Next.js metadata merging replaces openGraph/twitter objects wholesale when a
// child sets them, rather than merging sub-fields. So we re-specify the image
// and twitter card here so they aren't dropped relative to the root layout.
export const metadata: Metadata = {
  title: "San Antonio Circular Economy Business Directory",
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "SA Circular Directory",
    locale: "en_US",
    url: "/",
    title: "San Antonio Circular Economy Business Directory",
    description: HOME_DESCRIPTION,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "SA Circular Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "San Antonio Circular Economy Business Directory",
    description: HOME_DESCRIPTION,
    images: ["/og-default.png"],
  },
};

export default async function Home() {
  const [listings, categories, actions] = await Promise.all([
    getListings(),
    getCategories(),
    getActions(),
  ]);

  return (
    <div className={styles.page}>
      <h1 className="sr-only">San Antonio Circular Economy Business Directory</h1>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          <ActionsProvider actions={actions}>
            <DirectoryClient listings={listings} categories={categories} />
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
