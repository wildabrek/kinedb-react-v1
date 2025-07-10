"use client"

import { useLanguage } from "@/contexts/language-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const { setLanguage, language, translate: t } = useLanguage();
  const { toast } = useToast();

  const languages = [
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
  ];

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    const selectedLanguage = languages.find((lang) => lang.code === code)?.label || code;
    toast({
      title: t("Language Changed"),
      description: t("Language has been changed to {{language}}", {
        language: selectedLanguage,
      }).replace("{{language}}", selectedLanguage),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("Select language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
            <Check className={`mr-2 h-4 w-4 ${language === lang.code ? "opacity-100" : "opacity-0"}`} />
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
