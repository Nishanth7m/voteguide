import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Copy, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "../hooks/useChat";
import { useApp, useTranslation, useAutoTranslate } from "../hooks/useApp";

const quickChips = [
  "How do I register?",
  "What ID do I need?",
  "Where is my polling station?",
  "Can I vote by mail?",
  "What is early voting?"
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { language } = useApp();
  const { messages, sendMessage, loading } = useChat(language);
  const { T } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useAutoTranslate([
    "Online | Election Expert",
    "Hello! I'm VoteGuide AI",
    "I can help you with registration, polling locations, and anything about the election process. Ask me anything!",
    "Ask a question...",
    ...quickChips
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        aria-label={T("Open chat assistant")}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#1a56db] text-white rounded-full shadow-2xl flex items-center justify-center z-40"
      >
        <MessageSquare size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-2xl shadow-3xl flex flex-col z-50 border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a56db] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  🗳️
                </div>
                <div>
                  <h3 className="font-bold">VoteGuide AI</h3>
                  <p className="text-[10px] text-blue-200">{T("Online | Election Expert")}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              aria-live="polite"
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 px-6">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{T("Hello! I'm VoteGuide AI")}</h4>
                  <p className="text-sm text-gray-500">{T("I can help you with registration, polling locations, and anything about the election process. Ask me anything!")}</p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3 rounded-2xl text-sm
                    ${m.role === 'user' 
                      ? 'bg-[#1a56db] text-white rounded-tr-none shadow-sm' 
                      : 'bg-white text-[#111827] border border-gray-200 rounded-tl-none shadow-sm'
                    }
                  `}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    {m.role === 'model' && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3">
                        <button onClick={() => copyToClipboard(m.content)} className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Copy message">
                          <Copy size={12} />
                        </button>
                        <button className="text-gray-400 hover:text-green-500 transition-colors" aria-label="Thumbs up">
                          <ThumbsUp size={12} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Thumbs down">
                          <ThumbsDown size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Controls & Input */}
            <div className="p-4 bg-white border-t space-y-3">
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
                {quickChips.map((chip, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(chip)}
                    className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-xs font-medium transition-all"
                  >
                    {T(chip)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <input 
                  type="text"
                  placeholder={T("Ask a question...")}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#1a56db] text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
