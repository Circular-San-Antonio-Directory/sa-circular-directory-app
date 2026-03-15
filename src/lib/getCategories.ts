import pool from './db';

export interface Category {
  category: string;
  // Items parsed from the comma-separated Airtable string, lowercased for search matching
  items: string[];
  faIcon: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const result = await pool.query<{ category: string; items: string | null; fa_icon: string | null }>(
    `SELECT category, items, fa_icon FROM categories WHERE category IS NOT NULL ORDER BY category`,
  );
  return result.rows.map((row) => ({
    category: row.category,
    items: row.items ? row.items.split(',').map((s) => s.trim().toLowerCase()) : [],
    faIcon: row.fa_icon ?? null,
  }));
}
