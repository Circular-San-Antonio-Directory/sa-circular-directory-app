import { AirtableRecord } from "@/data/airtable/types";
import { tables } from "./constants";
import { fetchRecords } from "./fetchRecords";
import { AllTablesData, FetchSummary } from "./types";

/**
 * Sanitize table name for use as filename
 * @param tableName - The table name to sanitize
 * @returns Sanitized filename string
 */
function sanitizeTableName(tableName: string): string {
  return tableName
    .toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-');       // Replace multiple hyphens with single
}

// ============================================
// Main Fetch All Tables Function
// ============================================

/**
 * Fetch all tables defined in the tables array
 * @param options - Options for fetching
 * @returns Promise resolving to object with table data and summary
 */
export async function fetchAllTables(
  options: { 
    saveFiles?: boolean; 
    continueOnError?: boolean 
  } = {}
): Promise<{ data: AllTablesData; summary: FetchSummary }> {
  const { saveFiles = true, continueOnError = true } = options;
  
  // Import fs module with proper typing
  const fs = require('fs');
  
  const allTableData: AllTablesData = {};
  const summary: FetchSummary = {
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

  // Fetch each table with proper error handling
  for (const table of tables) {
    try {
      console.log(`📥 Fetching "${table.name}"...`);
      const records: AirtableRecord[] = await fetchRecords(table.name);

      // Store in results object
      allTableData[table.name] = records;

      // Update summary
      summary.tables[table.name] = {
        recordCount: records.length,
        status: 'success' as const
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorMsg = `Failed to fetch "${table.name}": ${errorMessage}`;
      
      console.error(`   ❌ ${errorMsg}\n`);

      summary.tables[table.name] = {
        recordCount: 0,
        status: 'error' as const,
        error: errorMessage
      };
      summary.errors.push(errorMsg);

      if (!continueOnError) {
        throw new Error(errorMsg);
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
