import { Nav } from '@/components/Nav';
import { getListings } from '@/lib/getListings';
import { getCategories } from '@/lib/getCategories';
import { DirectoryClient } from './DirectoryClient';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [listings, categories] = await Promise.all([getListings(), getCategories()]);

  return (
    <div className={styles.page}>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          <DirectoryClient listings={listings} categories={categories} />
        </div>
      </div>

    </div>
  );
}
