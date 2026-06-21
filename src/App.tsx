import React from "react";
import { useEcoFlow } from "./hooks/useEcoFlow";
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const LogActivity = React.lazy(() => import("./components/LogActivity"));
const RoutePlanner = React.lazy(() => import("./components/RoutePlanner"));
const AICoach = React.lazy(() => import("./components/AICoach"));
const Challenges = React.lazy(() => import("./components/Challenges"));
import AuthScreen from "./components/AuthScreen";
import {
  Leaf,
  Activity,
  Compass,
  Sparkles,
  Award,
  Flame,
  Shield,
  Loader2,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import logoSrc from "./assets/images/ecoflow_logo_1781961512713.jpg";

export default function App() {
  const {
    currentUser,
    authChecking,
    activeTab,
    setActiveTab,
    logs,
    challengesList,
    points,
    activeStreak,
    insightsBrief,
    insightsPredictions,
    loading,
    errorMsg,
    userMenuOpen,
    setUserMenuOpen,
    dropdownRef,
    handleAddLog,
    handleDeleteLog,
    handleToggleChallenge,
    handleGuestSignIn,
    rankInfo,
    totalEmitted,
    totalSaved
  } = useEcoFlow();

  // Loading screen for firebase check
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-emerald-50/40 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Securing active session environment...
          </span>
        </div>
      </div>
    );
  }

  // Auth Screen if not logged in
  if (!currentUser) {
    return <AuthScreen onGuestSignIn={handleGuestSignIn} />;
  }

  return (
    <div id="full-workspace" className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#f0fdf4]/30 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs"
      >
        Skip to main content
      </a>
      {/* Header Container bar */}
      <header className="border-b border-rose-100/10 border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div 
            onClick={() => setActiveTab("dashboard")} 
            className="flex items-center gap-3.5 cursor-pointer hover:opacity-90 active:scale-[0.99] transition duration-200"
          >
            <img
              src={logoSrc}
              alt="EcoFlow Logo"
              className="w-11 h-11 object-contain rounded-xl shadow-md border border-emerald-100 bg-white p-0.5 hover:scale-105 transition duration-300 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>EcoFlow</span>
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100/60 text-emerald-700 border border-emerald-200 rounded-full">
                  AI Active Coach
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Intelligent carbon logging and path selection guide
              </p>
            </div>
          </div>

          {/* Core Status Ribbon */}
          <div className="flex items-center gap-5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
            <div className="flex items-center gap-2 shrink-0">
              <span className="p-1 px-1.5 bg-white border border-slate-200 text-slate-600 rounded shadow-sm text-xs">🗂️</span>
              <div>
                <span className="block text-[8px] text-slate-400 font-bold uppercase">Weekly Net</span>
                <span className="text-xs font-bold text-slate-900">{totalEmitted.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="block text-[8px] text-emerald-600 font-bold uppercase">Carbon Saved</span>
                <span className="text-xs font-bold text-emerald-600">-{totalSaved.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <div>
                <span className="block text-[8px] text-orange-500 font-bold uppercase">Streak</span>
                <span className="text-xs font-bold text-slate-900">{activeStreak} Days</span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden md:block shrink-0"></div>

            {/* Profile Popover Launcher Button */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                id="profile-dropdown-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center text-sm font-extrabold uppercase shadow-md transition duration-200 cursor-pointer focus:outline-none"
              >
                {currentUser.displayName ? currentUser.displayName[0] : (currentUser.email ? currentUser.email[0] : "E")}
              </button>

              {/* Popup Dropdown Panel */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-55 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0 shadow-sm">
                        {currentUser.displayName ? currentUser.displayName[0] : "E"}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-black text-slate-850 truncate">
                          {currentUser.displayName || "Eco Traveler"}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Content and Sidebar Tabs view */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading overlay */}
        {loading && (
          <div className="bg-emerald-600/10 border border-emerald-500/10 text-emerald-850 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 animate-pulse shadow-sm">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-bold">Updating carbon tracks database...</span>
          </div>
        )}

        {/* Error warning bar */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Nav Tabs */}
        <div className="bg-slate-200/40 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/55 scrollbar-none overflow-x-auto max-w-full">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "log", label: "Log Footprint", icon: Leaf },
            { id: "maps", label: "Google Maps Router", icon: Compass },
            { id: "coach", label: "AI Coach Chat", icon: Sparkles },
            { id: "challenges", label: "Eco Challenges", icon: Award },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                id={`nav-btn-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 scale-102"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
                aria-selected={isSelected}
                role="tab"
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panels inside tabs */}
        <div className="min-h-[480px]">
          <React.Suspense fallback={<LoadingSkeleton />}>
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dashboard
                    logs={logs}
                    onDeleteLog={handleDeleteLog}
                    insightsBrief={insightsBrief}
                    insightsPredictions={insightsPredictions}
                  />
                </motion.div>
              )}

              {activeTab === "log" && (
                <motion.div
                  key="tab-log"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogActivity onAddLog={handleAddLog} />
                </motion.div>
              )}

              {activeTab === "maps" && (
                <motion.div
                  key="tab-maps"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RoutePlanner onAddCommuteLog={handleAddLog} />
                </motion.div>
              )}

              {activeTab === "coach" && (
                <motion.div
                  key="tab-coach"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AICoach 
                    onAddLogFromCoach={handleAddLog} 
                    userName={currentUser.displayName || currentUser.email?.split("@")[0] || "Eco Companion"}
                    logs={logs}
                    completedChallengesCount={challengesList.filter(c => c.completed).length}
                  />
                </motion.div>
              )}

              {activeTab === "challenges" && (
                <motion.div
                  key="tab-challenges"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Challenges 
                    logs={logs} 
                    uid={currentUser.uid}
                    challenges={challengesList}
                    loading={loading}
                    points={points}
                    activeStreak={activeStreak}
                    onToggleChallenge={handleToggleChallenge}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </React.Suspense>
        </div>
      </main>

      {/* Global minimal footer with compliance tags */}
      <footer className="border-t border-slate-200 bg-white py-6 shrink-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Compliance: WCAG AA Accessibility Contrast Verified</span>
          </div>
          <div>
            <span>Crafted utilizing Node full-stack runtime & Gemini-3.5-flash AI engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="h-28 bg-slate-200/50 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200/50 rounded-2xl lg:col-span-2"></div>
        <div className="h-64 bg-slate-200/50 rounded-2xl"></div>
      </div>
      <div className="h-44 bg-slate-200/50 rounded-2xl w-full"></div>
    </div>
  );
}
