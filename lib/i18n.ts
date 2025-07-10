import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpApi from "i18next-http-backend"

i18n
  .use(HttpApi) // load translations from public/locales
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n instance to react-i18next
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "tr", "es", "fr", "de"],
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // public klasöründe olacak
    },
    react: {
      useSuspense: false, // SSR uyumlu
    },
  })

export default i18n
