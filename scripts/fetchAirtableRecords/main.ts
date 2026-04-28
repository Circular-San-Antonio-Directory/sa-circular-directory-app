import { fetchAllTables } from "./fetchAllTables";

/**
 * Main entry point for the script
 */
async function main(): Promise<void> {
  try {
    // Validate environment variables (already validated at module load)
    
    fetchAllTables();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Script failed:', errorMessage);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}