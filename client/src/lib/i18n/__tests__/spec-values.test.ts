import { describe, it, expect } from 'vitest';

import { localizeSpecValue } from '../spec-values';

const GEORGIAN = /[Ⴀ-ჿ]/;

// Every Georgian spec value that production products carried when this helper was written (plus the Georgian
// options of the catalog config). If a value here ever stays Georgian in ru/en, the helper has a gap.
const KNOWN_GEORGIAN_VALUES = [
  'გარე', 'შიდა', 'კი', 'არა', 'ლან კაბელით (PoE)', 'WIFI + ლან კაბელით (12V)', 'ანალოგური',
  'ჩაშენებული მიკროფონით', 'ომრხრივი აუდიო კავშირი', 'მიკროფონის ინტერფეისი',
  '4 არხიანი', '8 არხიანი', '10 არხიანი', '12 არხიანი', '16 არხიანი', '24 არხიანი', '32 არხიანი', '64 არხიანი', '128 არხიანი',
  '3 მპ', '4 მპ', '5 მპ', '6 მპ', '3.6მმ - 90მმ',
];

describe('localizeSpecValue', () => {
  it('should return the stored value unchanged for Georgian', () => {
    for (const value of KNOWN_GEORGIAN_VALUES) {
      expect(localizeSpecValue(value, 'ka')).toBe(value);
    }
  });

  it('should translate every known Georgian value for Russian and English', () => {
    for (const locale of ['ru', 'en'] as const) {
      for (const value of KNOWN_GEORGIAN_VALUES) {
        const label = localizeSpecValue(value, locale);
        expect(label, `${locale}: ${value}`).not.toMatch(GEORGIAN);
        expect(label.length).toBeGreaterThan(0);
      }
    }
  });

  it('should give specific labels for the common values', () => {
    expect(localizeSpecValue('კი', 'ru')).toBe('Да');
    expect(localizeSpecValue('გარე', 'en')).toBe('Outdoor');
    expect(localizeSpecValue('ლან კაბელით (PoE)', 'en')).toBe('LAN cable (PoE)');
  });

  it('should use correct Russian plural forms for channel counts', () => {
    expect(localizeSpecValue('1 არხიანი', 'ru')).toBe('1 канал');
    expect(localizeSpecValue('4 არხიანი', 'ru')).toBe('4 канала');
    expect(localizeSpecValue('8 არხიანი', 'ru')).toBe('8 каналов');
    expect(localizeSpecValue('11 არხიანი', 'ru')).toBe('11 каналов');
    expect(localizeSpecValue('32 არხიანი', 'ru')).toBe('32 канала');
    expect(localizeSpecValue('128 არხიანი', 'ru')).toBe('128 каналов');
  });

  it('should localize English channel counts and megapixels', () => {
    expect(localizeSpecValue('1 არხიანი', 'en')).toBe('1 channel');
    expect(localizeSpecValue('16 არხიანი', 'en')).toBe('16 channels');
    expect(localizeSpecValue('4 მპ', 'en')).toBe('4 MP');
    expect(localizeSpecValue('4 მპ', 'ru')).toBe('4 МП');
  });

  it('should localize only the unit inside lens ranges', () => {
    expect(localizeSpecValue('3.6მმ - 90მმ', 'en')).toBe('3.6mm - 90mm');
    expect(localizeSpecValue('3.6მმ - 90მმ', 'ru')).toBe('3.6мм - 90мм');
  });

  it('should leave language-neutral and unknown values untouched', () => {
    for (const locale of ['ru', 'en'] as const) {
      expect(localizeSpecValue('Uniview', locale)).toBe('Uniview');
      expect(localizeSpecValue('IP67', locale)).toBe('IP67');
      expect(localizeSpecValue('6MP', locale)).toBe('6MP');
      expect(localizeSpecValue('რაღაც ახალი', locale)).toBe('რაღაც ახალი');
    }
  });
});
