import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from './getListings';
import type { Category } from './getCategories';

/**
 * Returns the set of ActionNames that are genuinely available for the given
 * search query — using the same per-group logic as filterListings so that
 * e.g. searching "Books" surfaces Donate (books are in a Donate/input group)
 * but not Buy (even if that same listing also sells something else).
 *
 * When searchQuery is empty every action across all listings is included.
 */
export function getAvailableActions(
  listings: Listing[],
  categories: Category[],
  searchQuery: string,
): Set<ActionName> {
  const available = new Set<ActionName>();

  if (!searchQuery.trim()) {
    for (const listing of listings) {
      for (const action of listing.fields.allActionNames) {
        available.add(action);
      }
    }
    return available;
  }

  const q = searchQuery.trim().toLowerCase();

  const matchedCategoryNames = new Set(
    categories
      .filter((cat) => cat.items.some((item) => item.includes(q)))
      .map((cat) => cat.category),
  );

  for (const listing of listings) {
    const nameOrAddress =
      listing.fields.businessName.toLowerCase().includes(q) ||
      listing.fields.address.toLowerCase().includes(q);

    if (nameOrAddress) {
      // Name/address match → all of this listing's actions are relevant
      for (const action of listing.fields.allActionNames) {
        available.add(action);
      }
      continue;
    }

    // Category match — only add actions from the group that matched
    if (listing.fields.inputCategories.some((c) => matchedCategoryNames.has(c))) {
      for (const action of listing.fields.inputActionNames) {
        available.add(action);
      }
    }
    if (listing.fields.outputCategories.some((c) => matchedCategoryNames.has(c))) {
      for (const action of listing.fields.outputActionNames) {
        available.add(action);
      }
    }
    if (listing.fields.serviceCategories.some((c) => matchedCategoryNames.has(c))) {
      for (const action of listing.fields.serviceActionNames) {
        available.add(action);
      }
    }
  }

  return available;
}
