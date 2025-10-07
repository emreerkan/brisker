export const availableLanguages = [
  { code: 'en', name: 'English', rtl: false },
  { code: 'tr', name: 'Türkçe', rtl: false },
  { code: 'nl', name: 'Nederlands', rtl: false },
  { code: 'sv', name: 'Svenska', rtl: false },
  { code: 'de', name: 'Deutsch', rtl: false },
  { code: 'fr', name: 'Français', rtl: false },
  { code: 'fa', name: 'فارسی', rtl: true },
] as const;

export const SUPPORTED_LANGUAGE_CODES = availableLanguages.map(lang => lang.code) as string[];

export const DEFAULT_LANGUAGE = 'en';
