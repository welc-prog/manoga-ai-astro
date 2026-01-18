import en from '../locales/en.json';
import da from '../locales/da.json';

const translations: Record<string, Record<string, any>> = {
  en,
  da
};

export function t(key: string, lang: string = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found in current language
      value = translations['en'];
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function getTranslations(lang: string = 'en') {
  return translations[lang] || translations['en'];
}
