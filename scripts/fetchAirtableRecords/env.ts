import 'dotenv/config';
import Airtable from "airtable";

// Type-safe environment variable access
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';

if (!AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY is not set in .env file');
}

if (!AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not set in .env file');
}

// Configure Airtable with typed API key
export const base = new Airtable({
  apiKey: AIRTABLE_API_KEY
}).base(AIRTABLE_BASE_ID);