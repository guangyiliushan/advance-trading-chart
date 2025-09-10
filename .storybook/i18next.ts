import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const ns = ['common'];
const supportedLngs = ['en', 'zh_CN'];

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    // debug: true,
    lng: 'zh_CN',
    fallbackLng: 'zh_CN',
    defaultNS: 'common',
    ns,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    supportedLngs,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;