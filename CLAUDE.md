---
name: figma-to-component
description: >
  Translates Figma designs into Next.js components for the SA Circular Directory app.
  Use this skill whenever the user says "build this component", "implement this from Figma",
  "translate this design", or shares a Figma URL or node. Always read this skill before
  writing any component, even for small UI pieces.
---

# Figma → Component: SA Circular Directory

## ⚠️ Prime Directive — Always Use Design Tokens

**Never hardcode values from Figma.** Every color, spacing, radius, shadow, and font value
in this codebase has a corresponding CSS custom property and SCSS variable. Your job is to
map Figma values to the correct token — not copy raw values.

If Figma shows `#1E5751` → use `var(--fern-700)` or `$fern-700`.  
If Figma shows `16px` padding → use `var(--space-4)` or `$space-4`.  
If Figma shows `border-radius: 8px` → use `var(--radius-lg)` or `$radius-lg`.

**When there is no exact match:** map to the nearest existing token and leave an inline
comment: `// nearest token: Figma used #388A58, mapped to $fern-600`.  
**Never create a new variable without flagging it** with a `// TODO: token needed?` comment.

---

## Project Context

- **App:** SA Circular Directory — a Next.js 14 app (App Router) with TypeScript
- **Styling:** SCSS modules per component + global design tokens
- **Figma source:** `2026_Circular_Directory`
- **Fonts:** Archivo (display/hero via Google Fonts) · Geist (UI/body via `next/font`)
- **Style entry point:** `src/styles/globals.scss` (imported in `layout.tsx`)

### Import chain
```
globals.scss
  └── @import 'typography'
        └── @import 'variables'   ← all $vars live here
  └── @import 'tokens'            ← maps $vars → CSS custom properties (:root)
```

---

## Token Reference

### Fonts
| CSS custom property | SCSS variable | Value |
|---|---|---|
| `--font-display` | `$font-display` | `'Archivo', serif` |
| `--font-body` | `$font-body` | `'Geist', sans-serif` |

### Semantic Color Tokens (prefer these over raw palette)
```
Surface
  --surface-base       $surface-base        offWhite-100 (#F9F8F5)
  --surface-raised     $surface-raised      mono-100 (#FFFFFF)
  --surface-sunken     $surface-sunken      offWhite-300 (#EEECE8)

Text
  --text-default       $text-default        mono-800 (#2F2F2F)
  --text-subtle        $text-subtle         mono-600 (#6F6F6F)
  --text-disabled      $text-disabled       offWhite-700 (#A6A29A)
  --text-inverse       $text-inverse        mono-100 (#FFFFFF)
  --text-inverse-secondary                  mono-300 (#F0F0F0)
  --text-link          $text-link           fern-700 (#1E5751)

Border
  --border-default     $border-default      offWhite-400 (#D6D4CE)
  --border-subtle      $border-subtle       offWhite-300 (#EEECE8)
  --border-medium      $border-medium       offWhite-500 (#CAC7BE)
  --border-strong      $border-strong       mono-800 (#2F2F2F)

Primary (Fern / teal-green)
  --primary-default    $primary-default     fern-700 (#1E5751)
  --primary-hover      $primary-hover       fern-900 (#092620)
  --primary-active     $primary-active      fern-600 (#388A58)
  --primary-subtle     $primary-subtle      fern-400-alt (#80B7B1)

Secondary (Merlot / burgundy)
  --secondary-default  $secondary-default   merlot-700 (#851926)
  --secondary-hover    $secondary-hover     merlot-900 (#3A0810)
  --secondary-active   $secondary-active    merlot-600 (#9E4868)
  --secondary-subtle   $secondary-subtle    merlot-400 (#D4A8D8)

Feedback
  --warning-surface-dark / -light / -text / -icon
  --success-surface-dark / -light / -text / -icon
  --error-surface-dark   / -light / -text / -icon
  --info-surface-dark    / -light / -text / -icon
```

### Raw Palette (use only when no semantic token fits)
Color families: `mono`, `offWhite`, `orange`, `merlot`, `fern`, `violet`, `spruce`,
`mintChoc`, `blue`, `redAdobe` — each with steps 100–900.  
Example: `var(--fern-400)` / `$fern-400`

### Spacing (4px base scale)
| Token | Value |
|---|---|
| `--space-1` / `$space-1` | 4px |
| `--space-2` / `$space-2` | 8px |
| `--space-3` / `$space-3` | 12px |
| `--space-4` / `$space-4` | 16px |
| `--space-5` / `$space-5` | 20px |
| `--space-6` / `$space-6` | 24px |
| `--space-7` / `$space-7` | 28px |
| `--space-8` / `$space-8` | 32px |
| `--space-10` / `$space-10` | 40px |
| `--space-12` / `$space-12` | 48px |

### Border Radius
`--radius-sm` 4px · `--radius-md` 6px · `--radius-lg` 8px · `--radius-xl` 12px · `--radius-2xl` 16px

### Shadows
`--shadow-xs` · `--shadow-sm` · `--shadow-md` · `--shadow-lg`

### Typography Classes (from typography.scss)
Apply these as CSS classes, not by repeating font properties inline.

**Hero** (Archivo): `.hero-1` 62px · `.hero-2-strong` 50px/500 · `.hero-2-light` 50px/300 · `.hero-3` 40px · `.hero-4` 28px/500

**Heading** (Geist): `.heading-1` 40px · `.heading-2` 28px · `.heading-3` 20px · `.heading-4` 17px · `.heading-5` 15px

**Body** (Geist): `.body-large-regular/medium/bold` · `.body-default-regular/medium/bold` · `.body-small-regular/medium/bold`

**Caption**: `.caption-regular` · `.caption-bold` · `.caption-extrabold`

**Label**: `.label-large` · `.label-large-strong` · `.label-default` · `.label-default-strong` · `.label-small` · `.label-small-strong` · `.label-caption` · `.label-caption-strong`

---

## Component Conventions

### File structure
```
src/components/
  ComponentName/
    ComponentName.tsx
    ComponentName.module.scss
    index.ts          (re-export)
```

### SCSS modules
```scss
// ComponentName.module.scss
@import '../../styles/mixins';   // relative path from src/components/ComponentName/ — mixins imports variables

.root {
  background: $surface-base;
  color: $text-default;
  padding: $space-4 $space-6;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}
```

Use SCSS `$variables` inside `.module.scss` files.  
Use `var(--token)` in inline styles or JS-driven dynamic styles only.

### TypeScript component shell
```tsx
import styles from './ComponentName.module.scss';
import clsx from 'clsx'; // if conditional classes needed

interface ComponentNameProps {
  // props here
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div className={styles.root}>
      {/* content */}
    </div>
  );
}
```

---

## Figma MCP Workflow

1. **Fetch the node** — use the Figma MCP tool with the file key `2026_Circular_Directory`
2. **Audit values** — for every design value (color, spacing, radius, font, shadow), identify the matching token before writing any code
3. **Build a token map** — mentally or as a comment block: `Figma value → token`
4. **Write the component** — no raw values, only tokens
5. **Flag mismatches** — any value with no close token gets a `// nearest token:` comment

---

## Common Gotchas

- `#1E5751` is `$fern-700` / `$primary-default` — the primary brand color
- `#851926` is `$merlot-700` / `$secondary-default` — the secondary brand color
- Background default is `$surface-base` (`$offWhite-100`, not pure white)
- Pure white (`#FFFFFF`) = `$surface-raised` / `$mono-100`
- Default body text is `$text-default` (`$mono-800`, not `$mono-900` / black)
- Geist is loaded via `next/font` in `layout.tsx` — don't import it via CSS
- Archivo is loaded via Google Fonts in `typography.scss` — already available globally
- h1–h5 and `p` have global defaults set in `globals.scss` via `@extend` — don't redefine base element styles in modules unless overriding intentionally

---

## Notes for Author (Not for Claude)
- One thing to keep updated: as I add more tokens or mixins to variables.scss, I should them to the token reference table in the skill. It only takes a line and saves a lot of back-and-forth with Claude later.
