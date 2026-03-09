'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

import type React from 'react';

import ka from './locales/ka.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

// ── Types ────────────────────────────────────────────────────────────────────

export type Locale = 'ka' | 'ru' | 'en';

export type TranslationKey = keyof typeof ka;

/** Object shape returned by backend for multi-language fields */
export interface LocalizedField {
  ka: string;
  ru: string;
  en: string;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a static UI key, with optional interpolation */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** Pick the right language from a backend { ka, ru, en } object */
  localized: (field: LocalizedField | string | undefined | null) => string;
  /** Date locale string for Intl formatters */
  dateLocale: string;
}

// ── Dictionaries ─────────────────────────────────────────────────────────────

const dictionaries: Record<Locale, Record<string, string>> = { ka, ru, en };

const DATE_LOCALES: Record<Locale, string> = {
  ka: 'ka-GE',
  ru: 'ru-RU',
  en: 'en-US',
};

// ── Cookie helpers ───────────────────────────────────────────────────────────

const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'ka';
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match?.[1] as Locale | undefined;
  if (value && value in dictionaries) return value;
  return 'ka';
}

function persistLocale(locale: Locale): void {
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// ── Context ──────────────────────────────────────────────────────────────────

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    // Update <html lang> attribute
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let value = dictionaries[locale][key] ?? dictionaries.ka[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [locale],
  );

  const localized = useCallback(
    (field: LocalizedField | string | undefined | null): string => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      return field[locale] || field.ka || field.ru || field.en || '';
    },
    [locale],
  );

  const dateLocale = DATE_LOCALES[locale];

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t, localized, dateLocale }),
    [locale, setLocale, t, localized, dateLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
