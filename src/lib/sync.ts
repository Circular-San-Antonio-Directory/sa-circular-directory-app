import Airtable from 'airtable';
import pool from './db';

// ─── Types ────────────────────────────────────────────────────────────────────

const TABLES = [
  { name: 'Production DB',        key: 'productionDb'    },
  { name: 'Business Actions',     key: 'businessActions' },
  { name: 'Categories',           key: 'categories'      },
  { name: 'Business Type',        key: 'businessTypes'   },
  { name: 'Core Material System', key: 'coreMaterials'   },
  { name: 'Tag',                  key: 'tags'            },
  { name: 'Business Activity',    key: 'activities'      },
  { name: 'Enabling Systems',     key: 'enablingSystems' },
] as const;

type TableKey = typeof TABLES[number]['key'];
type AirtableRecord = { id: string; fields: Record<string, unknown>; createdTime: string };
type TableData = Record<TableKey, AirtableRecord[]>;
type IdMapping = Record<string, number>;

export interface SyncResult {
  syncedAt: string;
  counts: {
    businesses: number;
    geocoded: number;
    businessTypes: number;
    categories: number;
    tags: number;
    actions: number;
    coreMaterials: number;
    enablingSystems: number;
    activities: number;
  };
}

// ─── Airtable fetch ───────────────────────────────────────────────────────────

async function fetchAllFromAirtable(): Promise<TableData> {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID!);

  const results = {} as TableData;

  for (const table of TABLES) {
    const records: AirtableRecord[] = [];
    await base(table.name)
      .select({ view: 'Grid view' })
      .eachPage((pageRecords, fetchNextPage) => {
        records.push(...pageRecords.map(r => ({
          id: r.id,
          fields: r.fields,
          createdTime: r._rawJson.createdTime,
        })));
        fetchNextPage();
      });
    results[table.key] = records;
  }

  return results;
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertLookup(
  tableName: string,
  records: AirtableRecord[],
  fieldMap: Record<string, string>,
): Promise<IdMapping> {
  const mapping: IdMapping = {};

  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;

    const cols = ['airtable_id'];
    const vals: unknown[] = [record.id];
    const placeholders = ['$1'];
    const updates: string[] = [];
    let i = 2;

    for (const [airtableField, sqlCol] of Object.entries(fieldMap)) {
      if (record.fields[airtableField] != null) {
        cols.push(sqlCol);
        vals.push(record.fields[airtableField]);
        placeholders.push(`$${i}`);
        updates.push(`${sqlCol} = EXCLUDED.${sqlCol}`);
        i++;
      }
    }

    const result = await pool.query(
      `INSERT INTO ${tableName} (${cols.join(', ')})
       VALUES (${placeholders.join(', ')})
       ON CONFLICT (airtable_id) DO UPDATE SET ${updates.join(', ')}, updated_at = NOW()
       RETURNING id, airtable_id`,
      vals,
    );
    mapping[record.id] = result.rows[0].id;
  }

  return mapping;
}

function mapIds(airtableIds: unknown, mapping: IdMapping): number[] | null {
  if (!Array.isArray(airtableIds) || airtableIds.length === 0) return null;
  const ids = (airtableIds as string[]).map(id => mapping[id]).filter(Boolean);
  return ids.length > 0 ? ids : null;
}

async function upsertBusinesses(
  records: AirtableRecord[],
  mappings: Record<string, IdMapping>,
): Promise<number> {
  let count = 0;

  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const f = record.fields as Record<string, unknown>;

    await pool.query(
      `INSERT INTO businesses (
        airtable_id, business_name, business_description, address,
        business_email, business_phone, website,
        contact_name, contact_email, contacted_by,
        instagram_url_1, instagram_url_2, facebook_url, linkedin_url,
        google_hours_accurate, business_hours,
        input_notes, input_category_override,
        output_notes, output_category_override,
        service_notes, service_category_override,
        has_delivery, has_pickup, has_online_shop, online_shop_link,
        volunteer_opportunities, volunteer_notes,
        listing_photo_url, airtable_created_at,
        business_type_ids, tag_ids,
        input_action_ids, output_action_ids, service_action_ids,
        input_category_ids, output_category_ids, service_category_ids,
        core_material_ids, enabling_system_ids, activity_ids
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,
        $27,$28,$29,$30,
        $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41
      )
      ON CONFLICT (airtable_id) DO UPDATE SET
        business_name             = EXCLUDED.business_name,
        business_description      = EXCLUDED.business_description,
        address                   = EXCLUDED.address,
        -- Reset geocoding if the address has changed so it gets re-geocoded
        geocoded_at               = CASE
                                      WHEN businesses.address IS DISTINCT FROM EXCLUDED.address
                                      THEN NULL
                                      ELSE businesses.geocoded_at
                                    END,
        latitude                  = CASE
                                      WHEN businesses.address IS DISTINCT FROM EXCLUDED.address
                                      THEN NULL
                                      ELSE businesses.latitude
                                    END,
        longitude                 = CASE
                                      WHEN businesses.address IS DISTINCT FROM EXCLUDED.address
                                      THEN NULL
                                      ELSE businesses.longitude
                                    END,
        business_email            = EXCLUDED.business_email,
        business_phone            = EXCLUDED.business_phone,
        website                   = EXCLUDED.website,
        contact_name              = EXCLUDED.contact_name,
        contact_email             = EXCLUDED.contact_email,
        instagram_url_1           = EXCLUDED.instagram_url_1,
        facebook_url              = EXCLUDED.facebook_url,
        linkedin_url              = EXCLUDED.linkedin_url,
        google_hours_accurate     = EXCLUDED.google_hours_accurate,
        business_hours            = EXCLUDED.business_hours,
        input_notes               = EXCLUDED.input_notes,
        input_category_override   = EXCLUDED.input_category_override,
        output_notes              = EXCLUDED.output_notes,
        output_category_override  = EXCLUDED.output_category_override,
        service_notes             = EXCLUDED.service_notes,
        service_category_override = EXCLUDED.service_category_override,
        has_delivery              = EXCLUDED.has_delivery,
        has_pickup                = EXCLUDED.has_pickup,
        has_online_shop           = EXCLUDED.has_online_shop,
        online_shop_link          = EXCLUDED.online_shop_link,
        volunteer_opportunities   = EXCLUDED.volunteer_opportunities,
        volunteer_notes           = EXCLUDED.volunteer_notes,
        listing_photo_url         = EXCLUDED.listing_photo_url,
        business_type_ids         = EXCLUDED.business_type_ids,
        tag_ids                   = EXCLUDED.tag_ids,
        input_action_ids          = EXCLUDED.input_action_ids,
        output_action_ids         = EXCLUDED.output_action_ids,
        service_action_ids        = EXCLUDED.service_action_ids,
        input_category_ids        = EXCLUDED.input_category_ids,
        output_category_ids       = EXCLUDED.output_category_ids,
        service_category_ids      = EXCLUDED.service_category_ids,
        core_material_ids         = EXCLUDED.core_material_ids,
        enabling_system_ids       = EXCLUDED.enabling_system_ids,
        activity_ids              = EXCLUDED.activity_ids,
        updated_at                = NOW()`,
      [
        record.id,
        f['Business Name'] ?? null,
        f['Business Description'] ?? null,
        f['Address'] ?? null,
        f['Business Email'] ?? null,
        f['Business Phone'] ?? null,
        f['Website'] ?? null,
        f['Contact Name'] ?? null,
        f['Contact Email'] ?? null,
        f['Contacted by'] ?? null,
        f['SOCIAL - Instagram URL 1'] ?? null,
        f['SOCIAL- Instagram URL 2'] ?? null,
        f['SOCIAL - Facebook URL'] ?? null,
        f['SOCIAL - LinkedIn URL'] ?? null,
        f['Google listed hours accurate?'] ?? null,
        f['Business Hours'] ?? null,
        f['INPUT - Notes Field'] ?? null,
        f['INPUT Category - Override (Unique items or category)'] ?? null,
        f['OUTPUT - Notes Field'] ?? null,
        f['OUTPUT Category - Override (Unique items or category)'] ?? null,
        f['SERVICE - Notes Field'] ?? null,
        f['SERVICE Category - Override (Unique items or category)'] ?? null,
        f['Has Delivery services'] ?? false,
        f['Has Pick Up service'] ?? false,
        f['Has Online Shop'] ?? false,
        f['If online shop, Link'] ?? null,
        f['VOLUNTEER Opportunities'] ?? false,
        f['VOLUNTEER - Notes Field'] ?? null,
        (f['Listing Photo'] as string) ?? null,
        record.createdTime ?? null,
        mapIds(f['Type of Listing'],                         mappings.businessTypes),
        mapIds(f['TAGS'],                                    mappings.tags),
        mapIds(f['INPUT Action(s)'],                         mappings.actions),
        mapIds(f['OUTPUT Action(s)'],                        mappings.actions),
        mapIds(f['SERVICE Action(s)'],                       mappings.actions),
        mapIds(f['INPUT Category(s)'],                       mappings.categories),
        mapIds(f['OUTPUT Category(s) (Product Sold)'],       mappings.categories),
        mapIds(f['SERVICE Category(s)'],                     mappings.categories),
        mapIds(f['Core Material System'],                    mappings.coreMaterials),
        mapIds(f['Enabling System'],                         mappings.enablingSystems),
        mapIds(f['Notable Business Events/Activities'],      mappings.activities),
      ],
    );
    count++;
  }

  return count;
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

async function geocodeBusinesses(): Promise<number> {
  const token = process.env.MAPBOX_SECRET_TOKEN;
  if (!token) {
    console.warn('[sync] MAPBOX_SECRET_TOKEN not set — skipping geocoding');
    return 0;
  }

  const { rows } = await pool.query<{ id: number; address: string }>(
    `SELECT id, address FROM businesses WHERE geocoded_at IS NULL AND address IS NOT NULL AND address != ''`
  );

  let geocodedCount = 0;

  for (const row of rows) {
    const query = encodeURIComponent(`${row.address}, San Antonio, TX`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&country=us&proximity=-98.4936,29.4241&limit=1`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[sync] Geocoding HTTP ${res.status} for business id=${row.id}`);
        continue;
      }
      const data = await res.json() as { features?: Array<{ center?: [number, number] }> };
      const center = data.features?.[0]?.center;
      if (!center) {
        console.warn(`[sync] No geocoding result for business id=${row.id}, address="${row.address}"`);
        continue;
      }
      const [lng, lat] = center;
      await pool.query(
        `UPDATE businesses SET longitude=$1, latitude=$2, geocoded_at=NOW() WHERE id=$3`,
        [lng, lat, row.id],
      );
      geocodedCount++;
    } catch (err) {
      console.warn(`[sync] Geocoding error for business id=${row.id}:`, err);
    }

    // Rate-limit safety: ~100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return geocodedCount;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runSync(): Promise<SyncResult> {
  const data = await fetchAllFromAirtable();

  const [businessTypes, categories, tags, actions, coreMaterials, enablingSystems, activities] =
    await Promise.all([
      upsertLookup('business_types',        data.businessTypes,   { Name: 'name' }),
      upsertLookup('categories',            data.categories,      { Category: 'category', Notes: 'notes', Items: 'items', 'FA Icon': 'fa_icon' }),
      upsertLookup('tags',                  data.tags,            { Name: 'name', Description: 'description' }),
      upsertLookup('business_actions',      data.businessActions, { Action: 'action', 'Corresponding Action': 'corresponding_action', 'Order for Display': 'display_order', 'Icon to Use': 'icon_file', 'Colorway': 'colorway' }),
      upsertLookup('core_material_systems', data.coreMaterials,   { Name: 'name', Description: 'description' }),
      upsertLookup('enabling_systems',      data.enablingSystems, { Name: 'name', Description: 'description' }),
      upsertLookup('business_activities',   data.activities,      { Name: 'name', Description: 'description' }),
    ]);

  const businessCount = await upsertBusinesses(data.productionDb, {
    businessTypes, categories, tags, actions,
    coreMaterials, enablingSystems, activities,
  });

  // Delete businesses that no longer exist in Airtable
  const activeIds = data.productionDb.map(r => r.id);
  if (activeIds.length > 0) {
    await pool.query(
      `DELETE FROM businesses WHERE airtable_id != ALL($1::text[])`,
      [activeIds],
    );
  }

  const geocodedCount = await geocodeBusinesses();

  return {
    syncedAt: new Date().toISOString(),
    counts: {
      businesses:    businessCount,
      geocoded:      geocodedCount,
      businessTypes: Object.keys(businessTypes).length,
      categories:    Object.keys(categories).length,
      tags:          Object.keys(tags).length,
      actions:       Object.keys(actions).length,
      coreMaterials: Object.keys(coreMaterials).length,
      enablingSystems: Object.keys(enablingSystems).length,
      activities:    Object.keys(activities).length,
    },
  };
}
