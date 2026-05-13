# Structured Data — LocalBusiness JSON-LD

Each listing detail page (`/listings/[slug]`) emits a `schema.org/LocalBusiness`
JSON-LD `<script>` block so Google can render the business as a rich result
(address, phone, hours, map) in search cards and in the Local Pack. This
document describes what we emit, how each field is sourced, and how to verify
the output.

## Background

- **What is JSON-LD?** A JSON-encoded block of linked-data vocabulary embedded
  in the HTML. Crawlers parse it to understand the page's entity without having
  to infer structure from markup.
- **What is `LocalBusiness`?** The `schema.org/LocalBusiness` type describes a
  physical business with a street address, hours, and contact info. Google uses
  it to populate rich results for Local Search.
- **References:**
  - Schema definition → https://schema.org/LocalBusiness
  - Google's rich-results guidelines → https://developers.google.com/search/docs/appearance/structured-data/local-business
  - Google Rich Results Test → https://search.google.com/test/rich-results

## What we emit

The shape produced by `src/components/StructuredData/ListingJsonLd.tsx`, with
an annotated example:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://sacirculardirectory.com/listings/green-bean-coffee",
  "name": "Green Bean Coffee",
  "url": "https://sacirculardirectory.com/listings/green-bean-coffee",
  "description": "Neighborhood coffee roaster offering refills, compost drop-off, and repair workshops.",
  "image": "https://res.cloudinary.com/…/green-bean-exterior.jpg",
  "telephone": "(210) 555-0123",
  "email": "hello@greenbean.example",
  "sameAs": [
    "https://greenbean.example",
    "https://instagram.com/greenbean",
    "https://facebook.com/greenbean"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 S Flores St, San Antonio, TX 78204",
    "addressLocality": "San Antonio",
    "addressRegion": "TX",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 29.4241,
    "longitude": -98.4936
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Monday",    "opens": "07:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday",   "opens": "07:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "07:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday",  "opens": "07:00", "closes": "18:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday",    "opens": "07:00", "closes": "20:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday",  "opens": "08:00", "closes": "20:00" }
  ]
}
```

## Field mapping

Every field is sourced from `Listing.fields` in `src/lib/getListings.ts`, which
is itself populated from the `businesses_complete` Postgres view (Airtable is
upstream source of truth).

| JSON-LD key | Source field | Transform | Omitted when |
|---|---|---|---|
| `@context` | — | constant `"https://schema.org"` | never |
| `@type` | — | constant `"LocalBusiness"` | never |
| `@id` | `slug` | `absoluteUrl('/listings/${slug}')` | never |
| `name` | `businessName` | passthrough | never (always present) |
| `url` | `slug` | same as `@id` | never |
| `description` | `businessDescription` | passthrough (untruncated — crawlers, not humans) | empty string |
| `image` | `listingPhoto[0]` | passthrough (Cloudinary URL) | array empty |
| `telephone` | `businessPhone` | passthrough | empty string |
| `email` | `businessEmail` | passthrough | empty string |
| `sameAs` | `website`, `instagramUrl1`, `facebookUrl`, `linkedInUrl` | truthy-filter into array | all four empty |
| `address.streetAddress` | `address` | passthrough full string | empty string |
| `address.addressLocality` | — | constant `"San Antonio"` | `address` omitted |
| `address.addressRegion` | — | constant `"TX"` | `address` omitted |
| `address.addressCountry` | — | constant `"US"` | `address` omitted |
| `geo.latitude` / `longitude` | `latitude`, `longitude` | passthrough numbers | either is `null` |
| `openingHoursSpecification` | `hoursJson.hours` | expand each day's `DayHours[]` into one entry per range (see below) | `hoursJson` null or no day has a non-null array |

### Hours transform

`hoursJson.hours` is a `Partial<Record<DayKey, DayHours[] | { special: string } | null>>`
where `DayKey` is `'mon'..'sun'`. For each day:

- If the value is a `DayHours[]` array → emit one `OpeningHoursSpecification`
  per range with `dayOfWeek` mapped to the schema.org full day name.
- If the value is `null` → the business is closed that day; schema.org
  represents closed days by omission, so we emit nothing.
- If the value is `{ special: "By appointment" }` → also omit. Schema.org does
  not have a clean free-text representation for "special hours" that Google
  will render as a rich result, so we skip. Users still see the note in the
  visible hours block.

## Data-quality contract

Airtable is upstream source of truth. Anything wrong in Airtable surfaces
verbatim in Google's rich-results card. In particular:

- Incorrect phone numbers get displayed with a tap-to-call button.
- Incorrect hours show up in the "Hours" section of the Local Pack.
- Incorrect lat/lng places the pin in the wrong spot on Google Maps.

Treat the Airtable fields backing this schema (`businessName`,
`businessDescription`, `businessPhone`, `businessEmail`, `address`, `latitude`,
`longitude`, `hoursJson`) as production data for external consumers — not
internal notes.

## How to test locally

Start the dev server and `curl` a listing page, then extract the JSON-LD:

```bash
npm run dev
# in another terminal
curl -s http://localhost:3000/listings/<slug> \
  | grep -oP '<script type="application/ld\+json">\K[^<]+' \
  | jq .
```

Expected: a pretty-printed JSON object conforming to the shape above.

## How to validate against Google

After deploy:

1. Open https://search.google.com/test/rich-results
2. Paste a production listing URL (e.g. `https://sacirculardirectory.com/listings/<slug>`)
3. Click "Test URL".
4. Expected result: **"Page is eligible for rich results"** with a
   `LocalBusiness` entity detected and all fields shown in the preview panel.
5. Any warnings are usually from optional fields Google would like (`priceRange`,
   `aggregateRating`) — these are not required for eligibility but improve the
   rich card when present.

## Future additions

Fields worth considering once the current foundation ships:

- **`priceRange`** — `"$"`, `"$$"`, `"$$$"`. Renders as a price indicator in the
  Local Pack. Would need a new Airtable field.
- **`aggregateRating`** — if the app ever collects reviews, adding an
  `AggregateRating` node enables the star-rating row in search results.
- **More specific `@type`** — swap `LocalBusiness` for a subtype like
  `ThriftStore`, `Restaurant`, `RepairShop`, or `Store` per listing. Google
  uses the specific type to drive category-specific rich-result features.
  Requires a reliable mapping from `Listing.fields.typeOfBusiness` → schema.org
  subtype.
- **`hasOfferCatalog`** — structured list of services the business performs
  (e.g. "bike repair", "battery recycling"). Could be derived from
  `allActionNames` + `inputCategories` / `outputCategories`.
- **`OpeningHoursSpecification.validFrom` / `validThrough`** — for seasonal
  businesses or holiday hours.
