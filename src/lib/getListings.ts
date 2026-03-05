import type { ActionName } from '@/components/ActionIcon/ActionIcon';
import { csvActionToActionName } from './actionMapping';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9eN6f9S1JgdPuAqIIqLFmcWqdv8Bhxym_yDVvjdHhfYMlJnp_EiOl-HRVtbMSwI9opJtEygSjwMIH/pub?output=csv';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  fields: {
    businessName: string;
    businessDescription: string;
    listingPhoto: string[];
    address: string;
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
    inputActions: string[];
    inputCategories: string[];
    inputCategoryOverride: string;
    outputActions: string[];
    outputCategories: string[];
    outputCategoryOverride: string;
    outputNotes: string;
    serviceActions: string[];
    serviceCategories: string[];
    serviceCategoryOverride: string;
    serviceNotes: string;
    volunteerOpportunities: boolean;
    volunteerNotes: string;
    // Derived: all input + output + service actions mapped to ActionName
    allActionNames: ActionName[];
  };
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

/**
 * Minimal RFC 4180-compliant CSV parser.
 * Handles quoted fields (including commas and newlines inside quotes).
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\r' && text[i + 1] === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i += 2;
      } else if (ch === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Last field/row
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a Google Drive sharing URL to a directly embeddable thumbnail URL.
 * Input:  https://drive.google.com/file/d/{ID}/view?usp=sharing
 * Output: https://drive.google.com/thumbnail?id={ID}&sz=w800
 */
function driveViewToImageUrl(url: string): string {
  const match = url.match(/\/file\/d\/([^/]+)/);
  if (!match) return url;
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
}

function toBool(val: string): boolean {
  return val.trim().toLowerCase() === 'yes';
}

function toArray(val: string): string[] {
  return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

function toActionsArray(val: string): ActionName[] {
  return toArray(val)
    .map(csvActionToActionName)
    .filter((a): a is ActionName => a !== null);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const res = await fetch(CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch listings CSV: ${res.status}`);

  const text = await res.text();
  const [headerRow, ...dataRows] = parseCSV(text);

  // Build a column-name → index map (case-insensitive, trimmed)
  const col: Record<string, number> = {};
  headerRow.forEach((name, i) => {
    col[name.trim()] = i;
  });

  const get = (row: string[], name: string): string =>
    (row[col[name]] ?? '').trim();

  return dataRows
    .filter((row) => row.some((cell) => cell.trim())) // skip empty rows
    .map((row, index) => {
      const inputActions  = toActionsArray(get(row, 'INPUT Action(s)'));
      const outputActions = toActionsArray(get(row, 'OUTPUT Action(s)'));
      const serviceActions = toActionsArray(get(row, 'SERVICE Action(s)'));

      // Deduplicate combined action names
      const allActionNames = [...new Set([...inputActions, ...outputActions, ...serviceActions])];

      return {
        id: `sheet-${index}`,
        fields: {
          businessName:          get(row, 'Business Name'),
          businessDescription:   get(row, 'Business Description'),
          listingPhoto:          get(row, 'Listing Photo') ? [driveViewToImageUrl(get(row, 'Listing Photo'))] : [],
          address:               get(row, 'Address'),
          businessEmail:         get(row, 'Business Email'),
          businessPhone:         get(row, 'Business Phone'),
          website:               get(row, 'Website'),
          contactName:           get(row, 'Contact Name'),
          contactEmail:          get(row, 'Contact Email'),
          instagramUrl1:         get(row, 'Instagram Handle'),
          facebookUrl:           get(row, 'Facebook URL'),
          linkedInUrl:           get(row, 'LinkedIn URL'),
          tiktokHandle:          get(row, 'Tiktok Handle'),
          hasDelivery:           toBool(get(row, 'Has Delivery Services')),
          hasPickUp:             toBool(get(row, 'Has Pickup Services')),
          hasOnlineShop:         toBool(get(row, 'Has Online Shop')),
          onlineShopLink:        get(row, 'If online shop, Link'),
          category:              get(row, 'Category'),
          typeOfBusiness:        toArray(get(row, 'Type of Listing')),
          coreMaterialSystem:    toArray(get(row, 'Core Material System')),
          enablingSystem:        toArray(get(row, 'Enabling System')),
          tags:                  toArray(get(row, 'TAGS')),
          notableBusinessEvents: toArray(get(row, 'Notable Business Events/Activities')),
          googleHoursAccurate:   get(row, 'Google listed hours accurate?'),
          businessHours:         get(row, 'Business Hours'),
          inputActions:          toArray(get(row, 'INPUT Action(s)')),
          inputCategories:       toArray(get(row, 'INPUT Category(s)')),
          inputCategoryOverride: get(row, 'INPUT Category - Override (Unique items or category)'),
          outputActions:         toArray(get(row, 'OUTPUT Action(s)')),
          outputCategories:      toArray(get(row, 'OUTPUT Category(s) (Product Sold)')),
          outputCategoryOverride: get(row, 'OUTPUT Category - Override (Unique items or category)'),
          outputNotes:           get(row, 'OUTPUT - Notes Field'),
          serviceActions:        toArray(get(row, 'SERVICE Action(s)')),
          serviceCategories:     toArray(get(row, 'SERVICE Category(s)')),
          serviceCategoryOverride: get(row, 'SERVICE Category - Override (Unique items or category)'),
          serviceNotes:          get(row, 'SERVICE - Notes Field'),
          volunteerOpportunities: toBool(get(row, 'VOLUNTEER Opportunities')),
          volunteerNotes:        get(row, 'VOLUNTEER - Notes Field'),
          allActionNames,
        },
      };
    });
}
