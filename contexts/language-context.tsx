"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

// Import translation files directly
import enTranslations from "./en.json"
import trTranslations from "./tr.json"
import esTranslations from "./es.json"
import frTranslations from "./fr.json"
import deTranslations from "./de.json"

type Language = "en" | "tr" | "es" | "fr" | "de"
type Translations = { [key: string]: string }

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  translate: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const allTranslations: Record<Language, Translations> = {
  en: enTranslations,
  tr: trTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en") // Default to English

  useEffect(() => {
    const storedLang = localStorage.getItem("kinedb_language") as Language
    if (storedLang && allTranslations[storedLang]) {
      setLanguageState(storedLang)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split("-")[0] // e.g., "en-US" -> "en"
      if (Object.keys(allTranslations).includes(browserLanguage)) {
        setLanguageState(browserLanguage as Language)
        localStorage.setItem("kinedb_language", browserLanguage)
      }
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    if (allTranslations[lang]) {
      setLanguageState(lang)
      localStorage.setItem("kinedb_language", lang) // Save to localStorage
    } else {
      console.warn(`Language "${lang}" not supported.`)
    }
  }, [])

  const translate = useCallback(
    (key: string): string => {
      return allTranslations[language][key] || key // Return key if translation not found
    },
    [language],
  )

  return <LanguageContext.Provider value={{ language, setLanguage, translate }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
