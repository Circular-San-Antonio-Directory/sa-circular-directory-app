import pool from './db';
import { CSV_ACTION_TO_ACTION_NAME } from './actionMapping';
import type { ActionName } from '@/components/ActionIcon';

export interface ActionConfig {
  actionName: ActionName;
  label: string;     // Display label from Airtable "Corresponding Action" — change it there, no code update needed
  iconFile: string;  // ICON_SVGS key, e.g. "Icon-3" — converted from Airtable "Icon to Use" ("Icon 3")
  colorway: string;  // Color family, e.g. "blue", "fern" — from Airtable "Colorway"
}

interface ActionRow {
  action: string;
  corresponding_action: string | null;
  icon_file: string | null;
  colorway: string | null;
}

export async function getActions(): Promise<ActionConfig[]> {
  const { rows } = await pool.query<ActionRow>(
    `SELECT action, corresponding_action, icon_file, colorway
     FROM business_actions
     WHERE action IS NOT NULL
     ORDER BY display_order ASC NULLS LAST`,
  );

  const configs: ActionConfig[] = [];

  for (const row of rows) {
    // Resolve ActionName from the stable "Action" field (e.g. "Accepts Dropoff"),
    // not from "Corresponding Action" which is the user-facing label you can rename freely.
    const actionName = CSV_ACTION_TO_ACTION_NAME[row.action.toLowerCase()];
    if (!actionName) continue;

    configs.push({
      actionName,
      label: row.corresponding_action ?? row.action,
      // Airtable stores "Icon 3" (space); ICON_SVGS keys use "Icon-3" (hyphen)
      iconFile: row.icon_file ? row.icon_file.replace(' ', '-') : 'Icon-1',
      colorway: row.colorway ?? 'mono',
    });
  }

  return configs;
}
