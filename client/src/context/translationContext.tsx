import { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import fr from "../locales/fr.json";

type Lang = "en" | "fr";

const translations: Record<Lang, any> = { en, fr };

const TranslationContext = createContext<any>(null);

export const TranslationProvider = ({ children }: any) => {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: string) => translations[lang][key] ?? key;

  const toggleLang = () => setLang((prev) => (prev === "en" ? "fr" : "en"));

  return (
    <TranslationContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);