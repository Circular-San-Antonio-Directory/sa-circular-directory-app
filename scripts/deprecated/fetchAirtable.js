require('dotenv').config();
const Airtable = require('airtable');
const { transformBusinessRecords } = require('../BusinessRecord');

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

const PRODUCTION_DB = "Production DB"

const tables = [
  {
    name: PRODUCTION_DB,
    id: "tblujaqw04RqX2j3P",
  },
  {
    name: "Business Actions",
    id: "tblgqINSWO2dbU47G"
  },
  {
    name: "Categories",
    id: "tblBbF9twnZYHd8jz"
  },
  {
    name: "Business Type",
    id: "tbl6I6Lv3Tie1v5f3"
  },
  {
    name: "Core Material System",
    id: "tbl9CXIR5KUnby3el"
  },
  {
    name: "Tag",
    id: "tblFGOQaD3M8uffIq"
  },
  {
    name: "Business Activity",
    id: "tblhVXx855N83v61I"
  },
  {
    name: "Enabling Systems",
    id: "tbl2LvLDN92wihXrk"
  },
]

/**
 * Fetch all records from a specific table
 * @param {string} tableName - The name of the Airtable table
 * @param {object} options - Optional query parameters (filterByFormula, sort, maxRecords, etc.)
 * @returns {Promise<Array>} - Array of records
 */
async function fetchRecords(tableName, options = {}) {
  try {
    const records = [];

    await base(tableName)
      .select({
        // Default options (can be overridden)
        maxRecords: options.maxRecords || 100,
        view: options.view || 'Grid view',
        ...options
      })
      .eachPage((pageRecords, fetchNextPage) => {
        // Add records from this page
        records.push(...pageRecords.map(record => ({
          id: record.id,
          fields: record.fields,
          createdTime: record._rawJson.createdTime
        })));

        // Fetch next page
        fetchNextPage();
      });

    console.log(`✅ Fetched ${records.length} records from "${tableName}"`);
    return records;

  } catch (error) {
    console.error(`❌ Error fetching records from "${tableName}":`, error.message);
    throw error;
  }
}

/**
 * Fetch a single record by ID
 * @param {string} tableName - The name of the Airtable table
 * @param {string} recordId - The Airtable record ID
 * @returns {Promise<object>} - Single record object
 */
async function fetchRecord(tableName, recordId) {
  try {
    const record = await base(tableName).find(recordId);

    console.log(`✅ Fetched record ${recordId} from "${tableName}"`);
    return {
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson.createdTime
    };

  } catch (error) {
    console.error(`❌ Error fetching record ${recordId}:`, error.message);
    throw error;
  }
}

/**
 * Sanitize table name for use as filename
 * @param {string} tableName - The table name to sanitize
 * @returns {string} - Sanitized filename
 */
function sanitizeTableName(tableName) {
  return tableName
    .toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-');       // Replace multiple hyphens with single
}

/**
 * Fetch all tables defined in the tables array
 * @param {object} options - Options for fetching
 * @param {boolean} options.saveFiles - Whether to save individual files (default: true)
 * @param {boolean} options.continueOnError - Continue if a table fails (default: true)
 * @returns {Promise<object>} - Object with table names as keys and their records as values
 */
async function fetchAllTables(options = {}) {
  const { saveFiles = true, continueOnError = true } = options;
  const fs = require('fs');
  const allTableData = {};
  const summary = {
    fetchedAt: new Date().toISOString(),
    tables: {},
    totalRecords: 0,
    errors: []
  };

  console.log(`🚀 Fetching ${tables.length} tables...\n`);

  // Create data directory if it doesn't exist
  if (saveFiles && !fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }

  // Fetch each table
  for (const table of tables) {
    try {
      console.log(`📥 Fetching "${table.name}"...`);
      const records = await fetchRecords(table.name);

      // Store in results object
      allTableData[table.name] = records;

      // Update summary
      summary.tables[table.name] = {
        recordCount: records.length,
        status: 'success'
      };
      summary.totalRecords += records.length;

      // Save individual table file
      if (saveFiles) {
        const filename = sanitizeTableName(table.name);
        const filepath = `./data/${filename}.json`;
        fs.writeFileSync(filepath, JSON.stringify(records, null, 2));
        console.log(`   💾 Saved to ${filepath}`);
      }

      console.log(''); // Empty line for readability

    } catch (error) {
      const errorMsg = `Failed to fetch "${table.name}": ${error.message}`;
      console.error(`   ❌ ${errorMsg}\n`);

      summary.tables[table.name] = {
        recordCount: 0,
        status: 'error',
        error: error.message
      };
      summary.errors.push(errorMsg);

      if (!continueOnError) {
        throw error;
      }
    }
  }

  // Save combined data file
  if (saveFiles) {
    const allTablesPath = './data/all-tables.json';
    fs.writeFileSync(allTablesPath, JSON.stringify(allTableData, null, 2));
    console.log(`\n💾 All tables saved to ${allTablesPath}`);

    // Save summary
    const summaryPath = './data/fetch-summary.json';
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Summary saved to ${summaryPath}`);
  }

  console.log(`\n✅ Fetch complete! Total records: ${summary.totalRecords}`);
  if (summary.errors.length > 0) {
    console.log(`⚠️  Encountered ${summary.errors.length} error(s)`);
  }

  return {
    data: allTableData,
    summary
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    // Validate environment variables
    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('AIRTABLE_API_KEY is not set in .env file');
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID is not set in .env file');
    }

    fetchAllTables();

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

// Export functions for use in other scripts
module.exports = {
  fetchRecords,
  fetchRecord,
  fetchAllTables,
  sanitizeTableName,
  base,
  tables
};
