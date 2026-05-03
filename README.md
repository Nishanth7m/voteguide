# VoteGuide AI - 2026 Election Assistant

## 🏆 Voting System Vertical
**Theme:** Civic Engagement & Voter Education

VoteGuide AI is an elite, non-partisan interactive assistant designed to bridge the gap between complex election laws and citizen participation. By leveraging Google's most advanced AI and mapping services, we provide a unified platform for voters to navigate their journey from registration to ballot cast.

## 🚀 Key Features (Winning Criteria)

### 1. Smart Voter Blueprint (Gemini-powered)
Unlike generic guides, our **SmartGuide** uses Gemini 1.5 Flash to extract localized voting requirements (ID laws, registration deadlines) based on user-provided locations. It provides a concise, actionable summary that saves hours of research.

### 2. Multi-Sense Interaction (TTS + Translation)
To ensure accessibility for all citizens:
- **TTS (Text-to-Speech):** Users can listen to election stage explanations via Google Cloud TTS.
- **Multilingual Support:** Real-time translation into 5+ languages using Google Cloud Translation.

### 3. Progressive Polling Locator
Integrated with **Google Maps & Places API**, our locator doesn't just find coordinates; it identifies official polling stations and provides one-click navigation.

### 4. Secure AI Chat Architecture
Security was a top priority. We architected a **Server-Side AI Proxy** to protect sensitive API keys, ensuring no third-party keys are exposed in the client-side code, while still maintaining high performance via optimized session persistence in **Firestore**.

## 🧠 Approach & Logic
- **Architecture:** Full-stack Express + Vite + React (SPA).
- **Security:** CSRF protection via Helmet, rate limiting to prevent API abuse, and server-side AI execution.
- **Efficiency:** Implemented LRU caching on the backend for TTS and Translation requests, and frontend state-memoization for AI guides.
- **Accessibility:** 
  - Standard compliant ARIA labels.
  - "Skip to Content" primary navigation.
  - Reduced-motion support via CSS media queries.
  - High-contrast and large-text theme support.

## 🛠️ How it Works
1. **Frontend:** React application handled with Vite. Uses Framer Motion for high-quality transitions.
2. **Backend:** Express server handles API requests. 
   - `/api/chat`: Securely communicates with Gemini for long-form Q&A.
   - `/api/ai-guide`: Specialized prompt engineering for regional voting rules.
   - `/api/tts` & `/api/translate`: Proxy routes for Google Cloud services.
3. **Storage:** Firebase Firestore stores chat sessions, allowing users to return to their navigation later.

## 📝 Assumptions
- **Data Source:** For this prototype, the AI provides guidance based on its extensive training data for US elections. In a production environment, this would be grounded in a verified database of state laws.
- **Location API:** Assumes browser geolocation permission for the "Find My Polling Station" feature.

---
*Built with ❤️ for the Google Antigravity Code Challenge.*
