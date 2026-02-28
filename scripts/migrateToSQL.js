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
  const schemaPath = path.join(__dirname, '..', 'migrations', '001_create_schema.sql');
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
 * Insert businesses (main table)
 */
async function insertBusinesses(client) {
  console.log('📥 Migrating businesses...');

  const data = readDataFile('production-db.json');
  const mapping = {}; // airtable_id -> sql_id

  for (const record of data) {
    if (!record.fields || Object.keys(record.fields).length === 0) {
      continue; // Skip empty records
    }

    const fields = record.fields;

    const query = `
      INSERT INTO businesses (
        airtable_id, business_name, business_description, address,
        business_email, business_phone, website,
        contact_name, contact_email, contacted_by,
        instagram_url_1, instagram_url_2, facebook_url, linkedin_url,
        google_hours_accurate, business_hours,
        input_notes, input_category_override,
        has_delivery, has_pickup, has_online_shop, online_shop_link,
        volunteer_opportunities, volunteer_notes,
        airtable_created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25
      )
      RETURNING id, airtable_id
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
      fields['Has Delivery services'] || false,
      fields['Has Pick Up service'] || false,
      fields['Has Online Shop'] || false,
      fields['If online shop, Link'] || null,
      fields['VOLUNTEER Opportunities'] || false,
      fields['VOLUNTEER - Notes Field'] || null,
      record.createdTime || null
    ];

    const result = await client.query(query, values);
    mapping[record.id] = {
      sqlId: result.rows[0].id,
      fields: fields
    };
  }

  console.log(`   ✅ Inserted ${Object.keys(mapping).length} businesses\n`);
  return mapping;
}

/**
 * Insert junction table relationships
 */
async function insertJunctionTable(client, tableName, businessMapping, lookupMapping, businessData, airtableFieldName) {
  console.log(`🔗 Creating ${tableName} relationships...`);

  let count = 0;

  for (const [airtableId, businessInfo] of Object.entries(businessMapping)) {
    const fields = businessInfo.fields;
    const airtableIds = fields[airtableFieldName];

    if (airtableIds && Array.isArray(airtableIds)) {
      for (const lookupAirtableId of airtableIds) {
        const lookupSqlId = lookupMapping[lookupAirtableId];

        if (lookupSqlId) {
          const query = `
            INSERT INTO ${tableName} (business_id, ${getJunctionColumnName(tableName)})
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `;

          await client.query(query, [businessInfo.sqlId, lookupSqlId]);
          count++;
        }
      }
    }
  }

  console.log(`   ✅ Created ${count} ${tableName} links\n`);
}

/**
 * Get the second column name for junction tables
 */
function getJunctionColumnName(tableName) {
  const mapping = {
    'business_business_types': 'business_type_id',
    'business_tags': 'tag_id',
    'business_input_actions': 'action_id',
    'business_output_actions': 'action_id',
    'business_service_actions': 'action_id',
    'business_input_categories': 'category_id',
    'business_output_categories': 'category_id',
    'business_service_categories': 'category_id',
    'business_core_materials': 'material_id',
    'business_enabling_systems': 'system_id',
    'business_activity_events': 'activity_id'
  };
  return mapping[tableName] || 'related_id';
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('\n🚀 Starting Airtable → PostgreSQL Migration\n');
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

    // 2. Insert lookup tables
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
      { 'Action': 'action' }
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

    // 3. Insert businesses
    const businessMapping = await insertBusinesses(client);

    // 4. Insert junction table relationships
    await insertJunctionTable(
      client,
      'business_business_types',
      businessMapping,
      businessTypesMapping,
      null,
      'Type of Business'
    );

    await insertJunctionTable(
      client,
      'business_tags',
      businessMapping,
      tagsMapping,
      null,
      'TAGS'
    );

    await insertJunctionTable(
      client,
      'business_input_actions',
      businessMapping,
      actionsMapping,
      null,
      'INPUT Action(s)'
    );

    await insertJunctionTable(
      client,
      'business_output_actions',
      businessMapping,
      actionsMapping,
      null,
      'OUTPUT Action(s)'
    );

    await insertJunctionTable(
      client,
      'business_service_actions',
      businessMapping,
      actionsMapping,
      null,
      'SERVICE Action(s)'
    );

    await insertJunctionTable(
      client,
      'business_input_categories',
      businessMapping,
      categoriesMapping,
      null,
      'INPUT Category(s)'
    );

    await insertJunctionTable(
      client,
      'business_output_categories',
      businessMapping,
      categoriesMapping,
      null,
      'OUTPUT Category(s) (Product Sold)'
    );

    await insertJunctionTable(
      client,
      'business_service_categories',
      businessMapping,
      categoriesMapping,
      null,
      'SERVICE Category(s)'
    );

    await insertJunctionTable(
      client,
      'business_core_materials',
      businessMapping,
      coreMaterialsMapping,
      null,
      'Core Material System'
    );

    await insertJunctionTable(
      client,
      'business_enabling_systems',
      businessMapping,
      enablingSystemsMapping,
      null,
      'Enabling System'
    );

    await insertJunctionTable(
      client,
      'business_activity_events',
      businessMapping,
      activitiesMapping,
      null,
      'Notable Business Events/Activities'
    );

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
    console.log(`   - Businesses: ${Object.keys(businessMapping).length}`);
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
