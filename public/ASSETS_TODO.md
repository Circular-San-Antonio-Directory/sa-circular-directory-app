# Missing Public Assets

The following assets are referenced by SEO metadata in `src/app/layout.tsx` and
`src/app/listings/[slug]/page.tsx` but do not yet exist in `/public`. Until they
are added, browsers will show default favicons and social-share previews will
fail to load an `og:image`.

## Required files

| File | Dimensions | Format | Referenced from |
|------|------------|--------|-----------------|
| `favicon.ico` | 32×32 (multi-size ICO recommended) | ICO | `metadata.icons.icon` in `layout.tsx` |
| `apple-touch-icon.png` | 180×180 | PNG | `metadata.icons.apple` in `layout.tsx` |
| `og-default.png` | 1200×630 | PNG | `metadata.openGraph.images` fallback for home + listings without a listing photo |

## Notes

- **OG image design:** should include the SA Circular Directory wordmark/logo on
  a branded background. Text rendered in the image itself tends to outperform
  pure-logo images on social preview cards.
- **OG image file size:** keep under ~200 KB — Twitter/X caches aggressively and
  larger images sometimes fail to render in preview cards.
- **Favicon:** a multi-resolution `.ico` (16×16, 32×32, 48×48) is preferred over
  a single-size file for compatibility with older browsers and OS icon rendering.
- **Listing pages** use `listing.fields.listingPhoto[0]` when present and fall
  back to `/og-default.png` — so the default only shows for listings with no
  uploaded photo.

## How to verify after adding

1. Visit `http://localhost:3000/favicon.ico` → returns the ICO file.
2. Visit `http://localhost:3000/og-default.png` → returns the PNG.
3. After deploy, paste the production URL into Facebook's Sharing Debugger and
   the Twitter Card Validator — confirm the image renders in the preview.

Once all three files are in place, delete this document.
