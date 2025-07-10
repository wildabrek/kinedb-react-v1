import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/translations/en.json";
import es from "@/translations/es.json";
import fr from "@/translations/fr.json";
import de from "@/translations/de.json";
import tr from "@/translations/tr.json";

// Çeviri dosyalarını i18next'e ekle
const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  tr: { translation: tr },
};

i18n
  .use(initReactI18next) // React için i18next entegrasyonu
  .init({
    resources, // Çeviri dosyaları
    lng: "en", // Varsayılan dil
    fallbackLng: "en", // Eğer çeviri yoksa İngilizce kullan
    interpolation: { escapeValue: false }, // React için gereksiz escape işlemini kapat
  });

export default i18n;
