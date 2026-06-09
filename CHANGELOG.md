# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.5]
- Fixed favicon not appearing in browser tabs or Google Search results. The `layout.tsx` metadata was pointing to `/favicon.ico` and `/apple-touch-icon.png` which didn't exist, overriding Next.js's file-based icon convention. Removed the explicit `icons` block so Next.js serves `src/app/icon.svg` automatically, and generated `src/app/apple-icon.png` (180×180) for Apple devices.

## [1.1.4]
- Added Google Search Console verification meta tag to the root layout so both staging and production can be verified in Google Search Console.

## [1.1.3]
- Fixed `/map` page appearing in Google Search under the staging domain (`s-directory.circularsanantonio.org`). Added a canonical URL metadata tag to the map page pointing to the production domain, and added `/map` to the dynamic sitemap so production is clearly signalled as authoritative to crawlers.

## [1.1.2]
- Fixed Railway staging deploys failing because `package-lock.json` was missing resolved entries for `@emnapi/core@1.10.0` and `@emnapi/runtime@1.10.0`. These are transitive deps of an optional wasm32 package; npm 11 (local) skips them but npm 10 (Railway / Node 22) fails the pre-flight lockfile check. Added the entries manually and pinned Node 22 via `.nvmrc` and the `engines` field to prevent the version mismatch from recurring.

## [1.1.1]
- Fixed staging deploy failing because `package-lock.json` was out of sync with `package.json` — two transitive packages (`@emnapi/runtime`, `@emnapi/core`) were missing from the lockfile. Regenerated the lockfile via `npm install`.

## [1.1.0]
- Added SEO metadata across all pages: `<title>` templates, Open Graph tags, Twitter card tags, and canonical URLs on the root layout, home page, and each listing detail page. Listing pages generate per-business descriptions and pull the listing photo as the OG image with a branded fallback.
- Added `LocalBusiness` JSON-LD structured data to every listing page so Google can render rich results (address, phone, hours, map pin). Fields are sourced directly from Airtable via the existing data pipeline.
- Added dynamic `/sitemap.xml` covering the home page and all listing pages.
- Added `/robots.txt` with environment-aware crawling rules — staging is blocked from all crawlers; production allows indexing with specific paths disallowed (`/api`, `/design-system`, etc.).
- Fixed listing modal scroll-lock: page scroll position is now correctly restored when the modal closes.
- Extracted `applyBusinessFieldMap` into a pure testable helper in `mapping.ts`; added structural consistency tests for all field maps.
- Added 39 tests for `ListingJsonLd` covering schema identity, optional field presence/absence, hours transform edge cases, amenity features, and keyword deduplication.

## [1.0.6]
- Fixed Airtable sync reading the wrong column name for business descriptions. The typo `Business Descriptios` was corrected to `Business Description` in the Airtable base; updated schema, mapping, and migration helpers to match.
- Reorganized `src/app/listings/[slug]` components into individual subdirectories following the project's component conventions. No behaviour change.

## [1.0.5]
- Fixed production deployment failing in `promote-db.js` because staging has a `_prisma_migrations` table that doesn't exist in production. Internal migration tracking tables (`_prisma_migrations`, `schema_migrations`) are now excluded from the staging→production data promotion.

## [1.0.4]
- Fixed Railway production build failing due to Railpack treating `MAPBOX_SECRET_TOKEN` as a required build-time secret. Switched to bracket notation in `sync.ts` so the variable is only resolved at runtime during `npm run sync`.

## [1.0.3]
- Migrate the runMigration scripts to typecript

## [1.0.2]
- Fixed sell and donate action icons not appearing. The Airtable "Corresponding Action" values ("Sell my Items", "Drop Off") didn't match the keys in `CORRESPONDING_ACTION_TO_ACTION_NAME`, causing both rows to be silently skipped in `getActions()`.

## [1.0.0] 

## [1.0.1]
- Enforcing semantic versioning

---

[Unreleased]: https://github.com/gabrielkilly/sa-circular-directory-app/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gabrielkilly/sa-circular-directory-app/releases/tag/v1.0.0
