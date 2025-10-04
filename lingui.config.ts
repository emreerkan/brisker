import { defineConfig } from '@lingui/cli';

export default defineConfig({
  locales: ['en', 'tr'],
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
