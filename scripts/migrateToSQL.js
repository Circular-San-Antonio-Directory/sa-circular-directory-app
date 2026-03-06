require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getClient, testConnection, end } = require('./dbConfig');

/**
 * Read and parse JSON data file
 */
function readDataFile(filename) {
  const filepath = path.join(__dirname, '..', 'data', filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }
  const data = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(data);
}

/**
 * Execute SQL schema file
 */
async function executeSchemaFile(client) {
  const schemaPath = path.join(__dirname, '..', 'migrations', '002_simplified_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('📋 Creating database schema...');
  await client.query(schema);
  console.log('✅ Schema created successfully\n');
}

/**
 * Insert lookup table data and return mapping
 */
async function insertLookupTable(client, tableName, dataFile, fieldMapping) {
  console.log(`📥 Migrating ${tableName}...`);

  const data = readDataFile(dataFile);
  const mapping = {}; // airtable_id -> sql_id

  for (const record of data) {
    if (!record.fields || Object.keys(record.fields).length === 0) {
      continue; // Skip empty records
    }

    const columns = ['airtable_id'];
    const values = [record.id];
    const placeholders = ['$1'];
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

    const result = await client.query(query, values);
    mapping[record.id] = result.rows[0].id;
  }

  console.log(`   ✅ Inserted ${Object.keys(mapping).length} ${tableName}\n`);
  return mapping;
}

/**
 * Convert array of Airtable IDs to array of SQL IDs
 */
function mapIdsToArray(airtableIds, mapping) {
  if (!airtableIds || !Array.isArray(airtableIds) || airtableIds.length === 0) {
    return null;
  }

  const sqlIds = airtableIds
    .map(airtableId => mapping[airtableId])
    .filter(id => id !== undefined && id !== null);

  return sqlIds.length > 0 ? sqlIds : null;
}

/**
 * Insert businesses (main table) with array columns
 */
async function insertBusinesses(client, mappings) {
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
    const output_category_ids = mapIdsToArray(fields['OUTPUT Category(s) (Product Sold)'], mappings.categories);
    const service_category_ids = mapIdsToArray(fields['SERVICE Category(s)'], mappings.categories);
    const core_material_ids = mapIdsToArray(fields['Core Material System'], mappings.coreMaterials);
    const enabling_system_ids = mapIdsToArray(fields['Enabling System'], mappings.enablingSystems);
    const activity_ids = mapIdsToArray(fields['Notable Business Events/Activities'], mappings.activities);

    const query = `
      INSERT INTO businesses (
        airtable_id, business_name, business_description, address,
        business_email, business_phone, website,
        contact_name, contact_email, contacted_by,
        instagram_url_1, instagram_url_2, facebook_url, linkedin_url,
        google_hours_accurate, business_hours,
        input_notes, input_category_override,
        output_notes, output_category_override,
        service_notes, service_category_override,
        has_delivery, has_pickup, has_online_shop, online_shop_link,
        volunteer_opportunities, volunteer_notes,
        listing_photo_url,
        airtable_created_at,
        business_type_ids, tag_ids,
        input_action_ids, output_action_ids, service_action_ids,
        input_category_ids, output_category_ids, service_category_ids,
        core_material_ids, enabling_system_ids, activity_ids
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
      )
      RETURNING id
    `;

    const values = [
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
      fields['Has Delivery services'] || false,
      fields['Has Pick Up service'] || false,
      fields['Has Online Shop'] || false,
      fields['If online shop, Link'] || null,
      fields['VOLUNTEER Opportunities'] || false,
      fields['VOLUNTEER - Notes Field'] || null,
      fields['Listing Photo'] || null,
      record.createdTime || null,
      // Array columns
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

    await client.query(query, values);
    insertCount++;
  }

  console.log(`   ✅ Inserted ${insertCount} businesses with relationship arrays\n`);
  return insertCount;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n🚀 Starting Airtable → PostgreSQL Migration (Simplified Schema)\n');
  console.log('================================================\n');

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }

  console.log('\n================================================\n');

  const client = await getClient();

  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Execute schema
    await executeSchemaFile(client);

    // 2. Insert lookup tables and collect mappings
    const businessTypesMapping = await insertLookupTable(
      client,
      'business_types',
      'business-type.json',
      { 'Name': 'name' }
    );

    const categoriesMapping = await insertLookupTable(
      client,
      'categories',
      'categories.json',
      { 'Category': 'category', 'Notes': 'notes' }
    );

    const tagsMapping = await insertLookupTable(
      client,
      'tags',
      'tag.json',
      { 'Name': 'name', 'Description': 'description' }
    );

    const actionsMapping = await insertLookupTable(
      client,
      'business_actions',
      'business-actions.json',
      { 'Action': 'action', 'Corresponding Action': 'corresponding_action', 'Order for Display': 'display_order' }
    );

    const coreMaterialsMapping = await insertLookupTable(
      client,
      'core_material_systems',
      'core-material-system.json',
      { 'Name': 'name', 'Description': 'description' }
    );

    const enablingSystemsMapping = await insertLookupTable(
      client,
      'enabling_systems',
      'enabling-systems.json',
      { 'Name': 'name', 'Description': 'description' }
    );

    const activitiesMapping = await insertLookupTable(
      client,
      'business_activities',
      'business-activity.json',
      { 'Name': 'name', 'Description': 'description' }
    );

    // 3. Insert businesses with array columns
    const businessCount = await insertBusinesses(client, {
      businessTypes: businessTypesMapping,
      categories: categoriesMapping,
      tags: tagsMapping,
      actions: actionsMapping,
      coreMaterials: coreMaterialsMapping,
      enablingSystems: enablingSystemsMapping,
      activities: activitiesMapping
    });

    // Commit transaction
    await client.query('COMMIT');

    console.log('================================================\n');
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Business Types: ${Object.keys(businessTypesMapping).length}`);
    console.log(`   - Categories: ${Object.keys(categoriesMapping).length}`);
    console.log(`   - Tags: ${Object.keys(tagsMapping).length}`);
    console.log(`   - Actions: ${Object.keys(actionsMapping).length}`);
    console.log(`   - Core Materials: ${Object.keys(coreMaterialsMapping).length}`);
    console.log(`   - Enabling Systems: ${Object.keys(enablingSystemsMapping).length}`);
    console.log(`   - Business Activities: ${Object.keys(activitiesMapping).length}`);
    console.log(`   - Businesses: ${businessCount}`);
    console.log('\n📋 Schema Info:');
    console.log('   - Total Tables: 8 (no junction tables!)');
    console.log('   - Using PostgreSQL arrays for relationships');
    console.log('   - GIN indexes created for fast array searches');
    console.log('\n💡 Example Queries:');
    console.log('   -- Find businesses with tag_id 1:');
    console.log('   SELECT * FROM businesses WHERE tag_ids @> ARRAY[1];');
    console.log('\n   -- Find businesses with ANY of tags [1,2,3]:');
    console.log('   SELECT * FROM businesses WHERE tag_ids && ARRAY[1,2,3];');
    console.log('\n   -- Get business with expanded names:');
    console.log('   SELECT * FROM businesses_complete WHERE id = 1;');
    console.log('\n================================================\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
    throw error;

  } finally {
    client.release();
    await end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { migrate };
