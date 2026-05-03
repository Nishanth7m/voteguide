import express from "express";
import { getSessionCollection } from "../lib/firebase-admin.js";
import { FileSessionStore } from "../lib/file-store.js";

const router = express.Router();

// GET /api/sessions/:id - Retrieve a session
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Try Firestore first
    try {
      const doc = await getSessionCollection().doc(id).get();
      if (doc.exists) {
        return res.json(doc.data());
      }
    } catch (fireError: any) {
      // If it's a permission error, we log it only once or more quietly
      if (fireError?.code === 7 || fireError?.message?.includes("PERMISSION_DENIED")) {
        // Silently fallback to File Store for this environment
      } else {
        console.warn(`[Sessions API] Firestore fetch failed for ${id}, trying file store fallback:`, fireError.message);
      }
    }
    
    // Fallback to File Store
    const fileData = await FileSessionStore.get(id);
    if (fileData) {
      return res.json(fileData);
    }
    
    res.status(404).json({ error: "Session not found" });
  } catch (error: any) {
    console.error(`[Sessions API] Critical error fetching session ${id}:`, error);
    res.status(500).json({ 
      error: "Failed to retrieve session", 
      message: error.message
    });
  }
});

// POST /api/sessions - Save or update a session
router.post("/", async (req, res) => {
  const { sessionId, messages, language, updatedAt } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const data = {
    sessionId,
    messages: messages || [],
    language: language || "en",
    updatedAt: updatedAt || new Date().toISOString(),
  };

  try {
    // Try Firestore persistence
    try {
      await getSessionCollection().doc(sessionId).set(data, { merge: true });
    } catch (fireError: any) {
      if (fireError?.code === 7 || fireError?.message?.includes("PERMISSION_DENIED")) {
        // Silently fallback to File Store
      } else {
        console.warn(`[Sessions API] Firestore save failed for ${sessionId}, using file store fallback:`, fireError.message);
      }
    }
    
    // Always persist to File Store as well for reliability in this environment
    await FileSessionStore.set(sessionId, data);

    res.json({ success: true });
  } catch (error: any) {
    console.error(`[Sessions API] Critical error saving session ${sessionId}:`, error);
    res.status(500).json({ 
      error: "Failed to save session", 
      message: error.message
    });
  }
});

export default router;
