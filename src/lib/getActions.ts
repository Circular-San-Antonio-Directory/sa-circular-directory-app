import pool from './db';
import { CORRESPONDING_ACTION_TO_ACTION_NAME } from './actionMapping';
import type { ActionName } from '@/components/ActionIcon';

export interface ActionConfig {
  actionName: ActionName;
  label: string;     // Display label, e.g. "Donate", "Buy (B2B)" — from Airtable "Corresponding Action"
  iconFile: string;  // ICON_SVGS key, e.g. "Icon-3" — converted from Airtable "Icon to Use" ("Icon 3")
  colorway: string;  // Color family, e.g. "blue", "fern" — from Airtable "Colorway"
}

interface ActionRow {
  corresponding_action: string;
  icon_file: string | null;
  colorway: string | null;
}

export async function getActions(): Promise<ActionConfig[]> {
  const { rows } = await pool.query<ActionRow>(
    `SELECT corresponding_action, icon_file, colorway
     FROM business_actions
     WHERE corresponding_action IS NOT NULL
     ORDER BY display_order ASC NULLS LAST`,
  );

  const configs: ActionConfig[] = [];

  for (const row of rows) {
    const actionName = CORRESPONDING_ACTION_TO_ACTION_NAME[row.corresponding_action.toLowerCase()];
    if (!actionName) continue;

    configs.push({
      actionName,
      label: row.corresponding_action,
      // Airtable stores "Icon 3" (space); ICON_SVGS keys use "Icon-3" (hyphen)
      iconFile: row.icon_file ? row.icon_file.replace(' ', '-') : 'Icon-1',
      colorway: row.colorway ?? 'mono',
    });
  }

  return configs;
}
