// @ts-check
import { defineConfig } from 'astro/config';
import astroI18next from 'astro-i18next';

export default defineConfig({
  site: 'https://manoga.digital',
  integrations: [
    astroI18next()
  ],
  output: 'static'
});
