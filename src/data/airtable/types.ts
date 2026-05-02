export interface FieldMappingEntry {
  sqlColumn: string;              // The SQL column name
  type?: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;             // Include even if null/empty
}

export type FieldMappingConfig = Record<string, FieldMappingEntry>;

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}