import express from "express";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { rateLimit } from "express-rate-limit";

const router = express.Router();

let ttsClient: TextToSpeechClient | null = null;

function getTtsClient() {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient();
  }
  return ttsClient;
}

const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many TTS requests." },
  validate: false,
});

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  "en-US": "en-US-Neural2-F",
  "hi-IN": "hi-IN-Neural2-A",
  "ta-IN": "ta-IN-Standard-A",
  "es-ES": "es-ES-Neural2-A",
  "fr-FR": "fr-FR-Neural2-A"
};

// Simple LRU cache equivalent (max 100)
const ttsCache = new Map<string, string>();

router.post("/", ttsLimiter, async (req, res) => {
  const { text, language } = req.body;

  if (!text) return res.status(400).json({ error: "Text is required." });
  
  const trimmedText = text.substring(0, 500);
  const cacheKey = `${language}_${trimmedText}`;

  if (ttsCache.has(cacheKey)) {
    return res.json({ audioContent: ttsCache.get(cacheKey) });
  }

  if (!LANGUAGE_VOICE_MAP[language]) {
    return res.status(400).json({ error: "Unsupported language for TTS." });
  }

  try {
    const request = {
      input: { text: trimmedText },
      voice: { 
        languageCode: language, 
        name: LANGUAGE_VOICE_MAP[language] 
      },
      audioConfig: { audioEncoding: "MP3" as const },
    };

    const client = getTtsClient();
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent?.toString("base64");

    if (audioContent) {
      if (ttsCache.size >= 100) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, audioContent);
      res.json({ audioContent });
    } else {
      res.status(500).json({ error: "Failed to generate audio." });
    }
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Text-to-speech failed." });
  }
});

export default router;
