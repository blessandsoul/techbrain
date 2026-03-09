# Catalog System — Categories, Filters, Architecture

## Overview

The catalog uses a **sidebar category tree** with dynamic **per-category filters**, multi-select checkboxes, price range, sorting, and pagination. All filtering is server-side (in-memory, JSON files). Filters are encoded in URL params for shareability.

---

## Category Tree

```
All (91)
├── Cameras (67)
│   ├── IP Cameras          — spec: კამერის ტიპი = "IP"
│   ├── Analog Cameras      — spec: კამერის ტიპი = "ანალოგური"
│   ├── Wi-Fi Cameras       — spec: Wi-Fi = "კი"
│   ├── PTZ Cameras         — spec: PTZ / PT = "PTZ"
│   └── PT Cameras          — spec: PTZ / PT = "PT"
├── NVR Kits (6)
├── Accessories (8)
├── Storage (5)
└── Services (5)
```

**Subcategories are virtual** — they filter by spec values, not by a separate field in the product JSON. No product data migration needed.

Config file: `src/lib/constants/category-tree.ts`

---

## Filters per Category

### Cameras (13 filters)

| URL param | Spec key (Georgian) | Label (EN) | Expanded by default |
|---|---|---|---|
| `brand` | ბრენდი | Brand | Yes |
| `resolution` | რეზოლუცია | Resolution | Yes |
| `bodyType` | კორპუსის ტიპი | Body Type | Yes |
| `nightVision` | ღამის ხედვა | Night Vision | Yes |
| `nightVisionRange` | ღამის ხედვა (მანძილი) | Night Vision Range | No |
| `lens` | ლინზა | Lens | No |
| `wifi` | Wi-Fi | Wi-Fi | No |
| `ptz` | PTZ / PT | PTZ / PT | No |
| `microphone` | მიკროფონი | Microphone | No |
| `microSD` | Micro SD | Micro SD | No |
| `protectionClass` | დაცვის კლასი | Protection Class | No |
| `cmosSensor` | CMOS სენსორი | CMOS Sensor | No |
| `aiDetection` | ადამიანის და ავტომობილის სილუეტის ამოცნობა | AI Detection | No |

### NVR Kits (6 filters)

| URL param | Spec key (Georgian) | Label (EN) | Expanded by default |
|---|---|---|---|
| `channels` | არხები | Channels | Yes |
| `nvrResolution` | გარჩევადობა | Resolution | Yes |
| `hdd` | HDD | HDD | No |
| `connectivity` | კავშირი | Connectivity | No |
| `poe` | PoE | PoE | No |
| `codec` | კოდეკი | Codec | No |

### Accessories (4 filters)

| URL param | Spec key (Georgian) | Label (EN) | Expanded by default |
|---|---|---|---|
| `accType` | ტიპი | Type | Yes |
| `voltage` | ძაბვა | Voltage | No |
| `power` | სიმძლავრე | Power | No |
| `material` | მასალა | Material | No |

### Storage (3 filters)

| URL param | Spec key (Georgian) | Label (EN) | Expanded by default |
|---|---|---|---|
| `capacity` | მოცულობა | Capacity | Yes |
| `interface` | ინტერფეისი | Interface | No |
| `rpm` | RPM | RPM | No |

### Services

No filters.

Config file: `src/lib/constants/filter-config.ts`

---

## URL Params

```
?category=cameras              # Main category
&subcategory=cameras-wifi      # Virtual subcategory (spec-based)
&brand=Hikvision,Dahua         # Multi-select — comma-separated
&resolution=4%20მპ,8%20მპ     # Multi-select
&minPrice=50                   # Price range min
&maxPrice=300                  # Price range max
&sort=price-asc                # Sort: newest | price-asc | price-desc | name-asc
&page=2                        # Page number (starts at 1)
&limit=32                      # Items per page: 16 | 32 | 64
```

Backward compatible — old single-value params (e.g. `?brand=Hikvision`) still work.

---

## Component Architecture

```
CatalogPage (Server Component)
├── CatalogSidebar (Client)
│   ├── CategoryTree — collapsible tree with product counts
│   ├── DynamicFilterSection — renders filter groups per active category
│   │   └── FilterCheckboxGroup × N — multi-select checkboxes with counts
│   └── PriceRangeFilter — min/max inputs, debounced 500ms
├── CatalogToolbar (Client) — sort, items/page, active filter chips
├── MobileFilterDrawer (Client) — slide-over drawer for < lg screens
├── ProductGrid → ProductCard (existing)
└── Pagination (existing)
```

### Data flow

1. Server Component parses URL search params
2. Resolves category node from `CATEGORY_TREE`
3. Gets `FilterFieldConfig[]` for active category
4. Calls `getFilteredProducts()` — filters by category → subcategory spec → multi-value specs → price → sort → paginate
5. Calls `getAvailableSpecValues()` per filter — computed from category-only filtered products (so all options stay visible)
6. Passes everything as props to client components

---

## File Map

### New files

| File | Purpose |
|---|---|
| `src/lib/constants/category-tree.ts` | Category hierarchy definition + subcategory spec filters |
| `src/lib/constants/filter-config.ts` | Per-category filter field configurations |
| `src/lib/utils/catalog-params.ts` | URL param parsing (multi-value, pagination, sort) |
| `src/features/catalog/components/CategoryTree.tsx` | Sidebar collapsible category tree |
| `src/features/catalog/components/FilterCheckboxGroup.tsx` | Multi-select checkbox group with show more/less |
| `src/features/catalog/components/DynamicFilterSection.tsx` | Composes filter groups from config |
| `src/features/catalog/components/PriceRangeFilter.tsx` | Price range min/max inputs |
| `src/features/catalog/components/CatalogSidebar.tsx` | Sidebar wrapper (tree + filters + price) |
| `src/features/catalog/components/CatalogToolbar.tsx` | Sort, per-page, count, removable filter chips |
| `src/features/catalog/components/MobileFilterDrawer.tsx` | Slide-over drawer for mobile |

### Modified files

| File | Changes |
|---|---|
| `src/types/product.types.ts` | Added `SortOption` type |
| `src/lib/products.ts` | New filter engine: `getFilteredProducts()`, `getAvailableSpecValues()`, `getCategoryCounts()` |
| `src/app/[locale]/catalog/page.tsx` | Full rewrite — sidebar layout, dynamic filters, sorting, pagination |
| `messages/ka.json` | +30 translation keys (filters, sort, categories) |
| `messages/ru.json` | +30 translation keys |
| `messages/en.json` | +30 translation keys |
| `src/features/admin/components/ProductForm.tsx` | Added `accessories` to category dropdown |
| `src/app/globals.css` | Added `animate-slide-in-left` keyframe |

### Deleted files

| File | Replaced by |
|---|---|
| `CategoryFilter.tsx` | `CategoryTree.tsx` |
| `SpecFilter.tsx` | `DynamicFilterSection.tsx` + `FilterCheckboxGroup.tsx` |

---

## How to Add a New Category

1. Add the value to `ProductCategory` type in `src/types/product.types.ts`
2. Add a node to `CATEGORY_TREE` in `src/lib/constants/category-tree.ts`
3. Add filter configs to `CATEGORY_FILTER_CONFIG` in `src/lib/constants/filter-config.ts`
4. Add translation keys to all 3 language files (`catalog.<name>`, `catalog.filter_*`)
5. Add the category option to admin `ProductForm.tsx` dropdown
6. Create product JSON files in `public/data/products/`

## How to Add a New Subcategory (for cameras)

1. Add a child to the `cameras` node in `CATEGORY_TREE`:
   ```ts
   { id: 'cameras-4g', parentCategory: 'cameras', labelKey: 'catalog.cameras_4g',
     specFilter: { kaKey: '4G', value: 'კი' } }
   ```
2. Add translation key `catalog.cameras_4g` to all 3 language files
3. Ensure products have the matching spec (key: `4G`, value: `კი`)

## How to Add a New Filter to a Category

1. Add a `FilterFieldConfig` entry to the category's array in `CATEGORY_FILTER_CONFIG`:
   ```ts
   { id: 'opticalZoom', specKaKey: 'ოპტიკური ზუმი', labelKey: 'catalog.filter_optical_zoom', priority: 14 }
   ```
2. Add translation key `catalog.filter_optical_zoom` to all 3 language files
3. Ensure products have specs with key `ოპტიკური ზუმი` — the filter auto-detects available values

---

## Product Spec Keys Reference

### Cameras

| Georgian key | English | Example values |
|---|---|---|
| ბრენდი | Brand | Dahua, Ezviz, HiWatch, Hikvision, Tenda, Tiandy, Uniview |
| კამერის ტიპი | Camera Type | IP, ანალოგური |
| კორპუსის ტიპი | Body Type | შიდა გამოყენების, გარე გამოყენების |
| რეზოლუცია | Resolution | 2 მპ, 3 მპ, 4 მპ, 5 მპ, 6 მპ, 8 მპ |
| ლინზა | Lens | 1.4 მმ, 2.8 მმ, 3.6 მმ, 4 მმ, 6 მმ, 2.7-13.5 მმ, ... |
| ღამის ხედვა | Night Vision | ჭკვიანი, ფერადი, შავ-თეთრი |
| ღამის ხედვა (მანძილი) | Night Vision Range | 10 მეტრი ... 100 მეტრი |
| CMOS სენსორი | CMOS Sensor | 1/2.7" CMOS, 1/2.8" CMOS, 1/2.9" CMOS, 1/3" CMOS |
| ხედვის კუთხე | View Angle | 101° ... 360° |
| მიკროფონი | Microphone | კი, კი. (ორმხრივი აუდ. კავშირი) |
| Micro SD | Micro SD | 128 GB, 256 GB, 512 GB |
| Wi-Fi | Wi-Fi | კი |
| PTZ / PT | PTZ / PT | PTZ, PT |
| დაცვის კლასი | Protection Class | IP 65, IP 66, IP 67, IP 66 / IK10, IP 67 / IK10 |
| ადამიანის და ავტომობილის სილუეტის ამოცნობა | AI Detection | კი |
| ოპტიკური ზუმი | Optical Zoom | 25x |
| 101 დადგენილება | Regulation 101 | კი |

### NVR Kits

| Georgian key | English | Example values |
|---|---|---|
| არხები | Channels | 4CH, 8CH, 16CH |
| გარჩევადობა | Resolution | 3MP, 4MP, 8MP / 4K |
| HDD | HDD | 500GB, 1TB, 2TB, 4TB |
| კავშირი | Connectivity | IP, PoE, PoE + IP, WiFi + IP |
| PoE | PoE | 8 ports |
| max HDD | Max HDD | 8TB |
| კოდეკი | Codec | H.265+ |
| ტიპი | Type | DVR Analog |

### Accessories

| Georgian key | English | Example values |
|---|---|---|
| ტიპი | Type | RG59 Coax, UTP Cat5e |
| ძაბვა | Voltage | 12V DC, 48V |
| სიმძლავრე | Power | 60W, 120W, 1000VA / 600W |
| მასალა | Material | Metal |
| პორტები | Ports | 4, 8 |
| სტანდარტი | Standard | Cat5e/Cat6 |
| სიგრძე | Length | 100m, 305m |
| დენი | Current | 2A |
| ბატარეა | Battery | 12V 7Ah |
| მონტაჟი | Mount | Wall / Ceiling |

### Storage

| Georgian key | English | Example values |
|---|---|---|
| მოცულობა | Capacity | 1TB, 2TB, 4TB, 6TB, 8TB |
| ინტერფეისი | Interface | SATA 6Gb/s |
| მუშაობა | Operation | 24/7 |
| RPM | RPM | 5400, 7200 |

### Services

| Georgian key | English | Example values |
|---|---|---|
| გარანტია | Warranty | 6 months, 1 year |
