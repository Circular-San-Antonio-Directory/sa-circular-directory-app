import { AirtableRecord } from "@/data/airtable/types";
import { BusinessMappings, DbClient, FieldMapping, LookupMapping } from "./types";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Read and parse JSON data file
 */
function readDataFile(filename: string): AirtableRecord[] {
  const filepath = path.join(__dirname, '..', 'data', filename);
  
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }
  
  try {
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data) as AirtableRecord[];
  } catch (error) {
    console.error(`❌ Error reading file ${filename}:`, error);
    return [];
  }
}

/**
 * Execute SQL schema file
 */
export async function executeSchemaFile(client: DbClient): Promise<void> {
  const schemaPath = path.join(__dirname, '..', 'migrations', 'current_schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️  Schema file not found: ${schemaPath}`);
    return;
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('📋 Creating database schema...');
  await client.query(schema);
  console.log('✅ Schema created successfully\n');
}

/**
 * Insert lookup table data and return mapping
 */
export async function insertLookupTable(
  client: DbClient,
  tableName: string,
  dataFile: string,
  fieldMapping: FieldMapping
): Promise<LookupMapping> {
  console.log(`📥 Migrating ${tableName}...`);

  const data = readDataFile(dataFile);
  const mapping: LookupMapping = {}; // airtable_id -> sql_id

  for (const record of data) {
    if (!record.fields || Object.keys(record.fields).length === 0) {
      continue; // Skip empty records
    }

    const columns = ['airtable_id'];
    const values: any[] = [record.id];
    const placeholders: string[] = ['$1'];
    let paramIndex = 2;

    // Map fields
    for (const [airtableField, sqlField] of Object.entries(fieldMapping)) {
      if (record.fields[airtableField]) {
        columns.push(sqlField);
        values.push(record.fields[airtableField]);
        placeholders.push(`$${paramIndex++}`);
      }
    }

    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, airtable_id
    `;

    try {
      const result = await client.query(query, values);
      if (result.rows && result.rows.length > 0) {
        mapping[record.id] = result.rows[0].id as number;
      }
    } catch (error) {
      console.error(`   ❌ Error inserting ${tableName} record:`, error);
      continue;
    }
  }

  console.log(`   ✅ Inserted ${Object.keys(mapping).length} ${tableName}\n`);
  return mapping;
}

/**
 * Convert array of Airtable IDs to array of SQL IDs
 */
export function mapIdsToArray(airtableIds: string[] | undefined, mapping: LookupMapping): number[] | null {
  if (!airtableIds || !Array.isArray(airtableIds) || airtableIds.length === 0) {
    return null;
  }

  const sqlIds = airtableIds
    .map((airtableId) => mapping[airtableId])
    .filter((id): id is number => id !== undefined && id !== null);

  return sqlIds.length > 0 ? sqlIds : null;
}

/**
 * Insert businesses (main table) with array columns
 */
export async function insertBusinesses(
  client: DbClient,
  mappings: BusinessMappings
): Promise<number> {
  console.log('📥 Migrating businesses with relationship arrays...');

  const data = readDataFile('production-db.json');
  let insertCount = 0;

  for (const record of data) {
    if (!record.fields || Object.keys(record.fields).length === 0) {
      continue; // Skip empty records
    }

    const fields = record.fields;

    // Map Airtable IDs to SQL ID arrays
    const business_type_ids = mapIdsToArray(fields['Type of Listing'], mappings.businessTypes);
    const tag_ids = mapIdsToArray(fields['TAGS'], mappings.tags);
    const input_action_ids = mapIdsToArray(fields['INPUT Action(s)'], mappings.actions);
    const output_action_ids = mapIdsToArray(fields['OUTPUT Action(s)'], mappings.actions);
    const service_action_ids = mapIdsToArray(fields['SERVICE Action(s)'], mappings.actions);
    const input_category_ids = mapIdsToArray(fields['INPUT Category(s)'], mappings.categories);
    const output_category_ids = mapIdsToArray(
      fields['OUTPUT Action(s) (Product Sold)'], 
      mappings.categories
    );
    const service_category_ids = mapIdsToArray(fields['SERVICE Category(s)'], mappings.categories);
    const core_material_ids = mapIdsToArray(fields['Core Material System'], mappings.coreMaterials);
    const enabling_system_ids = mapIdsToArray(fields['Enabling System'], mappings.enablingSystems);
    const activity_ids = mapIdsToArray(fields['Notable Business Events/Activities'], mappings.activities);

    // Build dynamic query with all columns
    const columnList = [
      'airtable_id', 'business_name', 'business_description', 'address',
      'business_email', 'business_phone', 'website',
      'contact_name', 'contact_email', 'contacted_by',
      'instagram_url_1', 'instagram_url_2', 'facebook_url', 'linkedin_url',
      'google_hours_accurate', 'business_hours',
      'input_notes', 'input_category_override',
      'output_notes', 'output_category_override',
      'service_notes', 'service_category_override',
      'has_delivery', 'has_pickup', 'has_online_shop', 'online_shop_link',
      'volunteer_opportunities', 'volunteer_notes',
      'listing_photo_url', 'airtable_created_at',
      'business_type_ids', 'tag_ids',
      'input_action_ids', 'output_action_ids', 'service_action_ids',
      'input_category_ids', 'output_category_ids', 'service_category_ids',
      'core_material_ids', 'enabling_system_ids', 'activity_ids'
    ];

    const valueList = [
      record.id,
      fields['Business Name'] || null,
      fields['Business Descriptios'] || null, // Note: typo in Airtable
      fields['Address'] || null,
      fields['Business Email'] || null,
      fields['Business Phone'] || null,
      fields['Website'] || null,
      fields['Contact Name'] || null,
      fields['Contact Email'] || null,
      fields['Contacted by'] || null,
      fields['SOCIAL - Instagram URL 1'] || null,
      fields['SOCIAL- Instagram URL 2'] || null,
      fields['SOCIAL - Facebook URL'] || null,
      fields['SOCIAL - LinkedIn URL'] || null,
      fields['Google listed hours accurate?'] || null,
      fields['Business Hours'] || null,
      fields['INPUT - Notes Field'] || null,
      fields['INPUT Category - Override (Unique items or category)'] || null,
      fields['OUTPUT - Notes Field'] || null,
      fields['OUTPUT Category - Override (Unique items or category)'] || null,
      fields['SERVICE - Notes Field'] || null,
      fields['SERVICE Category - Override (Unique items or category)'] || null,
      fields['Has Delivery services'] ?? false,
      fields['Has Pick Up service'] ?? false,
      fields['Has Online Shop'] ?? false,
      fields['If online shop, Link'] || null,
      fields['VOLUNTEER Opportunities'] ?? false,
      fields['VOLUNTEER - Notes Field'] || null,
      fields['Listing Photo'] || null,
      record.createdTime || null,
      // Array columns (can be null)
      business_type_ids,
      tag_ids,
      input_action_ids,
      output_action_ids,
      service_action_ids,
      input_category_ids,
      output_category_ids,
      service_category_ids,
      core_material_ids,
      enabling_system_ids,
      activity_ids
    ];

    // Build query dynamically to avoid hardcoding placeholders
    const columnPlaceholders = valueList.map(() => '$' + (valueList.indexOf('$') + 1));
    
    const query = `
      INSERT INTO businesses (
        ${columnList.join(', ')}
      ) VALUES (
        ${columnPlaceholders.join(', ')}
      )
      RETURNING id
    `;

    try {
      await client.query(query, valueList);
      insertCount++;
    } catch (error) {
      console.error(`   ❌ Error inserting business:`, error);
      continue;
    }
  }

  console.log(`   ✅ Inserted ${insertCount} businesses with relationship arrays\n`);
  return insertCount;
}