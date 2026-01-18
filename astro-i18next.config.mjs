/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "en",
  locales: ["en", "da"],
  namespaces: ["translation"],
  defaultNamespace: "translation",
  load: ["server", "client"],
  resourcesBasePath: "/locales",
  routes: {
    da: {
      home: "hjem",
    }
  }
};
