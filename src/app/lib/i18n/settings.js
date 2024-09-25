export const languages = ['en', 'zh'];
export const cookieName = 'i18next';
export const fallbackLng = 'en';

export const getOptions = (lng, ns) => ({
  lng,
  fallbackLng,
  ns,
  defaultNS: 'common',
  debug: false,
  interpolation: {
    escapeValue: false, // React already safes from XSS
  },
});
