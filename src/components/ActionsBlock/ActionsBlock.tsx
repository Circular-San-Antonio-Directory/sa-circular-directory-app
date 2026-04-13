import type { Listing } from '@/lib/getListings';
import type { ActionName } from '@/components/ActionIcon/ActionIcon';
import { ActionIcon } from '@/components/ActionIcon';
import { Pill } from '@/components/Pill';
import styles from './ActionsBlock.module.scss';

// ─── Action helpers ───────────────────────────────────────────────────────────

const ACTION_LABELS: Record<ActionName, string> = {
  donate:      'Donate',
  buy:         'Buy',
  buyB2B:      'Buy (B2B)',
  sell:        'Sell',
  consign:     'Consign',
  trade:       'Trade',
  repair:      'Repair',
  recycle:     'Recycle',
  compost:     'Compost',
  volunteer:   'Volunteer',
  refill:      'Refill',
  rent:        'Rent',
  process:     'Process',
  dineOrDrink: 'Dine or Drink',
};

const INPUT_ACTIONS  = new Set<ActionName>(['donate', 'sell', 'trade']);
const OUTPUT_ACTIONS = new Set<ActionName>(['buy', 'buyB2B', 'consign']);

function getActionContent(action: ActionName, f: Listing['fields']) {
  if (INPUT_ACTIONS.has(action))
    return { categories: f.inputCategories,  override: f.inputCategoryOverride,  notes: f.inputNotes  };
  if (OUTPUT_ACTIONS.has(action))
    return { categories: f.outputCategories, override: f.outputCategoryOverride, notes: f.outputNotes };
  if (action === 'volunteer')
    return { categories: [],                  override: '',                        notes: f.volunteerNotes };
  return   { categories: f.serviceCategories, override: f.serviceCategoryOverride, notes: f.serviceNotes  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ActionsBlockProps {
  fields: Listing['fields'];
}

export function ActionsBlock({ fields: f }: ActionsBlockProps) {
  if (f.allActionNames.length === 0) return null;

  return (
    <div className={styles.actionsBlock}>
      {f.allActionNames.flatMap((action, i) => {
        const { categories, override, notes } = getActionContent(action, f);
        const hasContent = categories.length > 0 || override || notes;
        const row = (
          <details key={action} name="action-row" className={styles.actionRow}>
            <summary className={styles.actionSummary}>
              <ActionIcon action={action} variant="badge" />
              <span className={styles.actionLabel}>
                {ACTION_LABELS[action]}
              </span>
              {hasContent && (
                <i
                  className={`fa-solid fa-chevron-down ${styles.actionChevron}`}
                  aria-hidden="true"
                />
              )}
            </summary>
            {hasContent && (
              <div className={styles.actionContent}>
                {categories.length > 0 && (
                  <div className={styles.actionCategories}>
                    {categories.map((cat) => (
                      <Pill key={cat} label={cat} color="spruce" size="small" />
                    ))}
                  </div>
                )}
                {override && (
                  <div className={styles.actionOverrideBlock}>
                    <span className={`caption-bold ${styles.actionOverrideLabel}`}>Additional Items</span>
                    <p className={`body-small-regular ${styles.actionOverride}`}>{override}</p>
                  </div>
                )}
                {notes && (
                  <p className={styles.actionNote}>{notes}</p>
                )}
              </div>
            )}
          </details>
        );
        if (i === 0) return [row];
        return [<div key={`divider-${action}`} className={styles.actionDivider} aria-hidden="true" />, row];
      })}
    </div>
  );
}
