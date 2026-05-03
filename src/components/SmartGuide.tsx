import React, { useState } from "react";
import { Sparkles, MapPin, Search, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { useTranslation, useAutoTranslate } from "../hooks/useApp";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function SmartGuide() {
  const [location, setLocation] = useState("");
  const [guide, setGuide] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { T, language } = useTranslation();

  useAutoTranslate([
    "AI Intelligence",
    "Get Your Personalized",
    "Voter Blueprint",
    "Voting laws differ by location. Enter your city or state, and our AI will summarize the specific deadlines and IDs you need to cast your vote with confidence.",
    "Enter your City, State or Zip...",
    "Generating...",
    "Generate",
    "Extracting rules for",
    "Guide Unavailable",
    "Ready to assist you.",
    "Enter your location to see state-specific requirements."
  ]);

  // Simple cache to avoid redundant AI calls (Efficiency)
  const [cache, setCache] = useState<Record<string, string>>({});

  const fetchGuide = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!location.trim()) return;

    const cacheKey = `${language}_${location.toLowerCase()}`;
    if (cache[cacheKey]) {
       setGuide(cache[cacheKey]);
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const targetLang = language || "English";
      const promptText = `
        You are an expert voter registration guide.
        Provide a concise, localized voter registration and ID guide for: ${location}.
        The primary topic is: voter registration and ID requirements.
        
        Requirements:
        - Output the response strictly in ${targetLang}.
        - Use Markdown for formatting (bullet points, bold text).
        - Include key deadlines if applicable to the upcoming 2026 Tamil Nadu/India elections if relevant.
        - Mention what IDs are acceptable (Voter ID, Aadhaar, etc.).
        - Use a clear, encouraging tone.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      });

      const text = response.text || "No guide available for this location.";
      setGuide(text);
      setCache(prev => ({ ...prev, [cacheKey]: text }));
    } catch (err) {
      setError(T("AI was unable to generate a guide for this location. Please try a different city or state."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="smart-guide" className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-blue-500" />
              <span className="tech-label">{T("AI Intelligence")}</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {T("Get Your Personalized")} <span className="text-blue-600">{T("Voter Blueprint")}</span>
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {T("Voting laws differ by location. Enter your city or state, and our AI will summarize the specific deadlines and IDs you need to cast your vote with confidence.")}
            </p>

            <form onSubmit={fetchGuide} className="relative group">
              <input
                type="text"
                placeholder={T("Enter your City, State or Zip...")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-32 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-stroke shadow-sm"
                aria-label="Location for voting guide"
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <button
                type="submit"
                disabled={isLoading || !location.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                {isLoading ? T("Generating...") : T("Generate")}
              </button>
            </form>
          </div>

          <div className="flex-1 w-full">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-200 h-[300px] flex flex-col items-center justify-center text-center"
                >
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                  <p className="text-gray-500 font-medium">{T("Extracting rules for")} {location}...</p>
                </motion.div>
              ) : guide ? (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/5 border border-gray-100 prose prose-blue max-w-none h-fit"
                >
                  <div className="markdown-body text-sm leading-relaxed text-gray-700">
                    <Markdown>{guide}</Markdown>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 rounded-3xl p-8 border border-red-100 flex items-start gap-4"
                >
                  <AlertCircle className="text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">{T("Guide Unavailable")}</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50/50 rounded-3xl p-12 border border-blue-100 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="text-blue-600" size={32} />
                  </div>
                  <p className="text-blue-900 font-bold mb-2">{T("Ready to assist you.")}</p>
                  <p className="text-blue-700 text-sm">{T("Enter your location to see state-specific requirements.")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
