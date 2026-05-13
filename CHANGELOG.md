# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
