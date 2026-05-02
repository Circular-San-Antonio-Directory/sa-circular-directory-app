/** Field mapping for lookup tables */
export type FieldMapping = Record<string, string>;

/** Mapping result from insertLookupTable */
export type LookupMapping = Record<string, number>;

/** Mappings object passed to insertBusinesses */
export interface BusinessMappings {
  businessTypes: LookupMapping;
  categories: LookupMapping;
  tags: LookupMapping;
  actions: LookupMapping;
  coreMaterials: LookupMapping;
  enablingSystems: LookupMapping;
  activities: LookupMapping;
}

/** Database client type */
export interface DbClient {
  query(sql: string, params?: any[]): Promise<any>;
  release(): void;
}