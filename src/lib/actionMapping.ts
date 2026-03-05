import type { ActionName } from '@/components/ActionIcon/ActionIcon';

/**
 * Maps raw CSV action values (business perspective, lowercase) to ActionName
 * (user-facing perspective) for display in the listing component.
 *
 * CSV value       → user sees
 * Accepts Dropoff → Donate
 * Sells           → Buy
 * Consigns        → Consign
 * etc.
 */
export const CSV_ACTION_TO_ACTION_NAME: Partial<Record<string, ActionName>> = {
  'accepts dropoff':         'donate',
  'accepts donations':       'donate',
  'buys':                    'sell',
  'consigns':                'consign',
  'consigns/gives credit':   'consign',
  'sells':                   'buy',
  'refills':                 'refill',
  'repairs/fixes':           'repair',
  'composts':                'compost',
  'recycles':                'recycle',
  'trade':                   'trade',
  // Deferred (no SVG yet): 'sells (b2b)', 'processes', 'rents'
};

/**
 * Converts a raw CSV action string to an ActionName, or null if unmapped.
 */
export function csvActionToActionName(csvValue: string): ActionName | null {
  return CSV_ACTION_TO_ACTION_NAME[csvValue.trim().toLowerCase()] ?? null;
}
