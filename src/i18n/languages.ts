import type { LanguageMeta, Translation } from './types';

interface LocaleModule {
  default: Translation;
  meta: LanguageMeta;
}

const localeModules = import.meta.glob<LocaleModule>('./locales/*.ts', { eager: true });

const translationAccumulator: Record<string, Translation> = {};
const languageAccumulator: LanguageMeta[] = [];

for (const module of Object.values(localeModules)) {
  const { meta, default: translation } = module;
  if (!meta || !meta.code) continue;
  translationAccumulator[meta.code] = translation;
  languageAccumulator.push({ code: meta.code, name: meta.name });
}

languageAccumulator.sort((a, b) => a.name.localeCompare(b.name, 'en'));

export const translations: Record<string, Translation> = Object.freeze({
  ...translationAccumulator,
});

export const availableLanguages: ReadonlyArray<LanguageMeta> = Object.freeze(
  languageAccumulator.map(lang => ({ ...lang })),
);

export const hasTranslation = (code: string): boolean => Boolean(translations[code]);
