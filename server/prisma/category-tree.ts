/**
 * Canonical category tree + catalog config.
 *
 * Source of truth for the surveillance shop's hierarchical categories
 * and per-category filter sets. Consumed by:
 *   - prisma/seed.ts          (fresh local seed)
 *   - prisma/scripts/replace-categories.ts (one-time prod migration)
 *
 * Mirror this with the spec doc `კატეგორიები.rtf.doc`.
 */

export interface CategorySeed {
  slug: string;
  parentSlug: string | null;
  nameKa: string;
  nameRu: string;
  nameEn: string;
  sortOrder: number;
}

export const CATEGORY_TREE: CategorySeed[] = [
  // Root
  { slug: 'video-surveillance', parentSlug: null, nameKa: 'ვიდეო სამეთვალყურეო', nameRu: 'Видеонаблюдение', nameEn: 'Video Surveillance', sortOrder: 0 },

  // Mid-level (under video-surveillance)
  { slug: 'cameras', parentSlug: 'video-surveillance', nameKa: 'კამერები', nameRu: 'Камеры', nameEn: 'Cameras', sortOrder: 1 },
  { slug: 'recorders', parentSlug: 'video-surveillance', nameKa: 'ჩამწერები', nameRu: 'Видеорегистраторы', nameEn: 'Recorders', sortOrder: 2 },
  { slug: 'kits', parentSlug: 'video-surveillance', nameKa: 'კომპლექტები', nameRu: 'Комплекты', nameEn: 'Kits', sortOrder: 3 },
  { slug: 'video-registrators', parentSlug: 'video-surveillance', nameKa: 'ვიდეო-რეგისტრატორები', nameRu: 'Видео-регистраторы', nameEn: 'Video Registrators', sortOrder: 4 },
  { slug: 'accessories', parentSlug: 'video-surveillance', nameKa: 'აქსესუარები / სახარჯი მასალები', nameRu: 'Аксессуары / Расходные материалы', nameEn: 'Accessories / Consumables', sortOrder: 5 },

  // Cameras children
  { slug: 'ip-cameras', parentSlug: 'cameras', nameKa: 'IP კამერები', nameRu: 'IP-камеры', nameEn: 'IP Cameras', sortOrder: 0 },
  { slug: 'analog-cameras', parentSlug: 'cameras', nameKa: 'ანალოგი კამერები', nameRu: 'Аналоговые камеры', nameEn: 'Analog Cameras', sortOrder: 1 },
  { slug: 'camera-accessories', parentSlug: 'cameras', nameKa: 'კამერის აქსესუარები', nameRu: 'Аксессуары для камер', nameEn: 'Camera Accessories', sortOrder: 2 },
  { slug: 'camera-consumables', parentSlug: 'cameras', nameKa: 'სახარჯი მასალები', nameRu: 'Расходные материалы', nameEn: 'Consumables', sortOrder: 3 },

  // Recorders children
  { slug: 'nvr-recorders', parentSlug: 'recorders', nameKa: 'NVR ჩამწერები', nameRu: 'NVR-регистраторы', nameEn: 'NVR Recorders', sortOrder: 0 },
  { slug: 'dvr-recorders', parentSlug: 'recorders', nameKa: 'DVR ჩამწერები', nameRu: 'DVR-регистраторы', nameEn: 'DVR Recorders', sortOrder: 1 },
  { slug: 'recorder-accessories', parentSlug: 'recorders', nameKa: 'აქსესუარები', nameRu: 'Аксессуары', nameEn: 'Accessories', sortOrder: 2 },
];

/**
 * Remap from old (pre-spec) slugs to new ones, used by the prod migration
 * to preserve product→category links when categories are replaced.
 */
export const OLD_TO_NEW_SLUG: Record<string, string | null> = {
  cameras: 'cameras',
  'nvr-kits': 'kits',
  accessories: 'accessories',
  storage: 'video-registrators',
  services: 'accessories',
};

// ── Catalog Config (tree + filters) ─────────────────────────────────

interface CatalogLabel { ka: string; ru: string; en: string; }

export interface CatalogCategoryNode {
  id: string;
  parentCategory: string | null;
  label: CatalogLabel;
  children?: CatalogCategoryNode[];
}

export interface CatalogFilterConfig {
  id: string;
  specKaKey: string;
  label: CatalogLabel;
  priority: number;
  defaultExpanded?: boolean;
}

function buildCatalogTree(): CatalogCategoryNode[] {
  const bySlug = new Map<string, CatalogCategoryNode>();
  const roots: CatalogCategoryNode[] = [];

  for (const c of CATEGORY_TREE) {
    bySlug.set(c.slug, {
      id: c.slug,
      parentCategory: c.parentSlug,
      label: { ka: c.nameKa, ru: c.nameRu, en: c.nameEn },
      children: [],
    });
  }
  for (const c of CATEGORY_TREE) {
    const node = bySlug.get(c.slug)!;
    if (c.parentSlug === null) {
      roots.push(node);
    } else {
      const parent = bySlug.get(c.parentSlug);
      if (parent) parent.children!.push(node);
    }
  }
  // Drop empty children arrays so the JSON stays clean
  const stripEmpty = (n: CatalogCategoryNode): CatalogCategoryNode => {
    if (n.children && n.children.length === 0) {
      const { children: _children, ...rest } = n;
      return rest;
    }
    return { ...n, children: n.children!.map(stripEmpty) };
  };
  return roots.map(stripEmpty);
}

export const CATALOG_CATEGORIES_TREE: CatalogCategoryNode[] = buildCatalogTree();

// Filter primitives — defined once and reused across categories
const F = {
  brand: { id: 'brand', specKaKey: 'ბრენდი', label: { ka: 'ბრენდი', ru: 'Бренд', en: 'Brand' }, priority: 10, defaultExpanded: true },
  stock: { id: 'stock', specKaKey: 'მარაგი', label: { ka: 'მარაგი', ru: 'Наличие', en: 'Stock' }, priority: 20, defaultExpanded: true },
  price: { id: 'price', specKaKey: 'ფასი', label: { ka: 'ფასი', ru: 'Цена', en: 'Price' }, priority: 30, defaultExpanded: true },
  resolution: { id: 'resolution', specKaKey: 'რეზოლუცია', label: { ka: 'რეზოლუცია', ru: 'Разрешение', en: 'Resolution' }, priority: 40 },
  connectionType: { id: 'connection-type', specKaKey: 'კავშირის ტიპი', label: { ka: 'კავშირის ტიპი', ru: 'Тип подключения', en: 'Connection Type' }, priority: 50 },
  microSD: { id: 'micro-sd', specKaKey: 'MicroSD', label: { ka: 'MicroSD', ru: 'MicroSD', en: 'MicroSD' }, priority: 60 },
  ipProtection: { id: 'ip-protection', specKaKey: 'დაცვის პროტოკოლი', label: { ka: 'დაცვის პროტოკოლი', ru: 'Защита', en: 'IP Rating' }, priority: 70 },
  indoorOutdoor: { id: 'indoor-outdoor', specKaKey: 'შიდა გამოყენება / გარე გამოყენება', label: { ka: 'შიდა/გარე', ru: 'Внутр./Внешн.', en: 'Indoor/Outdoor' }, priority: 80 },
  solarPanel: { id: 'solar-panel', specKaKey: 'მზის პანელით', label: { ka: 'მზის პანელით', ru: 'Солнечная панель', en: 'Solar Panel' }, priority: 90 },
  bodyType: { id: 'body-type', specKaKey: 'კამერის კორპუსის ტიპი', label: { ka: 'კორპუსის ტიპი', ru: 'Тип корпуса', en: 'Body Type' }, priority: 100 },
  lensSize: { id: 'lens-size', specKaKey: 'ლინზის ზომა', label: { ka: 'ლინზის ზომა', ru: 'Размер линзы', en: 'Lens Size' }, priority: 110 },
  audio: { id: 'audio', specKaKey: 'აუდიო', label: { ka: 'აუდიო', ru: 'Аудио', en: 'Audio' }, priority: 120 },
  hddCount: { id: 'hdd-count', specKaKey: 'HDD რაოდენობა', label: { ka: 'HDD რაოდენობა', ru: 'Кол-во HDD', en: 'HDD Count' }, priority: 50 },
  poeInterface: { id: 'poe-interface', specKaKey: 'PoE ინტერფეისი', label: { ka: 'PoE ინტერფეისი', ru: 'PoE', en: 'PoE Interface' }, priority: 60 },
  channelCount: { id: 'channel-count', specKaKey: 'არხების რაოდენობა', label: { ka: 'არხების რაოდენობა', ru: 'Кол-во каналов', en: 'Channel Count' }, priority: 70 },
  capacity: { id: 'capacity', specKaKey: 'მოცულობა', label: { ka: 'მოცულობა', ru: 'Объём', en: 'Capacity' }, priority: 50 },
} satisfies Record<string, CatalogFilterConfig>;

export const CATALOG_FILTERS: Record<string, CatalogFilterConfig[]> = {
  'video-surveillance': [F.brand, F.price, F.stock, F.resolution],

  cameras: [F.brand, F.stock, F.connectionType, F.microSD, F.ipProtection, F.indoorOutdoor, F.resolution, F.solarPanel, F.bodyType, F.lensSize, F.audio],
  'ip-cameras': [F.brand, F.stock, F.microSD, F.ipProtection, F.indoorOutdoor, F.resolution, F.solarPanel, F.bodyType, F.lensSize, F.audio],
  'analog-cameras': [F.brand, F.stock, F.microSD, F.ipProtection, F.indoorOutdoor, F.resolution, F.solarPanel, F.bodyType, F.lensSize, F.audio],
  'camera-accessories': [F.stock],
  'camera-consumables': [F.stock],

  recorders: [F.brand, F.hddCount, F.stock, F.poeInterface, F.channelCount],
  'nvr-recorders': [F.brand, F.hddCount, F.stock, F.poeInterface, F.channelCount],
  'dvr-recorders': [F.brand, F.hddCount, F.stock, F.channelCount],
  'recorder-accessories': [F.stock],

  kits: [F.brand, F.stock],
  'video-registrators': [F.stock, F.brand, F.capacity],
  accessories: [F.brand, F.stock],
};
