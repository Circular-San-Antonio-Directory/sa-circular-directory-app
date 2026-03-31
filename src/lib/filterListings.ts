import type { ActionName } from '@/components/ActionIcon';
import type { Listing } from './getListings';
import type { Category } from './getCategories';

/**
 * Filters listings by search query and/or action filter.
 *
 * When BOTH are active the category match is cross-checked against the action
 * group it belongs to — preventing false positives like a listing that accepts
 * book donations (Donate/input) from appearing when the user filters by Buy.
 *
 * Rules:
 * - Search only  → match name/address OR any category across all groups
 * - Action only  → match any listing whose allActionNames includes the action
 * - Both active  → (name/address match AND listing has the action)
 *                  OR (category in input group matches AND input group has the action)
 *                  OR (category in output group matches AND output group has the action)
 *                  OR (category in service group matches AND service group has the action)
 */
export function filterListings(
  listings: Listing[],
  categories: Category[],
  searchQuery: string,
  actionFilter: ActionName | null,
): Listing[] {
  const q = searchQuery.trim().toLowerCase();

  // Nothing active — return everything
  if (!q && !actionFilter) return listings;

  // Action only — straightforward membership check
  if (!q && actionFilter) {
    return listings.filter((l) => l.fields.allActionNames.includes(actionFilter));
  }

  // Build the set of category names whose items contain the search term
  const matchedCategoryNames = new Set(
    categories
      .filter((cat) => cat.items.some((item) => item.includes(q)))
      .map((cat) => cat.category),
  );

  // Search only — match name/address OR any category (behaviour unchanged)
  if (!actionFilter) {
    return listings.filter((l) => {
      const nameOrAddress =
        l.fields.businessName.toLowerCase().includes(q) ||
        l.fields.address.toLowerCase().includes(q);
      const categoryMatch = [
        ...l.fields.inputCategories,
        ...l.fields.outputCategories,
        ...l.fields.serviceCategories,
      ].some((cat) => matchedCategoryNames.has(cat));
      return nameOrAddress || categoryMatch;
    });
  }

  // Both active — enforce per-group action↔category pairing
  return listings.filter((l) => {
    // Name/address hit: the listing must also carry the selected action
    const nameOrAddressWithAction =
      (l.fields.businessName.toLowerCase().includes(q) ||
        l.fields.address.toLowerCase().includes(q)) &&
      l.fields.allActionNames.includes(actionFilter);

    if (nameOrAddressWithAction) return true;

    // Category hit: the matching category must live in the same group as the action
    const inputMatch =
      l.fields.inputActionNames.includes(actionFilter) &&
      l.fields.inputCategories.some((c) => matchedCategoryNames.has(c));
    if (inputMatch) return true;

    const outputMatch =
      l.fields.outputActionNames.includes(actionFilter) &&
      l.fields.outputCategories.some((c) => matchedCategoryNames.has(c));
    if (outputMatch) return true;

    const serviceMatch =
      l.fields.serviceActionNames.includes(actionFilter) &&
      l.fields.serviceCategories.some((c) => matchedCategoryNames.has(c));
    return serviceMatch;
  });
}
