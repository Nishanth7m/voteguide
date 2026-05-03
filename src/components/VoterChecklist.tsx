import React, { useState } from "react";
import { Check, Info, Download, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation, useAutoTranslate } from "../hooks/useApp";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const checklistItems = [
  "Check voter registration status",
  "Confirm polling location",
  "Review candidates on your ballot",
  "Prepare valid photo ID",
  "Note polling hours",
  "Arrange transportation",
  "Check early voting options",
  "Review any ballot measures",
  "Bring required documents",
  "Share voting info with family"
];

const VoterChecklist: React.FC = () => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [readinessSummary, setReadinessSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { T, language } = useTranslation();

  useAutoTranslate([
    "Voter Checklist",
    "Be 100% prepared to cast your vote.",
    "Complete",
    "Download My Personalized Checklist",
    "Ready to Vote?",
    "Calculate Readiness Score",
    "Based on your checklist, here is your readiness summary:",
    "Voter Readiness Score",
    "Preparing your summary...",
    ...checklistItems
  ]);

  const toggleItem = (index: number) => {
    setChecked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progressPercent = (completedCount / checklistItems.length) * 100;

  const generateReadiness = async () => {
    setIsGenerating(true);
    try {
      const completedItems = checklistItems.filter((_, i) => checked[i]);
      const pendingItems = checklistItems.filter((_, i) => !checked[i]);
      const targetLang = language || "English";

      const prompt = `
        Analyze a voter's readiness based on their completed and pending checklist items.
        Completed: ${completedItems.join(", ")}
        Pending: ${pendingItems.join(", ")}
        
        Provide a very short, punchy (max 50 words) motivational summary of their readiness and one key advice.
        Output strictly in ${targetLang}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      setReadinessSummary(response.text || "You are making great progress towards being a ready voter!");
    } catch (e) {
      setReadinessSummary("You're making great progress! Keep checking off items to be fully prepared.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="voter-checklist" className="py-16 px-4 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">{T("Voter Checklist")}</h2>
            <p className="text-gray-600">{T("Be 100% prepared to cast your vote.")}</p>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor" strokeWidth="8"
                  fill="transparent" className="text-gray-100"
                />
                <motion.circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor" strokeWidth="8"
                  fill="transparent" className="text-[#0e9f6e]"
                  strokeDasharray={2 * Math.PI * 56}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 56) * (1 - progressPercent / 100) }}
                  transition={{ duration: 1 }}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{completedCount} / {checklistItems.length}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500">{T("Complete")}</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {checklistItems.map((item, index) => (
            <div 
              key={index}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none
                ${checked[index] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}
              `}
              onClick={() => toggleItem(index)}
            >
              <div className={`
                w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                ${checked[index] ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}
              `}>
                {checked[index] && <Check size={14} />}
              </div>
              <span className={`text-sm font-medium ${checked[index] ? 'text-green-900' : 'text-gray-700'}`}>
                {T(item)}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {(completedCount > 0 || readinessSummary) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-10 p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={18} />
                    <span className="tech-label text-white/70">{T("Voter Readiness Score")}</span>
                  </div>
                  <span className="text-2xl font-black">{Math.round(progressPercent)}%</span>
                </div>
                
                {readinessSummary ? (
                  <p className="text-gray-300 text-sm leading-relaxed italic">"{readinessSummary}"</p>
                ) : (
                  <button 
                    onClick={generateReadiness}
                    disabled={isGenerating}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : T("Calculate Readiness Score")}
                  </button>
                )}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#111827] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-black/20"
          >
            <Download size={20} />
            {T("Download My Personalized Checklist")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default VoterChecklist;
