import type { ActionName } from '@/components/ActionIcon/ActionIcon';
import { csvActionToActionName } from './actionMapping';
import prisma from './db';
export { slugify } from './slugify';

// ─── Hours types ──────────────────────────────────────────────────────────────

export interface DayHours { open: string; close: string; }
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DayEntry = DayHours[] | { special: string } | null;
export interface DisplayRow { days: string; time: string; }
export interface BusinessHoursJson {
  tz?: string;
  hours: Partial<Record<DayKey, DayEntry>>;
  display: DisplayRow[];
  note?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  fields: {
    businessName: string;
    businessDescription: string;
    listingPhoto: string[];
    address: string;
    latitude: number | null;
    longitude: number | null;
    businessEmail: string;
    businessPhone: string;
    website: string;
    contactName: string;
    contactEmail: string;
    instagramUrl1: string;
    facebookUrl: string;
    linkedInUrl: string;
    tiktokHandle: string;
    hasDelivery: boolean;
    hasPickUp: boolean;
    hasOnlineShop: boolean;
    onlineShopLink: string;
    category: string;
    typeOfBusiness: string[];
    coreMaterialSystem: string[];
    enablingSystem: string[];
    tags: string[];
    notableBusinessEvents: string[];
    googleHoursAccurate: string;
    businessHours: string;
    hoursJson: BusinessHoursJson | null;
    inputActions: string[];
    inputCategories: string[];
    inputCategoryIcons: string[];
    inputCategoryOverride: string;
    inputNotes: string;
    outputActions: string[];
    outputCategories: string[];
    outputCategoryIcons: string[];
    outputCategoryOverride: string;
    outputNotes: string;
    serviceActions: string[];
    serviceCategories: string[];
    serviceCategoryIcons: string[];
    serviceCategoryOverride: string;
    serviceNotes: string;
    volunteerOpportunities: boolean;
    volunteerNotes: string;
    // Derived per-group: used for cross-group filtering (action must belong to
    // the same group as the matched category — prevents false positives).
    inputActionNames: ActionName[];
    outputActionNames: ActionName[];
    serviceActionNames: ActionName[];
    // Derived: all input + output + service actions mapped to ActionName
    allActionNames: ActionName[];
  };
}

// ─── DB row type (from businesses_complete view) ──────────────────────────────

interface BusinessRow {
  airtable_id: string;
  business_name: string | null;
  business_description: string | null;
  listing_photo_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  business_email: string | null;
  business_phone: string | null;
  website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  instagram_url_1: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  tiktok_handle: string | null;
  has_delivery: boolean | null;
  has_pickup: boolean | null;
  has_online_shop: boolean | null;
  online_shop_link: string | null;
  google_hours_accurate: string | null;
  business_hours: string | null;
  hours_json: BusinessHoursJson | null;
  input_notes: string | null;
  input_category_override: string | null;
  output_notes: string | null;
  output_category_override: string | null;
  service_notes: string | null;
  service_category_override: string | null;
  volunteer_opportunities: boolean | null;
  volunteer_notes: string | null;
  // Expanded name arrays from businesses_complete view
  business_type_names: string[] | null;
  tag_names: string[] | null;
  input_action_names: string[] | null;
  output_action_names: string[] | null;
  service_action_names: string[] | null;
  input_category_names: string[] | null;
  output_category_names: string[] | null;
  service_category_names: string[] | null;
  input_category_icons: string[] | null;
  output_category_icons: string[] | null;
  service_category_icons: string[] | null;
  core_material_names: string[] | null;
  enabling_system_names: string[] | null;
  activity_names: string[] | null;
}

// ─── Row → Listing ────────────────────────────────────────────────────────────

// Order matches "Order for Display" in the Business Actions Airtable table.
// Unlisted actions (volunteer, dineOrDrink) are appended at the end.
const ACTION_ORDER: ActionName[] = [
  'donate', 'buy', 'buyB2B', 'recycle', 'sell', 'repair', 'consign',
  'compost', 'refill', 'rent', 'trade', 'process', 'access', 'volunteer', 'dineOrDrink',
];

function toActionNames(raw: string[] | null): ActionName[] {
  return (raw ?? [])
    .map(csvActionToActionName)
    .filter((a): a is ActionName => a !== null);
}

function toStr(val: string | null): string {
  return val ?? '';
}

function toArr(val: string[] | null): string[] {
  return val ?? [];
}

/**
 * Parses a PostgreSQL array literal (e.g. `{"Photographs","Notebooks"}`) into
 * a comma-separated string. Falls back to returning the raw value unchanged if
 * it doesn't look like an array literal, so plain-text overrides still work.
 */
function pgArrayToStr(val: string | null): string {
  if (!val) return '';
  const match = val.match(/^\{([\s\S]*)\}$/);
  if (!match) return val;
  const inner = match[1];
  const items: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      if (current.trim()) items.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) items.push(current.trim());
  return items.join(', ');
}

function rowToListing(row: BusinessRow): Listing {
  const inputActions  = toActionNames(row.input_action_names);
  const outputActions = toActionNames(row.output_action_names);
  const serviceActions = toActionNames(row.service_action_names);

  const allActionsSet = new Set<ActionName>([...inputActions, ...outputActions, ...serviceActions]);
  if (row.volunteer_opportunities) allActionsSet.add('volunteer');
  const allActionNames = ACTION_ORDER.filter(a => allActionsSet.has(a));

  const inputCategoryOverride = pgArrayToStr(row.input_category_override);

  return {
    id: row.airtable_id,
    fields: {
      businessName:            toStr(row.business_name),
      businessDescription:     toStr(row.business_description),
      listingPhoto:            row.listing_photo_url ? [row.listing_photo_url] : [],
      address:                 toStr(row.address),
      latitude:                row.latitude ?? null,
      longitude:               row.longitude ?? null,
      businessEmail:           toStr(row.business_email),
      businessPhone:           toStr(row.business_phone),
      website:                 toStr(row.website),
      contactName:             toStr(row.contact_name),
      contactEmail:            toStr(row.contact_email),
      instagramUrl1:           toStr(row.instagram_url_1),
      facebookUrl:             toStr(row.facebook_url),
      linkedInUrl:             toStr(row.linkedin_url),
      tiktokHandle:            toStr(row.tiktok_handle),
      hasDelivery:             row.has_delivery ?? false,
      hasPickUp:               row.has_pickup ?? false,
      hasOnlineShop:           row.has_online_shop ?? false,
      onlineShopLink:          toStr(row.online_shop_link),
      category:                '',
      typeOfBusiness:          toArr(row.business_type_names),
      coreMaterialSystem:      toArr(row.core_material_names),
      enablingSystem:          toArr(row.enabling_system_names),
      tags:                    toArr(row.tag_names),
      notableBusinessEvents:   toArr(row.activity_names),
      googleHoursAccurate:     toStr(row.google_hours_accurate),
      businessHours:           toStr(row.business_hours),
      hoursJson:               row.hours_json ?? null,
      inputActions:            toArr(row.input_action_names),
      inputCategories:         toArr(row.input_category_names),
      inputCategoryIcons:      toArr(row.input_category_icons),
      inputCategoryOverride,
      inputNotes:              toStr(row.input_notes),
      outputActions:           toArr(row.output_action_names),
      outputCategories:        toArr(row.output_category_names),
      outputCategoryIcons:     toArr(row.output_category_icons),
      outputCategoryOverride:  pgArrayToStr(row.output_category_override),
      outputNotes:             toStr(row.output_notes),
      serviceActions:          toArr(row.service_action_names),
      serviceCategories:       toArr(row.service_category_names),
      serviceCategoryIcons:    toArr(row.service_category_icons),
      serviceCategoryOverride: pgArrayToStr(row.service_category_override),
      serviceNotes:            toStr(row.service_notes),
      volunteerOpportunities:  row.volunteer_opportunities ?? false,
      volunteerNotes:          toStr(row.volunteer_notes),
      inputActionNames:        inputActions,
      outputActionNames:       outputActions,
      serviceActionNames:      serviceActions,
      allActionNames,
    },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  // businesses_complete is a view — queried via $queryRaw since Prisma doesn't model views
  const rows = await prisma.$queryRaw<BusinessRow[]>`
    SELECT * FROM businesses_complete
    WHERE business_name IS NOT NULL
    ORDER BY business_name
  `;
  return rows.map(rowToListing);
}
