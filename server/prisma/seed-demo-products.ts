/**
 * Demo product seed — creates a handful of products per leaf category
 * so the catalog UI can be exercised end-to-end without the reference repo.
 *
 * Idempotent: deletes all products before re-inserting.
 *
 * Run: pnpm tsx prisma/seed-demo-products.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Spec {
  key: { ka: string; ru: string; en: string };
  value: string;
}

interface DemoProduct {
  slug: string;
  nameKa: string;
  price: number;
  originalPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  categorySlug: string;
  specs: Spec[];
}

// Helper for building spec records
const spec = (ka: string, value: string, ru = '', en = ''): Spec => ({ key: { ka, ru, en }, value });

const BRANDS = ['Hikvision', 'Hiwatch', 'CPPLUS', 'RUICHI', 'Camel', 'OEM'];

const DEMO_PRODUCTS: DemoProduct[] = [
  // ── IP Cameras ────────────────────────────────────
  {
    slug: 'hikvision-ip-2mp-bullet',
    nameKa: 'Hikvision 2MP IP კამერა (Bullet)',
    price: 280, isFeatured: true, categorySlug: 'ip-cameras',
    specs: [
      spec('ბრენდი', 'Hikvision'),
      spec('რეზოლუცია', '2MP'),
      spec('კავშირის ტიპი', 'ლან კაბელით (PoE)'),
      spec('MicroSD', 'კი'),
      spec('დაცვის პროტოკოლი', 'IP67'),
      spec('შიდა გამოყენება / გარე გამოყენება', 'გარე'),
      spec('კამერის კორპუსის ტიპი', 'Bullet'),
      spec('ლინზის ზომა', '2.8mm'),
      spec('აუდიო', 'ჩაშენებული მიკროფონით'),
      spec('მზის პანელით', 'არა'),
    ],
  },
  {
    slug: 'hiwatch-ip-4mp-dome',
    nameKa: 'Hiwatch 4MP IP კამერა (Dome)',
    price: 350, originalPrice: 420, isFeatured: true, categorySlug: 'ip-cameras',
    specs: [
      spec('ბრენდი', 'Hiwatch'),
      spec('რეზოლუცია', '4MP'),
      spec('კავშირის ტიპი', 'ლან კაბელით (PoE)'),
      spec('MicroSD', 'არა'),
      spec('დაცვის პროტოკოლი', 'IP66'),
      spec('შიდა გამოყენება / გარე გამოყენება', 'შიდა'),
      spec('კამერის კორპუსის ტიპი', 'Dome'),
      spec('ლინზის ზომა', '3.6mm'),
      spec('აუდიო', 'ომრხრივი აუდიო კავშირი'),
    ],
  },
  {
    slug: 'cpplus-wifi-2mp-turret',
    nameKa: 'CPPLUS 2MP WiFi კამერა (Turret)',
    price: 220, categorySlug: 'ip-cameras',
    specs: [
      spec('ბრენდი', 'CPPLUS'),
      spec('რეზოლუცია', '2MP'),
      spec('კავშირის ტიპი', 'WIFI'),
      spec('MicroSD', 'კი'),
      spec('კამერის კორპუსის ტიპი', 'Turret'),
      spec('ლინზის ზომა', '4mm'),
    ],
  },

  // ── Analog Cameras ───────────────────────────────
  {
    slug: 'hikvision-analog-5mp-bullet',
    nameKa: 'Hikvision 5MP ანალოგი კამერა (Bullet)',
    price: 180, categorySlug: 'analog-cameras',
    specs: [
      spec('ბრენდი', 'Hikvision'),
      spec('რეზოლუცია', '5MP'),
      spec('MicroSD', 'არა'),
      spec('დაცვის პროტოკოლი', 'IP67'),
      spec('შიდა გამოყენება / გარე გამოყენება', 'გარე'),
      spec('კამერის კორპუსის ტიპი', 'Bullet'),
      spec('ლინზის ზომა', '3.6mm'),
    ],
  },
  {
    slug: 'camel-analog-2mp-dome',
    nameKa: 'Camel 2MP ანალოგი კამერა (Dome)',
    price: 120, inStock: false, categorySlug: 'analog-cameras',
    specs: [
      spec('ბრენდი', 'Camel'),
      spec('რეზოლუცია', '2MP'),
      spec('კამერის კორპუსის ტიპი', 'Dome'),
      spec('ლინზის ზომა', '2.8mm'),
    ],
  },

  // ── Camera Accessories ───────────────────────────
  {
    slug: 'camera-bracket-wall-mount',
    nameKa: 'კედლის სამაგრი კამერისთვის',
    price: 25, categorySlug: 'camera-accessories',
    specs: [spec('ბრენდი', 'OEM')],
  },

  // ── Camera Consumables ───────────────────────────
  {
    slug: 'utp-cable-cat6-305m',
    nameKa: 'UTP CAT6 კაბელი 305მ',
    price: 180, categorySlug: 'camera-consumables',
    specs: [spec('ბრენდი', 'OEM')],
  },

  // ── NVR Recorders ────────────────────────────────
  {
    slug: 'hikvision-nvr-8ch-poe',
    nameKa: 'Hikvision NVR 8 არხიანი PoE',
    price: 650, isFeatured: true, categorySlug: 'nvr-recorders',
    specs: [
      spec('ბრენდი', 'Hikvision'),
      spec('არხების რაოდენობა', '8 არხიანი'),
      spec('PoE ინტერფეისი', 'PoE'),
      spec('HDD რაოდენობა', '2'),
    ],
  },
  {
    slug: 'hiwatch-nvr-16ch-non-poe',
    nameKa: 'Hiwatch NVR 16 არხიანი Non-PoE',
    price: 480, categorySlug: 'nvr-recorders',
    specs: [
      spec('ბრენდი', 'Hiwatch'),
      spec('არხების რაოდენობა', '16 არხიანი'),
      spec('PoE ინტერფეისი', 'Non-PoE'),
      spec('HDD რაოდენობა', '1'),
    ],
  },

  // ── DVR Recorders ────────────────────────────────
  {
    slug: 'cpplus-dvr-8ch',
    nameKa: 'CPPLUS DVR 8 არხიანი',
    price: 320, categorySlug: 'dvr-recorders',
    specs: [
      spec('ბრენდი', 'CPPLUS'),
      spec('არხების რაოდენობა', '8 არხიანი'),
      spec('HDD რაოდენობა', '1'),
    ],
  },
  {
    slug: 'ruichi-dvr-16ch',
    nameKa: 'RUICHI DVR 16 არხიანი',
    price: 420, categorySlug: 'dvr-recorders',
    specs: [
      spec('ბრენდი', 'RUICHI'),
      spec('არხების რაოდენობა', '16 არხიანი'),
      spec('HDD რაოდენობა', '2'),
    ],
  },

  // ── Recorder Accessories ─────────────────────────
  {
    slug: 'hdd-wd-purple-2tb',
    nameKa: 'WD Purple 2TB HDD',
    price: 220, categorySlug: 'recorder-accessories',
    specs: [spec('ბრენდი', 'OEM')],
  },

  // ── Kits ─────────────────────────────────────────
  {
    slug: 'kit-4-cameras-nvr-2tb',
    nameKa: 'კომპლექტი: 4 IP კამერა + NVR + 2TB',
    price: 1450, originalPrice: 1700, isFeatured: true, categorySlug: 'kits',
    specs: [spec('ბრენდი', 'Hikvision')],
  },
  {
    slug: 'kit-8-cameras-nvr-4tb',
    nameKa: 'კომპლექტი: 8 IP კამერა + NVR + 4TB',
    price: 2890, isFeatured: true, categorySlug: 'kits',
    specs: [spec('ბრენდი', 'Hiwatch')],
  },

  // ── Video Registrators ───────────────────────────
  {
    slug: 'dashcam-128gb-hikvision',
    nameKa: 'Hikvision ვიდეო-რეგისტრატორი 128GB',
    price: 240, categorySlug: 'video-registrators',
    specs: [
      spec('ბრენდი', 'Hikvision'),
      spec('მოცულობა', '128GB'),
    ],
  },
  {
    slug: 'dashcam-256gb-oossxx',
    nameKa: 'OOSSXX ვიდეო-რეგისტრატორი 256GB',
    price: 320, categorySlug: 'video-registrators',
    specs: [
      spec('ბრენდი', 'OOSSXX'),
      spec('მოცულობა', '256GB'),
    ],
  },

  // ── Accessories (root) ───────────────────────────
  {
    slug: 'poe-switch-8-port',
    nameKa: 'PoE სვიჩი 8 პორტიანი',
    price: 290, categorySlug: 'accessories',
    specs: [spec('ბრენდი', 'Hiwatch')],
  },
  {
    slug: 'power-supply-12v-10a',
    nameKa: 'კვების ბლოკი 12V 10A',
    price: 65, categorySlug: 'accessories',
    specs: [spec('ბრენდი', 'OEM')],
  },
];

async function main(): Promise<void> {
  console.log('=== Seeding demo products ===\n');

  const allCats = await prisma.category.findMany({ select: { id: true, slug: true } });
  if (allCats.length === 0) {
    throw new Error('No categories in DB. Run `npm run prisma:seed` first.');
  }
  const catBySlug = new Map(allCats.map((c) => [c.slug, c.id]));

  console.log('Clearing existing products...');
  await prisma.productSpec.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});

  let created = 0;
  let skipped = 0;
  for (const p of DEMO_PRODUCTS) {
    const categoryId = catBySlug.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`  [SKIP] unknown category "${p.categorySlug}" for ${p.slug}`);
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        slug: p.slug,
        nameKa: p.nameKa,
        nameRu: '',
        nameEn: '',
        price: p.price,
        originalPrice: p.originalPrice ?? null,
        currency: 'GEL',
        isActive: true,
        isFeatured: p.isFeatured ?? false,
        inStock: p.inStock ?? true,
        images: [],
        categories: { create: [{ categoryId }] },
        specs: {
          create: p.specs.map((s) => ({
            keyKa: s.key.ka,
            keyRu: s.key.ru ?? '',
            keyEn: s.key.en ?? '',
            value: s.value,
          })),
        },
      },
    });
    created++;
  }

  // Distinct-brand sanity check (so the brand filter has variety)
  const distinctBrands = await prisma.productSpec.findMany({
    where: { keyKa: 'ბრენდი' },
    distinct: ['value'],
    select: { value: true },
  });

  console.log(`\nCreated: ${created} products (skipped: ${skipped})`);
  console.log(`Distinct brands in DB: ${distinctBrands.map((b) => b.value).join(', ')}`);
  console.log(`Possible brand options from spec doc: ${BRANDS.join(', ')}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
