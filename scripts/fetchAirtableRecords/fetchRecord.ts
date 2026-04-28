import { AirtableRecord } from "@/data/airtable/types";
import { base } from "./env";

/**
 * Fetch a single record by ID from Airtable
 * @param tableName - The name of the Airtable table
 * @param recordId - The Airtable record ID
 * @returns Promise resolving to single record object
 */
async function fetchRecord(
  tableName: string, 
  recordId: string
): Promise<AirtableRecord> {
  try {
    const record = await base(tableName).find(recordId);

    console.log(`✅ Fetched record ${recordId} from "${tableName}"`);
    return {
      id: record.id,
      fields: record.fields,
      createdTime: record._rawJson?.createdTime || undefined
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error fetching record ${recordId}:`, errorMessage);
    throw new Error(errorMessage);
  }
}