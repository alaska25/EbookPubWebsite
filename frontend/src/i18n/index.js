import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English stays bundled: it's the fallback, so it must always be available.
import en from "./locales/en.js";

// The rest become separate chunks, downloaded only when needed.
const loaders = {
  es: () => import("./locales/es.js"),
  pt: () => import("./locales/pt.js"),
  ja: () => import("./locales/ja.js"),
};

// Returns true if it loaded a bundle, false if nothing was needed.
async function ensureLanguage(lng) {
  const base = lng?.split("-")[0];
  if (!loaders[base] || i18n.hasResourceBundle(base, "translation")) return false;
  const mod = await loaders[base]();
  i18n.addResourceBundle(base, "translation", mod.default, true, true);
  return true;
}

// Runs for the detected language on startup and for every later switch.
// If the bundle wasn't loaded yet, fetch it, then re-apply the language so
// components re-render with the real translations.
i18n.on("languageChanged", async (lng) => {
  if (await ensureLanguage(lng)) i18n.changeLanguage(lng);
});

i18n
  .use(LanguageDetector) // reads localStorage, then navigator.language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
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