import { useState } from "react";
import axios from "axios";

export const useTTS = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playTTS = async (text: string, languageCode: string) => {
    try {
      setIsPlaying(true);
      const resp = await axios.post("/api/tts", { text, language: languageCode });
      const audioData = resp.data.audioContent;
      
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
    } catch (err) {
      console.error("TTS play failed:", err);
      setIsPlaying(false);
    }
  };

  return { playTTS, isPlaying };
};
