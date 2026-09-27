import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.js";
import es from "./locales/es.js";
import pt from "./locales/pt.js";
import ja from "./locales/ja.js";

i18n
  .use(LanguageDetector) // reads navigator.language, then localStorage on repeat visits
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      ja: { translation: ja },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es", "pt", "ja"],
    interpolation: {
      escapeValue: false, // React already escapes output
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;