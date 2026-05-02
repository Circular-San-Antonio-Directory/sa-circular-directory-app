import Airtable from 'airtable';
import prisma from './db';
import {
  AIRTABLE_TABLES,
  BusinessAirtableSchema,
  BusinessTypeAirtableSchema,
  CategoryAirtableSchema,
  TagAirtableSchema,
  BusinessActionAirtableSchema,
  CoreMaterialSystemAirtableSchema,
  EnablingSystemAirtableSchema,
  BusinessActivityAirtableSchema,
  BUSINESS_FIELD_MAP,
} from './schema';
import type { BusinessHoursJson, DayKey, DayEntry, DisplayRow } from './getListings';

// ─── Hours text parser ────────────────────────────────────────────────────────

const DAY_ORDER: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_ABBREV: Record<string, DayKey> = {
  sun: 'sun', sunday: 'sun',
  mon: 'mon', monday: 'mon',
  tue: 'tue', tuesday: 'tue', tues: 'tue',
  wed: 'wed', wednesday: 'wed',
  thu: 'thu', thursday: 'thu', thur: 'thu', thurs: 'thu',
  fri: 'fri', friday: 'fri',
  sat: 'sat', saturday: 'sat',
};
const DAY_FULL: Record<DayKey, string> = {
  sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday',
};

function parseSingleTime(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  if (m[3].toLowerCase() === 'am') { if (h === 12) h = 0; }
  else { if (h !== 12) h += 12; }
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function parseTimeRange(valueStr: string): DayEntry {
  const sessions = valueStr.split(',').map(s => s.trim());
  const result: { open: string; close: string }[] = [];
  for (const session of sessions) {
    const idx = session.search(/\d(am|pm)-/i);
    if (idx === -1) return { special: valueStr.trim() };
    const splitAt = session.indexOf('-', idx + 1);
    if (splitAt === -1) return { special: valueStr.trim() };
    const open = parseSingleTime(session.slice(0, splitAt).trim());
    const close = parseSingleTime(session.slice(splitAt + 1).trim());
    if (!open || !close) return { special: valueStr.trim() };
    result.push({ open, close });
  }
  return result.length > 0 ? result : { special: valueStr.trim() };
}

function expandDays(daysStr: string): DayKey[] {
  const result: DayKey[] = [];
  for (const part of daysStr.split(',').map(s => s.trim())) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-').map(s => s.trim().toLowerCase());
      const startKey = DAY_ABBREV[startRaw];
      const endKey = DAY_ABBREV[endRaw];
      if (startKey && endKey) {
        let startIdx = DAY_ORDER.indexOf(startKey);
        let endIdx = DAY_ORDER.indexOf(endKey);
        if (endIdx < startIdx) endIdx += 7;
        for (let i = startIdx; i <= endIdx; i++) result.push(DAY_ORDER[i % 7]);
      }
    } else {
      const key = DAY_ABBREV[part.toLowerCase()];
      if (key) result.push(key);
    }
  }
  return result;
}

function formatDisplayDays(daysStr: string): string {
  return daysStr.split(',').map(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-').map(s => s.trim().toLowerCase());
      const startKey = DAY_ABBREV[startRaw];
      const endKey = DAY_ABBREV[endRaw];
      if (startKey && endKey) return `${DAY_FULL[startKey]}-${DAY_FULL[endKey]}`;
    }
    const key = DAY_ABBREV[part.toLowerCase()];
    return key ? DAY_FULL[key] : part;
  }).join(', ');
}

function parseBusinessHoursText(raw: unknown): BusinessHoursJson | null {
  if (!raw || typeof raw !== 'string') return null;
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (lines.length === 0) return null;

  const hours: Partial<Record<DayKey, DayEntry>> = {};
  const display: DisplayRow[] = [];
  let note: string | undefined;

  for (const line of lines) {
    if (/^note:/i.test(line)) {
      note = line.replace(/^note:\s*/i, '').trim();
      continue;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const daysStr = line.slice(0, colonIdx).trim();
    const valueStr = line.slice(colonIdx + 1).trim();
    if (!daysStr || !valueStr) continue;

    const dayKeys = expandDays(daysStr);
    if (dayKeys.length === 0) continue;

    let entry: DayEntry;
    let displayTime: string;
    if (/^closed$/i.test(valueStr)) {
      entry = null;
      displayTime = 'Closed';
    } else {
      entry = parseTimeRange(valueStr);
      displayTime = valueStr;
    }

    for (const key of dayKeys) hours[key] = entry;
    display.push({ days: formatDisplayDays(daysStr), time: displayTime });
  }

  if (display.length === 0) return null;
  return { tz: 'America/Chicago', hours, display, ...(note ? { note } : {}) };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type RawAirtableRecord = { id: string; fields: Record<string, unknown>; createdTime: string };
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

type TableFetchKey = keyof typeof AIRTABLE_TABLES;
type TableData = Record<TableFetchKey, RawAirtableRecord[]>;

async function fetchAllFromAirtable(): Promise<TableData> {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID!);

  const results = {} as TableData;

  for (const [key, table] of Object.entries(AIRTABLE_TABLES) as [TableFetchKey, { name: string; id: string }][]) {
    const records: RawAirtableRecord[] = [];
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
    results[key] = records;
  }

  return results;
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertBusinessTypes(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = BusinessTypeAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping business_type ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const row = await prisma.business_types.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, name: parsed.data.Name },
      update: { name: parsed.data.Name, updated_at: new Date() },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertCategories(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = CategoryAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping category ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const d = parsed.data;
    const row = await prisma.categories.upsert({
      where: { airtable_id: record.id },
      create: {
        airtable_id: record.id,
        category: d.Category,
        notes: d.Notes ?? null,
        items: d.Items ?? null,
        fa_icon: d['FA Icon'] ?? null,
      },
      update: {
        category: d.Category,
        notes: d.Notes ?? null,
        items: d.Items ?? null,
        fa_icon: d['FA Icon'] ?? null,
        updated_at: new Date(),
      },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertTags(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = TagAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping tag ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const row = await prisma.tags.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, name: parsed.data.Name, description: parsed.data.Description ?? null },
      update: { name: parsed.data.Name, description: parsed.data.Description ?? null, updated_at: new Date() },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertBusinessActions(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = BusinessActionAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping business_action ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const d = parsed.data;
    // Airtable stores "Icon 3" (space); DB uses "Icon-3" (hyphen)
    const iconFile = d['Icon to Use'] ? d['Icon to Use'].replace(' ', '-') : null;
    const row = await prisma.business_actions.upsert({
      where: { airtable_id: record.id },
      create: {
        airtable_id: record.id,
        action: d.Action,
        corresponding_action: d['Corresponding Action'] ?? null,
        display_order: d['Order for Display'] ?? null,
        icon_file: iconFile,
        colorway: d.Colorway ?? null,
      },
      update: {
        action: d.Action,
        corresponding_action: d['Corresponding Action'] ?? null,
        display_order: d['Order for Display'] ?? null,
        icon_file: iconFile,
        colorway: d.Colorway ?? null,
        updated_at: new Date(),
      },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertCoreMaterialSystems(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = CoreMaterialSystemAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping core_material_system ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const row = await prisma.core_material_systems.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, name: parsed.data.Name, description: parsed.data.Description ?? null },
      update: { name: parsed.data.Name, description: parsed.data.Description ?? null, updated_at: new Date() },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertEnablingSystems(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = EnablingSystemAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping enabling_system ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const row = await prisma.enabling_systems.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, name: parsed.data.Name, description: parsed.data.Description ?? null },
      update: { name: parsed.data.Name, description: parsed.data.Description ?? null, updated_at: new Date() },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

async function upsertBusinessActivities(records: RawAirtableRecord[]): Promise<IdMapping> {
  const mapping: IdMapping = {};
  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;
    const parsed = BusinessActivityAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping business_activity ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }
    const row = await prisma.business_activities.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, name: parsed.data.Name, description: parsed.data.Description ?? null },
      update: { name: parsed.data.Name, description: parsed.data.Description ?? null, updated_at: new Date() },
      select: { id: true },
    });
    mapping[record.id] = row.id;
  }
  return mapping;
}

function mapIds(airtableIds: unknown, mapping: IdMapping): number[] {
  if (!Array.isArray(airtableIds) || airtableIds.length === 0) return [];
  return (airtableIds as string[]).map(id => mapping[id]).filter(Boolean);
}

async function upsertBusinesses(
  records: RawAirtableRecord[],
  mappings: Record<string, IdMapping>,
): Promise<number> {
  let count = 0;

  for (const record of records) {
    if (!record.fields || Object.keys(record.fields).length === 0) continue;

    const parsed = BusinessAirtableSchema.safeParse(record.fields);
    if (!parsed.success) {
      console.warn(`[sync] Skipping business ${record.id}: invalid fields`, parsed.error.flatten());
      continue;
    }

    const f = parsed.data;

    // Use field map to get scalar values cleanly
    // Airtable value can be boolean or string; normalize to string for the DB VARCHAR column
    const googleHoursStr = f['Google listed hours accurate?'] != null
      ? String(f['Google listed hours accurate?'])
      : null;

    const newAddress = f['Address'] ?? null;
    const hoursJson = parseBusinessHoursText(f['Business Hours']);

    const sharedData = {
      business_name:              f['Business Name'] ?? null,
      business_description:       f['Business Descriptios'] ?? null,
      listing_photo_url:          f['Listing Photo'] ?? null,
      address:                    newAddress,
      business_email:             f['Business Email'] ?? null,
      business_phone:             f['Business Phone'] ?? null,
      website:                    f['Website'] ?? null,
      contact_name:               f['Contact Name'] ?? null,
      contact_email:              f['Contact Email'] ?? null,
      contacted_by:               f['Contacted by'] ?? null,
      instagram_url_1:            f['SOCIAL - Instagram URL 1'] ?? null,
      instagram_url_2:            f['SOCIAL- Instagram URL 2'] ?? null,
      facebook_url:               f['SOCIAL - Facebook URL'] ?? null,
      linkedin_url:               f['SOCIAL - LinkedIn URL'] ?? null,
      tiktok_handle:              f['Tiktok Handle'] ?? null,
      google_hours_accurate:      googleHoursStr,
      business_hours:             f['Business Hours'] ?? null,
      input_notes:                f['INPUT - Notes Field'] ?? null,
      input_category_override:    f['INPUT Category - Override (Unique items or category)'] ?? null,
      output_notes:               f['OUTPUT - Notes Field'] ?? null,
      output_category_override:   f['OUTPUT Category - Override (Unique items or category)'] ?? null,
      service_notes:              f['SERVICE - Notes Field'] ?? null,
      service_category_override:  f['SERVICE Category - Override (Unique items or category)'] ?? null,
      has_delivery:               f['Has Delivery services'] ?? false,
      has_pickup:                 f['Has Pick Up service'] ?? false,
      has_online_shop:            f['Has Online Shop'] ?? false,
      online_shop_link:           f['If online shop, Link'] ?? null,
      volunteer_opportunities:    f['VOLUNTEER Opportunities'] ?? false,
      volunteer_notes:            f['VOLUNTEER - Notes Field'] ?? null,
      airtable_created_at:        record.createdTime ? new Date(record.createdTime) : null,
      business_type_ids:          mapIds(f['Type of Listing'],                          mappings.businessTypes),
      tag_ids:                    mapIds(f['TAGS'],                                      mappings.tags),
      input_action_ids:           mapIds(f['INPUT Action(s)'],                          mappings.actions),
      output_action_ids:          mapIds(f['OUTPUT Action(s)'],                         mappings.actions),
      service_action_ids:         mapIds(f['SERVICE Action(s)'],                        mappings.actions),
      input_category_ids:         mapIds(f['INPUT Category(s)'],                        mappings.categories),
      output_category_ids:        mapIds(f['OUTPUT Category(s) (Product Sold)'],        mappings.categories),
      service_category_ids:       mapIds(f['SERVICE Category(s)'],                      mappings.categories),
      core_material_ids:          mapIds(f['Core Material System'],                     mappings.coreMaterials),
      enabling_system_ids:        mapIds(f['Enabling System'],                          mappings.enablingSystems),
      activity_ids:               mapIds(f['Notable Business Events/Activities'],       mappings.activities),
      // JSON round-trip strips TypeScript type so Prisma accepts it as InputJsonValue
      hours_json:                 hoursJson != null ? JSON.parse(JSON.stringify(hoursJson)) : undefined,
      updated_at:                 new Date(),
    };

    // Check current address to determine if geocoding should be reset
    const existing = await prisma.businesses.findUnique({
      where: { airtable_id: record.id },
      select: { address: true },
    });
    const addressChanged = existing !== null && existing.address !== newAddress;

    await prisma.businesses.upsert({
      where: { airtable_id: record.id },
      create: { airtable_id: record.id, ...sharedData },
      update: {
        ...sharedData,
        ...(addressChanged ? { geocoded_at: null, latitude: null, longitude: null } : {}),
      },
    });

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

  const rows = await prisma.businesses.findMany({
    where: { geocoded_at: null, address: { not: null } },
    select: { id: true, address: true },
  });

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
      await prisma.businesses.update({
        where: { id: row.id },
        data: { longitude: lng, latitude: lat, geocoded_at: new Date() },
      });
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
      upsertBusinessTypes(data.businessTypes),
      upsertCategories(data.categories),
      upsertTags(data.tags),
      upsertBusinessActions(data.businessActions),
      upsertCoreMaterialSystems(data.coreMaterialSystems),
      upsertEnablingSystems(data.enablingSystems),
      upsertBusinessActivities(data.businessActivities),
    ]);

  const businessCount = await upsertBusinesses(data.businesses, {
    businessTypes, categories, tags, actions,
    coreMaterials, enablingSystems, activities,
  });

  // Delete businesses that no longer exist in Airtable
  const activeIds = data.businesses.map(r => r.id);
  if (activeIds.length > 0) {
    await prisma.businesses.deleteMany({
      where: { airtable_id: { notIn: activeIds } },
    });
  }

  const geocodedCount = await geocodeBusinesses();

  return {
    syncedAt: new Date().toISOString(),
    counts: {
      businesses:     businessCount,
      geocoded:       geocodedCount,
      businessTypes:  Object.keys(businessTypes).length,
      categories:     Object.keys(categories).length,
      tags:           Object.keys(tags).length,
      actions:        Object.keys(actions).length,
      coreMaterials:  Object.keys(coreMaterials).length,
      enablingSystems: Object.keys(enablingSystems).length,
      activities:     Object.keys(activities).length,
    },
  };
}
