---
name: copy-design
description: Use when the user wants to copy a component's design/UI/UX from the techbrain reference project (reference/client/src) into the techbrain client. Triggers on component names like header, sidebar, card, page, etc.
argument-hint: "<component-name>"
---

The user wants to copy the **design/UI/UX** of `$ARGUMENTS` from the reference project.

## Reference Project

- **Source code:** `reference/client/src` (relative to project root)
- **Static assets:** `reference/client/public` — logos, images, fonts, icons, etc.
- **Live reference URL:** `http://dww4kckg8k4kk4owoo8wsk80.148.251.167.227.sslip.io/`

This is a completed Next.js project used as a **visual/design reference**.

## THE #1 RULE: EXACT VISUAL COPY

**The output must look IDENTICAL to the reference.** Not "inspired by", not "adapted from" — IDENTICAL. If you put the reference screenshot and your result side by side, they must be indistinguishable.

This means:

### Copy EXACTLY as-is (no substitutions)

- **Same JSX structure and layout** — do not rearrange elements
- **Same Tailwind classes** — copy them verbatim, do not "improve" or swap for alternatives
- **Same icons and icon library** — if reference uses `@phosphor-icons/react`, install and use `@phosphor-icons/react`. Do NOT substitute with Lucide, Heroicons, or any other library. Same icon names, same sizes, same weights.
- **Same SVG inline icons** — copy SVGs exactly (cart icons, flag icons, custom illustrations)
- **Same sub-components** — if the reference has `Logo`, `MobileMenu`, `LocaleSwitcher`, `CartIcon`, create ALL of them in our project with the exact same visual output
- **Same static assets** — copy images, logos, fonts from `reference/client/public/` to `client/public/`. Always check the reference public folder.
- **Same text content** — if nav says "მთავარი", "მაღაზია", "კონტაქტი" in the reference, use those exact strings. Do NOT replace with English or our own nav labels.
- **Same animations and transitions** — copy keyframes, durations, easing functions exactly
- **Same responsive behavior** — same breakpoints, same show/hide patterns
- **Same color tokens** — if the reference uses a token we don't have (e.g. `--online`), ADD it to our `globals.css`

### Adapt to our architecture (without changing visual)

The copied code must follow our project's file structure, import conventions, and component patterns (see `.claude/rules/client/`). But **architecture adaptation NEVER changes the visual output**. It only affects where files live and how imports are organized — the rendered UI stays identical.

### Install missing dependencies

If the reference uses a package we don't have (icon library, animation library, etc.), **install it**. However, if you're unsure whether a dependency should be installed (e.g. it's heavy, duplicates something we have, or seems unusual), **ask the user first** and let them decide. Do not silently substitute with "our equivalent".

### What to strip (backend logic ONLY)

Replace ONLY the data-fetching/backend wiring with local UI state or TODO comments:

- `useLocale()`, `getTranslations()` → local `useState` with same default value
- `useCartStore()` → hardcoded placeholder value with `// TODO: connect to real cart state`
- `getSiteSettings()` → hardcoded constant with `// TODO: connect to real settings`
- API calls, server actions, database queries → remove, add TODO
- Auth checks or token handling → remove, add TODO

**Everything else stays exactly the same.** The visual output must not change when you strip backend logic.

## Workflow

### CRITICAL FIRST STEP: Verify with the live reference

**Before writing ANY code**, use Playwright to visit the live reference URL and take a screenshot of the section/component being copied. This is NON-NEGOTIABLE.

1. **Navigate to the live reference** at `http://dww4kckg8k4kk4owoo8wsk80.148.251.167.227.sslip.io/` using Playwright.
2. **Take a screenshot** of the specific section/component the user wants copied. This is your ground truth — the code must produce THIS visual, not what you assume from reading source code alone.
3. **Identify the actual component** used on the live page. The reference codebase may contain multiple versions of the same component (e.g. `PopularProductsSlider.tsx` for product detail pages vs `ProductCard` used in the home page grid). The live screenshot tells you which one is actually rendered.

### Then proceed with implementation

4. **Find the correct component** in `reference/client/src` — the one that matches the live screenshot, NOT just the one with a matching name. Read the **page file** (e.g. `app/[locale]/page.tsx`) to see which component is actually used on that page.
5. **Read ALL sub-components** it imports — every single one, not just the main component. Follow every import chain (except `components/ui/` shadcn components).
6. **Identify the exact assets** used by the live site. Use Playwright to extract actual image `src` attributes, not guess from filenames. Run JS like: `document.querySelectorAll('article img').forEach(img => console.log(img.src))` to get the real image URLs. Then copy those exact files from `reference/client/public/` to `client/public/`.
7. **Check what packages** the reference imports. Install any we don't have.
8. **Check what CSS tokens/variables** the reference uses. Add any missing ones to our `globals.css`.
9. **Create every sub-component** in our project — same file structure, same names.
10. **Copy the main component** — same JSX, same classes, same everything. Only strip backend logic as described above.
11. **Tell the user** what backend logic was stripped and replaced with TODOs.

### Post-implementation verification

12. **After creating the component**, use Playwright to visit your local dev server and take a screenshot of the result.
13. **Compare side-by-side** with the reference screenshot from step 2. If they don't match, fix the differences before declaring done.

## Common mistakes to NEVER make

| Mistake | Why it's wrong |
|---------|---------------|
| Copying a component by matching name without checking the live site | The reference may have multiple components for similar purposes (e.g. `PopularProductsSlider` for product pages vs `ProductCard` grid on home page). The LIVE SITE is the source of truth, not the filename. |
| Guessing which images to use from the reference public folder | ALWAYS use Playwright to extract actual `src` attributes from the live reference. Different products use different image files — picking random ones produces ugly results. |
| Copying a horizontal slider when the live site shows a grid (or vice versa) | Read the actual page file to see which component is rendered, don't assume from component names. |
| Using Lucide icons when reference uses Phosphor | Different icon library = different visual output |
| Replacing Logo image with text `APP_NAME` | Completely different visual |
| Replacing Georgian nav labels with English | Different text = different visual |
| Skipping WhatsApp chip / locale switcher / cart because "we don't have that feature" | The user asked for VISUAL copy, not functional copy |
| Not checking `reference/client/public/` for assets | Missing logos/images = broken visual |
| Asking "which parts should I copy?" | ALL of it. 100%. Don't ask, just copy. |
| Changing the visual in the name of "adapting to our architecture" | Architecture = file placement + imports. Visual output stays identical. |
| Silently installing a heavy/unusual dependency without asking | Ask user first if unsure — they decide what gets installed |
| Using `cn()` or different conditional class patterns | Copy the exact class application pattern from reference |
| Skipping Playwright verification after implementation | Always screenshot both reference and your result to confirm they match |

## File placement

Place copied components following our project structure:
- Layout components → `components/layout/`
- Common/shared components → `components/common/`
- Feature-specific components → `features/<domain>/components/`
- Static assets → `public/`
