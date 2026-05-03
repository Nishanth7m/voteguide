import dotenv from "dotenv";
dotenv.config();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  process.exit(1);
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";

// Route imports - using .js extension as required for ESM + TS
import ttsRouter from "./server/routes/tts.js";
import sessionsRouter from "./server/routes/sessions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust all proxies in the chain for accurate client IP identification
  app.set("trust proxy", true);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        "img-src": ["'self'", "data:", "https://maps.gstatic.com", "https://maps.googleapis.com"],
        "frame-src": ["'self'", "https://www.google.com"],
        "connect-src": ["'self'", "https://generativelanguage.googleapis.com", "*.googleapis.com", "wss://*.googleapis.com"],
        "frame-ancestors": ["'self'", "*"], // Allow being embedded in AI Studio
      },
    },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: false, // Disable X-Frame-Options to allow iframing
  }));

  app.use(cors({
    origin: true // Allow all origins in dev environment for fewer connectivity issues
  }));

  app.use(express.json({ limit: "1mb" }));

  // Global Rate Limiter - safe configuration for proxy environment
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
  });
  app.use(limiter);

  console.log("Initializing API routes...");

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0" });
  });

  app.get("/api/timeline", (req, res) => {
    const timeline = [
      {
        id: "voter-reg-tn",
        title: "TN Special Voter Revision",
        dateRange: "Dec 2025 - Jan 2026",
        description: "Special summary revision of electoral rolls for the upcoming Tamil Nadu Assembly elections.",
        icon: "user-plus",
        status: "completed"
      },
      {
        id: "election-notification",
        title: "Official Election Notification",
        dateRange: "March 2026",
        description: "The Governor issues the notification for the general assembly elections.",
        icon: "file-text",
        status: "current"
      },
      {
        id: "nomination-tn",
        title: "Candidate Filing",
        dateRange: "Last week of March 2026",
        description: "Candidates from major parties (DMK, AIADMK, TVK, BJP, etc.) file their nominations.",
        icon: "clock",
        status: "upcoming"
      },
      {
        id: "campaigning",
        title: "Peak Campaigning Period",
        dateRange: "April 2026",
        description: "Intense ground activities and rallies across all 234 constituencies.",
        icon: "users",
        status: "upcoming"
      },
      {
        id: "polling-tn",
        title: "Assembly Election Day",
        dateRange: "Late April / Early May 2026",
        description: "Millions of citizens cast their votes to elect the 16th Tamil Nadu Legislative Assembly.",
        icon: "check-circle",
        status: "upcoming"
      },
      {
        id: "results-tn",
        title: "Counting & Results",
        dateRange: "May 2026",
        description: "Counting of votes and declaration of the next government of Tamil Nadu.",
        icon: "award",
        status: "upcoming"
      }
    ];
    res.json(timeline);
  });

  app.use("/api/tts", ttsRouter);
  app.use("/api/sessions", sessionsRouter);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express Error Handler:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } catch (err) {
      console.error("Failed to start Vite server:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  console.log(`Starting server on port ${PORT}...`);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
