import React, { Suspense, lazy, Component, ReactNode } from "react";
import { AppProvider, useTranslation, useAutoTranslate } from "./hooks/useApp";
import AccessibilityBar from "./components/AccessibilityBar";
import LanguageToggle from "./components/LanguageToggle";
import ElectionTimeline from "./components/ElectionTimeline";
import VoterChecklist from "./components/VoterChecklist";
import SmartGuide from "./components/SmartGuide";
import ChatBot from "./components/ChatBot";
import { Vote, Sparkles } from "lucide-react";
import { motion } from "motion/react";

// Lazy load heavy components
const PollingLocator = lazy(() => import("./components/PollingLocator"));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import TNPartyShowcase from "./components/TNPartyShowcase";

function AppContent() {
  const { T } = useTranslation();
  
  const stringsToTranslate = [
    "Elite Election Assistant",
    "Timeline",
    "Find Polling",
    "Checklist",
    "Award Winning AI Assistant",
    "Your Journey to",
    "Election Day",
    "Starts Here.",
    "VoteGuide AI simplifies the complex voting process with real-time assistance, location finders, and personalized checklists.",
    "Find My Polling Station",
    "Explore Timeline",
    "Dedicated to making democracy accessible for everyone. Powered by Google AI to provide factual, timely information for voters across the nation.",
    "Resources",
    "Federal Voting Info",
    "Voter Rights",
    "Election Security",
    "Accessibility Standards",
    "Language",
    "Skip to main content",
    "Tamil Nadu Spotlight",
    "TN Political Landscape"
  ];

  useAutoTranslate(stringsToTranslate);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-100">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-xl"
      >
        {T("Skip to main content")}
      </a>
      <AccessibilityBar />
      
      <header className="sticky top-[48px] z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1a56db] text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Vote size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#111827] leading-none mb-1">VoteGuide AI</h1>
              <p className="tech-label text-blue-600 leading-none">{T("Elite Election Assistant")}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="#election-timeline" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{T("Timeline")}</a>
              <a href="#tn-special" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{T("TN Political Landscape")}</a>
              <a href="#polling-locator" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{T("Find Polling")}</a>
              <a href="#voter-checklist" className="hover:text-blue-600 transition-colors uppercase tracking-wider">{T("Checklist")}</a>
            </nav>
            <div className="h-6 w-px bg-gray-200" />
            <LanguageToggle />
          </div>

          <div className="md:hidden">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 px-4 bg-white overflow-hidden border-b border-slate-100">
           {/* Technical Grid Backplate */}
           <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
           
           <div className="max-w-5xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles size={14} className="text-blue-600" />
                  <span className="tech-label text-blue-600">
                    {T("Award Winning AI Assistant")}
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#111827] mb-6 leading-tight">
                  {T("Your Journey to")} <span className="text-[#1a56db]">{T("Election Day")}</span> {T("Starts Here.")}
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
                  {T("VoteGuide AI simplifies the complex voting process with real-time assistance, location finders, and personalized checklists.")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a 
                    href="#polling-locator" 
                    className="px-8 py-4 bg-[#1a56db] text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:translate-y-[-2px] transition-all"
                  >
                    {T("Find My Polling Station")}
                  </a>
                  <a 
                    href="#tn-special" 
                    className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:translate-y-[-2px] transition-all shadow-sm"
                  >
                    {T("Tamil Nadu Spotlight")}
                  </a>
                </div>
              </motion.div>
           </div>
           
           {/* Background Decals */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200/10 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
        </section>

        <section id="tn-special">
          <TNPartyShowcase />
        </section>

        <ElectionTimeline />
        
        <SmartGuide />

        <Suspense fallback={<div className="h-[500px] bg-gray-100 animate-pulse rounded-2xl mx-4 mb-20" />}>
          <PollingLocator />
        </Suspense>

        <VoterChecklist />
      </main>

      <footer className="bg-[#111827] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Vote size={28} />
              <span className="text-2xl font-bold tracking-tight">VoteGuide AI</span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              {T("Dedicated to making democracy accessible for everyone. Powered by Google AI to provide factual, timely information for voters across the nation.")}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-blue-400">{T("Resources")}</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{T("Federal Voting Info")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{T("Voter Rights")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{T("Election Security")}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{T("Accessibility Standards")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-blue-400">{T("Language")}</h4>
            <LanguageToggle />
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} VoteGuide AI. This is an AI-powered assistant. Please verify critical voting details with your local election office.
        </div>
      </footer>

      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
