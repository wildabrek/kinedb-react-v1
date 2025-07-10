"use client"

import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "tr", name: "Türkçe" },
]

export function LanguageSelector() {
  const { language, setLanguage, translate :t } = useLanguage()
  const { toast } = useToast()

  const handleLanguageChange = (code: string) => {
    setLanguage(code)
    const selectedLanguage = languages.find((lang) => lang.code === code)?.name || code
    toast({
      title: t("Language Changed"),
      description: t("Language has been changed to {{language}}", {
        language: selectedLanguage,
      }),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("Select language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
            <Check className={`mr-2 h-4 w-4 ${language === lang.code ? "opacity-100" : "opacity-0"}`} />
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
