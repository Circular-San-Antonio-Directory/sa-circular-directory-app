import prisma from './db';

export interface Category {
  category: string;
  // Items parsed from the comma-separated Airtable string, lowercased for search matching
  items: string[];
  faIcon: string | null;
}

export async function getCategories(): Promise<Category[]> {
  // category is a required field in schema (non-nullable), so no null filter needed
  const rows = await prisma.categories.findMany({
    orderBy: { category: 'asc' },
    select: { category: true, items: true, fa_icon: true },
  });

  return rows.map((row) => ({
    category: row.category,
    items: row.items ? row.items.split(',').map((s) => s.trim().toLowerCase()) : [],
    faIcon: row.fa_icon ?? null,
  }));
}
