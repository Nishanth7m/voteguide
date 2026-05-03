import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserPlus, FileText, Clock, Mail, 
  CheckCircle, BarChart, Award, Flag,
  Volume2, ChevronDown, Check
} from "lucide-react";
import { useApp, useTranslation, useAutoTranslate } from "../hooks/useApp";
import { useTTS } from "../hooks/useTTS";

interface Stage {
  id: string;
  title: string;
  dateRange: string;
  description: string;
  icon: string;
  status: "upcoming" | "current" | "completed";
}

const iconMap: Record<string, any> = {
  "user-plus": UserPlus,
  "file-text": FileText,
  "clock": Clock,
  "mail": Mail,
  "check-circle": CheckCircle,
  "bar-chart": BarChart,
  "award": Award,
  "flag": Flag
};

const ElectionTimeline: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExpl, setLoadingExpl] = useState<string | null>(null);
  const [understood, setUnderstood] = useState<Record<string, boolean>>({});
  
  const { language, animationsEnabled, translateUI } = useApp();
  const { playTTS, isPlaying } = useTTS();
  const { T } = useTranslation();

  useAutoTranslate([
    "Election Process Timeline",
    "of stages understood",
    "AI Explanation",
    "Generating AI interpretation...",
    "Understood!",
    "Mark as Understood",
    "completed",
    "current",
    "upcoming",
    "See Details",
    "Currently Open",
    "Failed to get AI explanation. Please check your connection."
  ]);

  useEffect(() => {
    axios.get("/api/timeline").then(res => {
      setStages(res.data);
      // Auto-translate fetched content if not English
      if (language !== "en") {
        const dynamicTexts = res.data.flatMap((s: Stage) => [s.title, s.description]);
        translateUI(dynamicTexts);
      }
    });
  }, [language, translateUI]);

  const toggleStage = async (id: string, description: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);

    if (!explanations[id]) {
      setLoadingExpl(id);
      try {
        const response = await axios.post("/api/ai-guide/guide", {
          location: "general",
          topic: `Explain this election stage simply: ${description}`,
          language
        });
        
        setExplanations(prev => ({ ...prev, [id]: response.data.guide }));
      } catch (err) {
        setExplanations(prev => ({ ...prev, [id]: T("Failed to get AI explanation. Please check your connection.") }));
      } finally {
        setLoadingExpl(null);
      }
    }
  };

  const progress = Math.round((Object.values(understood).filter(Boolean).length / (stages.length || 1)) * 100);

  const getStatusColor = (status: string) => {
    if (status === "completed") return "bg-gray-100 text-gray-500 border-gray-200";
    if (status === "current") return "bg-green-100 text-green-700 border-green-300";
    return "bg-blue-100 text-blue-700 border-blue-300";
  };

  return (
    <section id="election-timeline" className="py-12 px-4 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold mb-4">{T("Election Process Timeline")}</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="bg-[#1a56db] h-full"
          />
        </div>
        <p className="text-sm text-gray-600 font-medium">{progress}% {T("of stages understood")}</p>
      </div>

      <div className="relative space-y-8 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
        {stages.map((stage, i) => {
          const Icon = iconMap[stage.icon] || Clock;
          const isExpanded = expandedId === stage.id;
          const isUnderstood = understood[stage.id];

          return (
            <div key={stage.id} className="relative pl-20 transition-all duration-300">
              {/* Connector dot */}
              <div className={`
                absolute left-6 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10
                ${stage.status === 'completed' ? 'bg-gray-400' : stage.status === 'current' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}
              `} />

              <div className={`
                bg-white p-6 rounded-xl shadow-sm border transition-all duration-300
                ${isExpanded ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}
              `}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(stage.status)}`}>
                        {T(stage.status)}
                      </span>
                      <span className="text-sm font-medium text-amber-600">{stage.dateRange}</span>
                    </div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Icon className="text-blue-600" size={24} />
                      {T(stage.title)}
                    </h3>
                    <p className="text-gray-600 mt-2 line-clamp-2 md:line-clamp-none">{T(stage.description)}</p>
                  </div>
                  
                  <button 
                    onClick={() => toggleStage(stage.id, stage.description)}
                    aria-expanded={isExpanded}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={animationsEnabled ? { height: 0, opacity: 0 } : false}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    {T("AI Explanation")}
                                </h4>
                                <button 
                                    onClick={() => playTTS(explanations[stage.id] || stage.description, language === 'en' ? 'en-US' : `${language}-${language.toUpperCase()}`)}
                                    aria-label="Speak explanation"
                                    disabled={isPlaying}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <Volume2 size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed italic">
                                {explanations[stage.id] || T("Generating AI interpretation...")}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setUnderstood(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                              ${isUnderstood 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                              }
                            `}
                          >
                            <Check size={18} className={isUnderstood ? "text-green-600" : "text-gray-400"} />
                            {isUnderstood ? T("Understood!") : T("Mark as Understood")}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ElectionTimeline;
