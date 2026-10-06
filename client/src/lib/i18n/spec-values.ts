import type { Locale } from './LocaleContext';

/**
 * Display labels for product spec VALUES.
 *
 * A spec has per-language KEYS (keyKa/keyRu/keyEn) but a single stored `value` string, and catalog filters match
 * products on that exact string (see products.repo.ts, `specs: { some: { keyKa, value } }`). The stored value is
 * therefore Georgian for the vocabulary below and must never be rewritten. Only what the visitor SEES is
 * localized here, so filters, URLs and the database stay exactly as they are.
 *
 * Rules:
 *  - Georgian shows the stored value unchanged.
 *  - Known values map to a fixed Russian/English label; "{n} არხიანი" (channels) and "{n} მპ" (megapixels)
 *    are handled as patterns because the number varies; "მმ" (mm) inside a value is replaced by the unit.
 *  - Anything unknown is returned as stored, so a value added in the admin later degrades to Georgian
 *    instead of breaking. Add new vocabulary to EXACT (and the test) when the catalog config gains it.
 */

interface Labels {
  ru: string;
  en: string;
}

const EXACT: Record<string, Labels> = {
  'კი': { ru: 'Да', en: 'Yes' },
  'არა': { ru: 'Нет', en: 'No' },
  'გარე': { ru: 'Для улицы', en: 'Outdoor' },
  'შიდა': { ru: 'Для помещений', en: 'Indoor' },
  'ჩაშენებული მიკროფონით': { ru: 'Со встроенным микрофоном', en: 'Built-in microphone' },
  'ომრხრივი აუდიო კავშირი': { ru: 'Двусторонняя аудиосвязь', en: 'Two-way audio' },
  'მიკროფონის ინტერფეისი': { ru: 'Интерфейс для микрофона', en: 'Microphone interface' },
  'ლან კაბელით (PoE)': { ru: 'По LAN-кабелю (PoE)', en: 'LAN cable (PoE)' },
  'WIFI + ლან კაბელით (12V)': { ru: 'Wi-Fi + LAN-кабель (12V)', en: 'Wi-Fi + LAN cable (12V)' },
  'ანალოგური': { ru: 'Аналоговая', en: 'Analog' },
};

const CHANNELS = /^(\d+)\s*არხიანი$/;
const MEGAPIXELS = /^(\d+(?:[.,]\d+)?)\s*მპ$/;

/** Russian plural form for a count: 1 канал, 2-4 канала, 5-20 каналов, 21 канал, 22-24 канала ... */
function pluralRu(n: number, forms: readonly [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function localizeSpecValue(value: string, locale: Locale): string {
  if (locale === 'ka') return value;

  const exact = EXACT[value];
  if (exact) return exact[locale];

  const channels = CHANNELS.exec(value);
  if (channels) {
    const count = Number(channels[1]);
    return locale === 'ru'
      ? `${count} ${pluralRu(count, ['канал', 'канала', 'каналов'])}`
      : `${count} ${count === 1 ? 'channel' : 'channels'}`;
  }

  const megapixels = MEGAPIXELS.exec(value);
  if (megapixels) {
    return `${megapixels[1]} ${locale === 'ru' ? 'МП' : 'MP'}`;
  }

  // Lens ranges such as "3.6მმ - 90მმ": keep the numbers, localize only the unit.
  return value.replace(/მმ/g, locale === 'ru' ? 'мм' : 'mm');
}
