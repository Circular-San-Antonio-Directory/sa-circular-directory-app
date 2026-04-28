import { AirtableRecord } from "@/data/airtable/types";

export interface TableDefinition {
  name: string;
  id: string;
}

export interface FetchOptions {
  maxRecords?: number;
  view?: string;
  filterByFormula?: string;
  sort?: string | null;
}

export interface RecordResult extends AirtableRecord {
  _rawJson?: any;
}

export interface TableSummary {
  recordCount: number;
  status: 'success' | 'error';
  error?: string;
}

export interface FetchSummary {
  fetchedAt: string;
  tables: Record<string, TableSummary>;
  totalRecords: number;
  errors: string[];
}

export interface AllTablesData {
  [tableName: string]: AirtableRecord[];
}