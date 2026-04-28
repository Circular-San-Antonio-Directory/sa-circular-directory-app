import { FieldSet } from "airtable";
import { base } from "./env";
import { FetchOptions, RecordResult } from "./types";
import { Records } from "airtable/lib/records";
import { AirtableRecord } from "@/data/airtable/types";


/**
 * Fetch all records from a specific Airtable table
 * @param tableName - The name of the Airtable table
 * @param options - Optional query parameters
 * @returns Promise resolving to array of records
 */
export async function fetchRecords(
    tableName: string, 
    options: FetchOptions = {}
): Promise<AirtableRecord[]> {
    try {
        const records: AirtableRecord[] = [];

        // Build select options with defaults
        const selectOptions: Record<string, any> = {
            maxRecords: options.maxRecords ?? 100,
            view: options.view || 'Grid view',
        };

        // // Add additional options if provided
        // Object.keys(options).forEach(key => {
        //     if (key !== 'maxRecords' && key !== 'view') {
        //         selectOptions[key] = options[key];
        //     }
        // });

        base(tableName)
            .select(selectOptions)
            .eachPage((pageRecords: Records<FieldSet>, processNextPage: () => void) => {
                // Add current page records to collection
                if (Array.isArray(pageRecords)) {
                    records.push(...pageRecords);
                }

                console.log(`📄 Fetched ${records.length} total records...`);

                // Continue fetching until no more pages
                return processNextPage();
            })
            .then(() => {
                console.log(`✅ Fetched ${records.length} records from "${tableName}"`);            
            });

        return records
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error fetching records from "${tableName}":`, errorMessage);
        throw new Error(errorMessage);
    }
}
