# Adding Dynamic Listing Hours Styling to Listing Details Page
This is a spec file, that I will completete with the help of Claude, but will also help Claude implement functionality once planning is done.

## Current State & Objective
Currently each business listing has 'Business hours' information that is static text. 

Objective: The vision is that the styling is dynamic for the 'Business hours' component in the listing based on if the business is:
- Currently Open (If open, indicate when the business closes)
- Currently Closed (If closed, indicate when the business opens next.)

This means that, the listing information needs to be processed in such a way that logic can determine the current state of the listing.

## Technical Plan

### How information needs to be input into AirTable

The **existing `Business Hours` field** is reformatted to a consistent text format:

```
Mon-Fri: 10am-6pm
Sat: 10am-4pm
Sun: Closed
```

**Rules:**
- One line per day or day range. Days use 3-letter abbreviations (Mon, Tue, Wed, Thu, Fri, Sat, Sun), case-insensitive.
- Day range: `Mon-Fri` (includes all days between). Day list: `Mon, Wed, Fri`.
- Time range: `10am-6pm` or `10:30am-5:30pm`. 12-hour with am/pm, no space.
- Split hours (two sessions): `10am-2pm, 4pm-8pm`.
- Closed: write `Closed` as the time, or simply omit the day (unlisted days = closed).

**Examples:**
```
# Non-contiguous days
Mon, Wed, Fri: 10am-5pm
Thu: 10am-7pm
Sun: 10am-3pm

# Explicit closed days
Mon-Wed: Closed
Thu, Sun: 10am-2pm
Fri-Sat: 10am-6pm
```

### How the db parses that information once synced

During the Airtable sync (`src/lib/sync.ts`), the `Business Hours` text is parsed into a structured `hours_json` JSONB value and stored in a new `hours_json` column on the `businesses` table. The existing `business_hours` TEXT column is unchanged as the raw source — but display is now driven by the parsed `hours_json`.

The parser (`parseBusinessHoursText`) converts the text to this internal JSON shape:
```json
{
  "tz": "America/Chicago",
  "hours": {
    "mon": [{ "open": "10:00", "close": "18:00" }],
    "sat": [{ "open": "10:00", "close": "16:00" }],
    "sun": null
  }
}
```
Days not mentioned are omitted (treated as closed). Invalid/unparseable text → `hours_json` is `null`, which hides the hours block entirely in the UI.

### Open/Closed Logic (`src/lib/hoursUtils.ts`)

A `getHoursStatus(hoursJson)` utility determines the current state using the `America/Chicago` timezone via native `Intl.DateTimeFormat` (no external library):

- **Open**: returns `{ isOpen: true, label: "Until 6pm" }`
- **Closed**: returns `{ isOpen: false, label: "Opens Mon at 10am" }` or `"Opens 9am"` (same day)
- **No data**: returns null — component hidden

Handles: midnight-crossing hours, split sessions, days with no hours, non-standard ranges, notes.

### Edge Cases

**1. `Note:` line**
- If the last line of the `Business Hours` text starts with `Note:`, strip it from schedule parsing and store it separately in the JSON as `"note": "..."`.
- It has no effect on open/closed logic or header styling.
- Displayed below the day rows in the expanded panel, in `.body-small-regular` `$mono-700`.
- Schema addition: `note?: string` on `BusinessHoursJson`.

**2. Non-standard time range (e.g., "By Appointment")**
- If a day's value is neither a parseable time range nor `Closed`, store it as `{ "special": "By Appointment" }` instead of an array.
- Schema: day entry type becomes `DayHours[] | { special: string } | null`.
- **Header state**: if today's day entry is `special`, show the **mono** colorway:
  - Background: `$mono-300` (`#f0f0f0`)
  - "Hours" label + icon: `$mono-700`
  - Status line: `"Currently: [string]"` — single line, `.body-small-regular`, `$mono-700`
  - Chevron present (expanded panel still shows the full schedule)
- **Expanded panel**: display the special string as the time value in that day's row (e.g., "By Appointment").

**3. No data / unparseable fallback**
- When `hoursJson` is `null` (field empty or text couldn't be parsed at all).
- Show the **mono** colorway, **no chevron**, no expanded panel:
  - Background: `$mono-300`
  - "Hours" label + icon: `$mono-700`
  - Message: `"Please view website or social media for hours."` — wraps, `.body-small-regular`, `$mono-700`

### Files Affected

| File | Change |
|---|---|
| `migrations/008_add_hours_json.sql` | New migration — add `hours_json JSONB` column |
| `migrations/current_schema.sql` | Add `hours_json JSONB` to businesses table |
| `src/lib/sync.ts` | Add `parseBusinessHoursText`, map to new column |
| `src/lib/getListings.ts` | Add `BusinessHoursJson` types + `hoursJson` field |
| `src/lib/hoursUtils.ts` | New utility — `getHoursStatus` |
| `src/app/listings/[slug]/ListingContent.tsx` | Replace `<details>` with dynamic hours component |
| `src/app/listings/[slug]/ListingTabs.tsx` | Replace `<details>` with dynamic hours component |


## Styling Implementation Plan

Based on Figma frame `9433:23850` in `2026_Circular_Directory`.

### Component Structure

The existing `<details>/<summary>` element is replaced with a custom accordion. The `businessHours` raw text field is **no longer displayed** — the expanded panel renders the structured schedule from `hoursJson`. The component has two parts:

1. **Header pill** — colored based on open/closed state, always visible
2. **Expanded panel** — offWhite card with day-by-day schedule rows, toggled by clicking the header

### Visual States

**Open (green)**
- Background: `$fern-100` (`#f0fde8`)
- "Hours" label + icon color: `--success-text` (`#123d38`)
- "Currently Open" text: `--success-text`
- "Until 6pm" accent text: `$success-surface-dark` / `$fern-600` (`#388a58`)
- Chevron color: `$fern-600`

**Closed (amber)**
- Background: `$orange-100` (`#fefae8`)
- "Hours" label + icon color: `--warning-text` (`#8a2a08`)
- "Currently Closed" text: `--warning-text`
- "Opens 9am" / "Opens Monday" accent text: `$warning-surface-dark` (`#d97828`)
- Chevron color: `$warning-surface-dark`

**Non-standard range** (e.g., "By Appointment") — shown when today's entry is `{ special: "..." }`
- Background: `$mono-300` (`#f0f0f0`)
- "Hours" label + icon: `$mono-700`
- Status: `"Currently: [string]"` — single line, `.body-small-regular`, `$mono-700`
- Chevron present; expanded panel shows the full schedule with the special string as the time value

**No data fallback** — shown when `hoursJson` is null
- Background: `$mono-300`
- "Hours" label + icon: `$mono-700`
- Message: `"Please view website or social media for hours."` — wraps, `$mono-700`
- **No chevron**, no expanded panel

### Expanded Panel
- Background: `$surface-base` (`$offWhite-100`, `#f8f8f6`)
- Border: 1px solid `$border-subtle`
- Border radius: `$radius-sm` (4px)
- Padding: `$space-4` (16px)
- Row gap: `$space-2` (8px)
- Day name column: fixed `140px` width, `.body-small-regular`, `$mono-700`
- Time value: `.body-small-medium`, `$mono-700`
- Closed days show "Closed" as the time value
- Non-standard days (e.g., "By Appointment") show the special string as the time value
- If a `note` is present, it renders below all day rows, `.body-small-regular`, `$mono-700`, full width

### Header Layout & Spacing
- Padding: `$space-3` top/bottom (12px), `$space-4` left/right (16px)
- Border radius: `$radius-sm` (4px)
- Gap between header and expanded panel: `$space-2` (8px)
- Internal info gap (label row to status row): `$space-1-5` (6px)
- Clock icon: 14px, Font Awesome `fa-regular fa-clock`
- Icon-to-label gap: `$space-1-5` (6px)
- Chevron: 16px, Font Awesome `fa-solid fa-chevron-down`, rotates 180° when expanded
- Status row gap (between "Currently Open" and "Until 6pm"): `$space-2` (8px)

### Typography
- "Hours" label: `.label-caption-strong` (Geist SemiBold, 13px)
- "Currently Open / Closed": `.body-small-regular` (Geist Regular, 15px)
- "Until 6pm" / "Opens [day]": `.body-small-medium` (Geist Medium, 15px)
- Day name / time in expanded panel: `.body-small-regular` / `.body-small-medium`

### Token Flags
- `$fern-100` and `$orange-100` — exist in the raw palette (`_variables.scss`) but not in the CLAUDE.md token table. Confirm they're defined before implementing.
- `--success-text`, `--warning-text`, `$success-surface-dark`, `$warning-surface-dark` — defined under Feedback tokens in CLAUDE.md.