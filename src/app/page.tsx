import { Nav } from '@/components/Nav';
import { getListings } from '@/lib/getListings';
import { DirectoryClient } from './DirectoryClient';
import { MobileBottomSheet } from './MobileBottomSheet';
import styles from './page.module.scss';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const listings = await getListings();

  return (
    <div className={styles.page}>

      {/* Desktop: padded content wrapper */}
      <div className={styles.pageInner}>
        <Nav />

        <div className={styles.contentArea}>
          <DirectoryClient listings={listings} />
        </div>
      </div>

      {/* Mobile bottom sheet — interactive, shown only on mobile */}
      <MobileBottomSheet listings={listings} />

    </div>
  );
}
