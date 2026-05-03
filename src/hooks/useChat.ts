import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "model";
  content: string;
  id: string;
}

export const useChat = (language: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem("chat_sid");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("chat_sid", sid);
    }
    setSessionId(sid);
    restoreSession(sid);
  }, []);

  const restoreSession = async (sid: string) => {
    try {
      const response = await fetch(`/api/sessions/${sid}`);
      if (!response.ok) throw new Error("Server unreachable");
      
      const data = await response.json();
      const lastUpdated = data.updatedAt ? new Date(data.updatedAt) : new Date();
      const diffHours = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 3600);
      
      if (diffHours < 24) {
        setMessages(data.messages || []);
        localStorage.setItem(`chat_${sid}`, JSON.stringify(data.messages || []));
      }
    } catch (err) {
      console.warn("Falling back to local storage due to connectivity issues", err);
      const localData = localStorage.getItem(`chat_${sid}`);
      if (localData) {
        setMessages(JSON.parse(localData));
      }
    }
  };

  const persistSession = async (sid: string, newMessages: Message[]) => {
    // Immediate local persistence
    localStorage.setItem(`chat_${sid}`, JSON.stringify(newMessages));
    
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          messages: newMessages,
          language,
          updatedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Failed to persist session to server:", err);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !sessionId) return;

    const userMessage: Message = { role: "user", content, id: uuidv4() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const targetLang = language === "en" ? "English" : language === "hi" ? "Hindi" : language === "ta" ? "Tamil" : language === "es" ? "Spanish" : language === "fr" ? "French" : "English";

      const systemPrompt = `You are VoteGuide AI, a non-partisan elite election assistant for voters in Tamil Nadu and India. 
      Your goal is to provide factual, helpful, and concise information about voter registration, polling station locations, candidate details (DMK, AIADMK, TVK, BJP, etc.), and election dates.
      Keep answers concise and clear. 
      IMPORTANT: You must provide all information and responses strictly in ${targetLang}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt
        },
        contents: [
          ...(messages.slice(-5)).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          })),
          { role: "user", parts: [{ text: content }] }
        ]
      });

      const assistantMessage: Message = { 
        role: "model", 
        content: response.text || "I couldn't process that. Please try again.", 
        id: uuidv4() 
      };

      setMessages(prev => {
        const next = [...prev, assistantMessage];
        persistSession(sessionId, next);
        return next;
      });

    } catch (err) {
      console.error("Chat AI error:", err);
      const errorMessage: Message = {
        role: "model",
        content: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        id: uuidv4()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
