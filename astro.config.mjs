// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://manoga.digital',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  output: 'static'
});
