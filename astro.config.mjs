import sitemap from '@astrojs/sitemap';
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.manoga.digital',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'da'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  output: 'static',
});
