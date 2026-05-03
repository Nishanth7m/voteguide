import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Language = "en" | "hi" | "ta" | "es" | "fr";
type TextSize = "normal" | "large" | "x-large";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (val: boolean) => void;
  translations: Record<string, string>;
  translateUI: (texts: string[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>((localStorage.getItem("lang") as Language) || "en");
  const [textSize, setTextSize] = useState<TextSize>((localStorage.getItem("textSize") as TextSize) || "normal");
  const [highContrast, setHighContrast] = useState<boolean>(localStorage.getItem("highContrast") === "true");
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(localStorage.getItem("animations") !== "false");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem("lang", language);
    localStorage.setItem("textSize", textSize);
    localStorage.setItem("highContrast", String(highContrast));
    localStorage.setItem("animations", String(animationsEnabled));

    // Apply accessibility classes to body
    document.body.classList.remove("large-text", "x-large-text", "high-contrast");
    if (textSize === "large") document.body.classList.add("large-text");
    if (textSize === "x-large") document.body.classList.add("x-large-text");
    if (highContrast) document.body.classList.add("high-contrast");
  }, [language, textSize, highContrast, animationsEnabled]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const translateUI = React.useCallback(async (texts: string[]) => {
    if (language === "en") return;
    
    try {
      const targetLangName = language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : language === "es" ? "Spanish" : language === "fr" ? "French" : "English";
      
      const prompt = `Translate the following array of English strings to ${targetLangName}. 
      Return the translations as a JSON array of strings in the exact same order.
      IMPORTANT: Only return the JSON array, nothing else.
      
      Strings: ${JSON.stringify(texts)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      let translatedTexts: string[] = [];
      try {
        const textStr = response.text || "[]";
        translatedTexts = JSON.parse(textStr);
      } catch (e) {
        console.error("Failed to parse AI translation JSON", e);
        return;
      }

      const newTranslations: Record<string, string> = {};
      texts.forEach((text, i) => {
        if (translatedTexts[i]) {
          newTranslations[`${language}_${text}`] = translatedTexts[i];
        }
      });
      setTranslations(prev => ({ ...prev, ...newTranslations }));
    } catch (err) {
      console.error("Auto-translation failed", err);
    }
  }, [language]);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      textSize, setTextSize,
      highContrast, setHighContrast,
      animationsEnabled, setAnimationsEnabled,
      translations, translateUI
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

/**
 * Hook to handle T(ext) translation with fallback to English
 */
export const useTranslation = () => {
  const { language, translations } = useApp();
  
  const T = React.useCallback((text: string) => {
    if (language === "en") return text;
    return translations[`${language}_${text}`] || text;
  }, [language, translations]);
  
  return { T, language };
};

/**
 * Hook to automatically register and translate a list of strings
 */
export const useAutoTranslate = (texts: string[]) => {
  const { translateUI, language, translations } = useApp();
  
  useEffect(() => {
    if (language === "en") return;
    
    // Only translate what hasn't been translated yet
    const toTranslate = texts.filter(t => t && !translations[`${language}_${t}`]);
    
    if (toTranslate.length > 0) {
      translateUI(toTranslate);
    }
  }, [language, JSON.stringify(texts), translateUI]); // Added translateUI
};
