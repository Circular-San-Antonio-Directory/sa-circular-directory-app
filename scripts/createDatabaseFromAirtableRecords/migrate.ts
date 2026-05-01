import { end, getClient, testConnection } from "../dbConfig";
import { executeSchemaFile, insertBusinesses, insertLookupTable } from "./helpers";
import { DbClient } from "./types";

/**
 * Main migration function
 */
export async function migrate(): Promise<void> {
  console.log('\n🚀 Starting Airtable → PostgreSQL Migration (Simplified Schema)\n');
  console.log('================================================\n');

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Test connection (assuming testConnection exists in dbConfig)
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }

  console.log('\n================================================\n');

  const client: DbClient = await getClient();

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
      { 
        'Action': 'action', 
        'Corresponding Action': 'corresponding_action', 
        'Order for Display': 'display_order' 
      }
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
    console.error('\n❌ Migration failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\n📋 Stack trace:', error.stack);
    }
    throw error;
  } finally {
    client.release();
    await end();
  }
}