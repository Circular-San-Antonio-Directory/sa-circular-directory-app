import { AIRTABLE_TABLES } from '../../src/lib/schema/tables';
import type { TableDefinition } from './types';

// Derived from the single source of truth in src/lib/schema/tables.ts
export const tables: TableDefinition[] = Object.values(AIRTABLE_TABLES).map(t => ({
  name: t.name,
  id: t.id,
}));

export const PRODUCTION_DB = AIRTABLE_TABLES.businesses.name;
