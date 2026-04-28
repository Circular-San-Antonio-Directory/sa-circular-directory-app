export interface BaseListingData {
    businessName: string;
    businessDescription: string;
    listingPhoto: string[];
    address: string;
    latitude: number | null; //populated from script
    longitude: number | null; //populated from script
    businessEmail: string | null;
    businessPhone: string | null;
    website: string | null;
    contactName: string | null;
    contactEmail: string | null;
    instagramUrl1: string | null;
    facebookUrl: string | null;
    linkedInUrl: string | null;
    tiktokHandle: string | null;
    hasDelivery: boolean | null;
    hasPickUp: boolean | null;
    hasOnlineShop: boolean | null;
    onlineShopLink: string | null;
    typeOfBusiness: string[];
    coreMaterialSystem: string[];
    enablingSystem: string[];
    tags: string[];
    notableBusinessEvents: string[];
    googleHoursAccurate: string;
    businessHours: string;
    hoursJson: BusinessHoursJson | null;  //populated from script 
    volunteerOpportunities: boolean;
    volunteerNotes: string;
}

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