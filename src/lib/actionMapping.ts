import type { ActionName } from '@/components/ActionIcon/ActionIcon';

/**
 * Maps raw Airtable "Action" values (business perspective) to ActionName
 * (user-facing perspective) for display in the listing component.
 *
 * Action (Airtable)       → ActionName
 * "Accepts Dropoff"       → donate
 * "Sells"                 → buy
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
  'sells (b2b)':             'buyB2B',
  'processes':               'process',
  'processes (?)':           'process',
  'rents':                   'rent',
  'needs volunteers':        'volunteer',
  'has restaurant or bar':   'dineOrDrink',
};

/**
 * Maps "Corresponding Action" values (from Airtable) to ActionName.
 * These are the canonical user-facing labels stored in business_actions.corresponding_action.
 */
export const CORRESPONDING_ACTION_TO_ACTION_NAME: Partial<Record<string, ActionName>> = {
  'donate':        'donate',
  'buy':           'buy',
  'buy (b2b)':     'buyB2B',
  'sell':          'sell',
  'consign':       'consign',
  'trade':         'trade',
  'repair':        'repair',
  'recycle':       'recycle',
  'compost':       'compost',
  'volunteer':     'volunteer',
  'refill':        'refill',
  'rent':          'rent',
  'process':       'process',
  'dine or drink': 'dineOrDrink',
};

/**
 * Converts a raw Airtable action string to an ActionName, or null if unmapped.
 * Tries the "Action" field mapping first, then falls back to "Corresponding Action" mapping.
 */
export function csvActionToActionName(csvValue: string): ActionName | null {
  const lower = csvValue.trim().toLowerCase();
  return CSV_ACTION_TO_ACTION_NAME[lower]
    ?? CORRESPONDING_ACTION_TO_ACTION_NAME[lower]
    ?? null;
}
