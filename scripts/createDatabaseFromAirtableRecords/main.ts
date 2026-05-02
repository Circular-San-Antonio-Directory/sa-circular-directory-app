import { migrate } from "./migrate";

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}
