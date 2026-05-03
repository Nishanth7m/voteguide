import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Info, Users, Shield, Target } from "lucide-react";
import { useTranslation, useAutoTranslate } from "../hooks/useApp";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import { DMKFlag, AIADMKFlag, TVKFlag, BJPFlag } from "./PartyFlags";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  symbol: string;
  leader: string;
  leaderImage: string;
  flagImage: string;
  ideology: string;
  brief: string;
}

const tnParties: Party[] = [
  {
    id: "dmk",
    name: "Dravida Munnetra Kazhagam",
    shortName: "DMK",
    color: "#ff0000",
    secondaryColor: "#000000",
    symbol: "Rising Sun",
    leader: "M.K. Stalin",
    leaderImage: "https://upload.wikimedia.org/wikipedia/commons/2/2a/M._K._Stalin.jpg",
    flagImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_the_Dravida_Munnetra_Kazhagam.svg/450px-Flag_of_the_Dravida_Munnetra_Kazhagam.svg.png",
    ideology: "Social Justice, Dravidianism, State Autonomy",
    brief: "One of the oldest and most influential parties in Tamil Nadu, founded by C.N. Annadurai."
  },
  {
    id: "aiadmk",
    name: "All India Anna Dravida Munnetra Kazhagam",
    shortName: "AIADMK",
    color: "#000000",
    secondaryColor: "#ff0000",
    symbol: "Two Leaves",
    leader: "Edappadi K. Palaniswami",
    leaderImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Edappadi_K._Palaniswami.jpg/1024px-Edappadi_K._Palaniswami.jpg",
    flagImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/AIADMK_Flag.svg/1024px-AIADMK_Flag.svg.png",
    ideology: "Dravidianism, Welfare Populism",
    brief: "Founded by M.G. Ramachandran (MGR), it has a strong base in rural and women voters."
  },
  {
    id: "tvk",
    name: "Thamizhaga Vettri Kazhagam",
    shortName: "TVK",
    color: "#800000",
    secondaryColor: "#ffff00",
    symbol: "Flag with Two Elephants & Star",
    leader: "Vijay",
    leaderImage: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Leo_Success_Meet.jpg",
    flagImage: "https://i.ibb.co/q9d8p5R/tvk-flag.png",
    ideology: "Secular Social Justice, Equality",
    brief: "The newest major entry into TN politics, led by actor-turned-politician Vijay."
  },
  {
    id: "ntk",
    name: "Naam Tamilar Katchi",
    shortName: "NTK",
    color: "#ffcc00",
    secondaryColor: "#ff0000",
    symbol: "Tiger flag / Mike",
    leader: "Seeman",
    leaderImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Seeman%2C_Tamil_Politician.jpg/1024px-Seeman%2C_Tamil_Politician.jpg",
    flagImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Nam_Tamilar_Katchi_Flag.png/300px-Nam_Tamilar_Katchi_Flag.png",
    ideology: "Tamil Nationalism, Environmentalism",
    brief: "Promotes Tamil identity and self-reliance as its core philosophy."
  },
  {
    id: "bjp-tn",
    name: "Bharatiya Janata Party (TN)",
    shortName: "BJP",
    color: "#ff9933",
    secondaryColor: "#138808",
    symbol: "Lotus",
    leader: "K. Annamalai",
    leaderImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/K._Annamalai_BJP.jpg/1024px-K._Annamalai_BJP.jpg",
    flagImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1024px-Bharatiya_Janata_Party_logo.svg.png",
    ideology: "Nationalism, Development, Cultural Integrity",
    brief: "Focuses on clean governance and alignment with national developmental goals."
  }
];

const TNPartyShowcase: React.FC = () => {
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { T, language } = useTranslation();

  useAutoTranslate([
    "Tamil Nadu Political Landscape",
    "Explore the major political parties and understand their core ideologies before you vote.",
    "Click on a party to see more details and AI-generated ideology analysis.",
    "Leader",
    "Symbol",
    "Core Ideology",
    "AI Interpretation",
    "Generating deep ideology analysis...",
    "Close Details",
    "Why Your Vote Matters",
    "Power to the People: Your vote is your voice in how your community is run.",
    "Tamil Nadu's Future: Every single vote shapes the socioeconomic policies of the state.",
    "Strengthening Democracy: Active participation prevents stagnation and encourages accountability.",
    "Did you know?",
    "Tamil Nadu often sees some of the highest voter turnouts in the country, showing strong civic engagement.",
    ...tnParties.map(p => p.name),
    ...tnParties.map(p => p.ideology),
    ...tnParties.map(p => p.brief),
    ...tnParties.map(p => p.symbol)
  ]);

  const fetchIdeology = async (party: Party) => {
    setSelectedParty(party);
    setAiAnalysis(null);
    setLoading(true);
    try {
      const targetLang = language || "English";
      const prompt = `
        Provide a detailed political ideology and history analysis for the party: ${party.name} (${party.shortName}).
        The leader is ${party.leader}. 
        Format the response with these specific sections in Markdown:
        - Origin & Historical Context
        - Core Political & Social Principles
        - Modern Outlook & Current Strategy
        
        IMPORTANT: Your entire response must be strictly in ${targetLang}.
        Keep it objective, non-partisan, and educational.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      setAiAnalysis(response.text || "Unable to retrieve AI analysis at this moment.");
    } catch (err) {
      setAiAnalysis("Unable to retrieve AI analysis at this moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {T("Tamil Nadu Political Landscape")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {T("Explore the major political parties and understand their core ideologies before you vote.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-20">
          {tnParties.map((party) => (
            <motion.button
              key={party.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchIdeology(party)}
              className={`group relative h-64 rounded-3xl overflow-hidden shadow-lg border-2 border-transparent transition-all ${
                party.id === 'dmk' ? 'hover:border-[#ff0000] party-card-dmk' : 
                party.id === 'tvk' ? 'hover:border-[#ffff00] party-card-tvk' : 
                'hover:border-blue-500'
              }`}
            >
              <div 
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${party.color} 50%, ${party.secondaryColor} 50.5%)` }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-3xl font-black text-white/20 absolute top-4 right-4">{party.shortName}</span>
                <h3 className="text-xl font-bold text-white mb-1">{party.shortName}</h3>
                <p className="text-xs text-white/80 font-medium">{party.leader}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selectedParty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="md:flex">
                <div className="md:w-1/3 p-8 bg-gray-50 flex flex-col justify-between border-r border-gray-100">
                  <div>
                    <div className="relative mb-6">
                      <div 
                        className="w-full h-48 rounded-2xl overflow-hidden shadow-inner bg-gray-200 relative group"
                      >
                        <img 
                          src={selectedParty.leaderImage} 
                          alt={selectedParty.leader}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 w-12 h-8 rounded shadow-md overflow-hidden border border-white/50 bg-gray-100">
                          {selectedParty.id === 'dmk' ? <DMKFlag /> :
                           selectedParty.id === 'aiadmk' ? <AIADMKFlag /> :
                           selectedParty.id === 'tvk' ? <TVKFlag /> :
                           selectedParty.id === 'bjp-tn' ? <BJPFlag /> :
                           <img 
                             src={selectedParty.flagImage} 
                             alt={`${selectedParty.shortName} Flag`}
                             className="w-full h-full object-cover"
                             referrerPolicy="no-referrer"
                           />}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedParty.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">{selectedParty.symbol}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="tech-label mb-1">{T("Leader")}</p>
                        <p className="font-bold text-gray-800">{selectedParty.leader}</p>
                      </div>
                      <div>
                        <p className="tech-label mb-1">{T("Core Ideology")}</p>
                        <p className="text-sm font-medium text-gray-600">{T(selectedParty.ideology)}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedParty(null)}
                    className="mt-8 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                  >
                    {T("Close Details")}
                  </button>
                </div>

                <div className="md:w-2/3 p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-6 text-blue-600">
                    <Sparkles size={16} />
                    <h4 className="tech-label text-blue-600/70">{T("AI Interpretation")}</h4>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-gray-500 font-medium">{T("Generating deep ideology analysis...")}</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-blue max-w-none"
                    >
                      <Markdown>{aiAnalysis || ""}</Markdown>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why to Vote Section */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
              {T("Why Your Vote Matters")}
            </h2>
            <div className="space-y-6">
              {[
                { icon: <Users />, text: "Power to the People: Your vote is your voice in how your community is run." },
                { icon: <Target />, text: "Tamil Nadu's Future: Every single vote shapes the socioeconomic policies of the state." },
                { icon: <Shield />, text: "Strengthening Democracy: Active participation prevents stagnation and encourages accountability." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="shrink-0 w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
                    {item.icon}
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {T(item.text)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a56db] rounded-3xl p-12 text-white relative overflow-hidden">
             <div className="relative z-10">
                <Info className="mb-6 opacity-50" size={40} />
                <h3 className="text-3xl font-bold mb-4">{T("Did you know?")}</h3>
                <p className="text-xl text-blue-100 leading-relaxed border-l-4 border-white/30 pl-6">
                  {T("Tamil Nadu often sees some of the highest voter turnouts in the country, showing strong civic engagement.")}
                </p>
             </div>
             {/* Decorative pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TNPartyShowcase;
