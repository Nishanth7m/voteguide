import React from "react";
import { useApp } from "../hooks/useApp";

const languages = [
  { code: "en", name: "English", label: "EN" },
  { code: "hi", name: "Hindi", label: "हिं" },
  { code: "ta", name: "Tamil", label: "தமி" },
  { code: "es", name: "Spanish", label: "ES" },
  { code: "fr", name: "French", label: "FR" }
];

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useApp();

  return (
    <nav className="flex items-center gap-1" aria-label="Select language">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code as any)}
          aria-label={`Switch to ${lang.name}`}
          aria-current={language === lang.code ? "true" : "false"}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${language === lang.code 
              ? "bg-[#1a56db] text-white shadow-sm" 
              : "text-[#6b7280] hover:bg-gray-100 hover:text-[#111827]"
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </nav>
  );
};

export default LanguageToggle;
