import { Nav } from '@/components/Nav';
import { getListings } from '@/lib/getListings';
import { getCategories } from '@/lib/getCategories';
import { getActions } from '@/lib/getActions';
import { ActionsProvider } from '@/components/ActionIcon';
import { DirectoryClient } from './DirectoryClient';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [listings, categories, actions] = await Promise.all([
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
            <DirectoryClient listings={listings} categories={categories} />
          </ActionsProvider>
        </div>
      </div>

    </div>
  );
}
