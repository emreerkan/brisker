import { defineConfig } from '@lingui/cli';

export default defineConfig({
  locales: ['en', 'tr', 'nl', 'sv', 'de', 'fr'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
  compileNamespace: 'es',
});
