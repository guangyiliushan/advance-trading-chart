import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    returnObjects: true,
    fallbackLng: "zh_CN", // Language to fallback to if the selected is not configured
    debug: false, // To enable us see errors
    lng: "zh_CN", // Default language as simplified Chinese
    ns: ["common"],
    defaultNS: "common",
    backend: {
      // public/ is the Vite static dir, so this resolves to /locales/{lng}/common.json
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
