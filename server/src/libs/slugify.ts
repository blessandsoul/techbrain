/**
 * Slug generation utility with Georgian transliteration and unique slug resolution.
 */

const KA_TO_LATIN: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'f',
  'ქ': 'q', 'ღ': 'gh', 'ყ': 'k', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h',
};

/**
 * Convert text to a URL-safe slug.
 * Transliterates Georgian characters to Latin, lowercases, strips non-alphanumeric.
 */
export function slugify(text: string): string {
  return text
    .split('')
    .map((ch) => KA_TO_LATIN[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 250);
}

/**
 * Generate a unique slug by appending -2, -3, etc. if the base slug is taken.
 *
 * @param text - Source text (title/name) to slugify
 * @param existsFn - Async function that checks if a slug already exists in the DB
 * @returns A unique slug string
 */
export async function generateUniqueSlug(
  text: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  let base = slugify(text);

  // Fallback if text produces an empty slug (e.g. only special characters)
  if (!base) {
    base = `item-${Date.now()}`;
  }

  // Check if base slug is available
  const baseExists = await existsFn(base);
  if (!baseExists) {
    return base;
  }

  // Append incrementing suffix until unique
  let counter = 2;
  while (counter <= 100) {
    const candidate = `${base}-${counter}`;
    const candidateExists = await existsFn(candidate);
    if (!candidateExists) {
      return candidate;
    }
    counter++;
  }

  // Extremely unlikely fallback — append timestamp
  return `${base}-${Date.now()}`;
}
