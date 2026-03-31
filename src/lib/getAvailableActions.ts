import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from './getListings';
import type { Category } from './getCategories';

/**
 * Returns the set of ActionNames present in listings that match the given
 * search query. When searchQuery is empty, all listings are considered.
 *
 * Used to restrict action filter options to only those relevant to the
 * current search results — rather than showing all possible actions at all times.
 */
export function getAvailableActions(
  listings: Listing[],
  categories: Category[],
  searchQuery: string,
): Set<ActionName> {
  let filtered = listings;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();

    const matchedCategoryNames = new Set(
      categories
        .filter((cat) => cat.items.some((item) => item.includes(q)))
        .map((cat) => cat.category),
    );

    filtered = listings.filter((l) => {
      const nameOrAddress =
        l.fields.businessName.toLowerCase().includes(q) ||
        l.fields.address.toLowerCase().includes(q);

      const allCategories = [
        ...l.fields.inputCategories,
        ...l.fields.outputCategories,
        ...l.fields.serviceCategories,
      ];
      const categoryItemMatch = allCategories.some((cat) =>
        matchedCategoryNames.has(cat),
      );

      return nameOrAddress || categoryItemMatch;
    });
  }

  const available = new Set<ActionName>();
  for (const listing of filtered) {
    for (const action of listing.fields.allActionNames) {
      available.add(action);
    }
  }
  return available;
}
