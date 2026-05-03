import React from "react";
import { Type, Moon, Play, Pause, Volume2 } from "lucide-react";
import { useApp, useTranslation, useAutoTranslate } from "../hooks/useApp";

const AccessibilityBar: React.FC = () => {
  const { 
    textSize, setTextSize, 
    highContrast, setHighContrast, 
    animationsEnabled, setAnimationsEnabled 
  } = useApp();
  const { T } = useTranslation();

  useAutoTranslate([
    "Text Size",
    "High Contrast",
    "Animations",
    "On",
    "Off",
    "Accessible Mode Active",
    "Normal",
    "Large",
    "X-Large"
  ]);

  const cycleTextSize = () => {
    if (textSize === "normal") setTextSize("large");
    else if (textSize === "large") setTextSize("x-large");
    else setTextSize("normal");
  };

  const textSizeLabel = textSize.charAt(0).toUpperCase() + textSize.slice(1);

  return (
    <div 
      role="region" 
      aria-label={T("Accessibility controls")}
      className="sticky top-0 z-50 w-full bg-[#111827] text-white py-2 px-4 shadow-md flex flex-wrap gap-4 items-center justify-center text-sm"
    >
      <button
        onClick={cycleTextSize}
        aria-label={`${T("Current text size")}: ${textSize}. ${T("Click to increase.")}`}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
      >
        <Type size={16} />
        <span>{T("Text Size")}: {T(textSizeLabel)}</span>
      </button>

      <button
        onClick={() => setHighContrast(!highContrast)}
        aria-pressed={highContrast}
        aria-label={T("Toggle high contrast mode")}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
      >
        <Moon size={16} className={highContrast ? "fill-current" : ""} />
        <span>{T("High Contrast")}</span>
      </button>

      <button
        onClick={() => setAnimationsEnabled(!animationsEnabled)}
        aria-pressed={!animationsEnabled}
        aria-label={animationsEnabled ? T("Pause all animations") : T("Resume all animations")}
        className="flex items-center gap-2 hover:text-blue-400 transition-colors"
      >
        {animationsEnabled ? <Pause size={16} /> : <Play size={16} />}
        <span>{T("Animations")}: {animationsEnabled ? T("On") : T("Off")}</span>
      </button>

      <div className="flex items-center gap-2">
        <Volume2 size={16} />
        <span className="sr-only">Screen reader mode compatible. Use Tab to navigate.</span>
        <span>{T("Accessible Mode Active")}</span>
      </div>
    </div>
  );
};

export default AccessibilityBar;
