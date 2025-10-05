export const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'nl', name: 'Dutch' },
] as const;

export const SUPPORTED_LANGUAGE_CODES = availableLanguages.map(lang => lang.code) as string[];

export const DEFAULT_LANGUAGE = 'en';
