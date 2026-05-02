
import prisma from './db';
import { CORRESPONDING_ACTION_TO_ACTION_NAME } from './actionMapping';
import type { ActionName } from '@/components/ActionIcon';

export interface ActionConfig {
  actionName: ActionName;
  label: string;     // Display label from Airtable "Corresponding Action" — change it there, no code update needed
  iconFile: string;  // ICON_SVGS key, e.g. "Icon-3" — converted from Airtable "Icon to Use" ("Icon 3")
  colorway: string;  // Color family, e.g. "blue", "fern" — from Airtable "Colorway"
}

export async function getActions(): Promise<ActionConfig[]> {
  const rows = await prisma.business_actions.findMany({
    where: { corresponding_action: { not: null } },
    orderBy: { display_order: { sort: 'asc', nulls: 'last' } },
    select: { corresponding_action: true, icon_file: true, colorway: true },
  });

  const configs: ActionConfig[] = [];

  for (const row of rows) {
    const actionName = CORRESPONDING_ACTION_TO_ACTION_NAME[row.corresponding_action!.toLowerCase()];
    if (!actionName) continue;

    configs.push({
      actionName,
      label: row.corresponding_action!,
      // Airtable stores "Icon 3" (space); ICON_SVGS keys use "Icon-3" (hyphen)
      iconFile: row.icon_file ? row.icon_file.replace(' ', '-') : 'Icon-1',
      colorway: row.colorway ?? 'mono',
    });
  }

  return configs;
}
