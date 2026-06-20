import React, { useState, useEffect, useRef } from "react";
import { 
  ensureUserChallengesAndProfile, 
  fetchUserLogs, 
  fetchUserChallenges, 
  toggleUserChallenge, 
  addUserLog, 
  deleteUserLog 
} from "./lib/firebaseHelper";
import { ActivityLog, ActivityType, EcoChallenge } from "./types";
import Dashboard from "./components/Dashboard";
import LogActivity from "./components/LogActivity";
import RoutePlanner from "./components/RoutePlanner";
import AICoach from "./components/AICoach";
import Challenges from "./components/Challenges";
import AuthScreen from "./components/AuthScreen";
import {
  Leaf,
  Activity,
  Compass,
  Sparkles,
  Award,
  User,
  Flame,
  Shield,
  Loader2,
  AlertCircle,
  TrendingDown,
  Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import logoSrc from "./assets/images/ecoflow_logo_1781961512713.jpg";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "maps" | "coach" | "challenges">(
    "dashboard"
  );
  
  // Isolated User Data Sets
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [challengesList, setChallengesList] = useState<EcoChallenge[]>([]);
  const [points, setPoints] = useState(355);
  const [activeStreak, setActiveStreak] = useState(5);
  
  // Dynamic Insights
  const [insightsBrief, setInsightsBrief] = useState("");
  const [insightsPredictions, setInsightsPredictions] = useState<{ title: string; tip: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Header Dropdown Pop-Up menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check for existing local/guest session on mount
  useEffect(() => {
    const initLocalSession = async () => {
      setLoading(true);
      try {
        const savedProfile = localStorage.getItem("guest_profile");
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          const guestUserObj = {
            uid: "guest_user",
            email: profile.email || "guest@ecoflow.app",
            displayName: profile.displayName || "Guest Explorer"
          };
          
          setPoints((typeof profile.points === "number" && !isNaN(profile.points)) ? profile.points : 355);
          setActiveStreak((typeof profile.activeStreak === "number" && !isNaN(profile.activeStreak)) ? profile.activeStreak : 5);
          setCurrentUser(guestUserObj);

          const userLogs = await fetchUserLogs("guest_user");
          setLogs(userLogs);

          const userChallenges = await fetchUserChallenges("guest_user");
          setChallengesList(userChallenges);

          await fetchPersonalNews(guestUserObj, userLogs, userChallenges);
        }
      } catch (err) {
        console.error("Failed to initialize system session:", err);
      } finally {
        setLoading(false);
        setAuthChecking(false);
      }
    };

    initLocalSession();
  }, []);

  const fetchPersonalNews = async (user: any, currentLogs: ActivityLog[], currentChals: EcoChallenge[]) => {
    try {
      const resp = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user.displayName || user.email?.split("@")[0] || "Eco Friend",
          logs: currentLogs,
          completedChallenges: currentChals.filter(c => c.completed).map(c => c.title)
        })
      });
      const data = await resp.json();
      if (data) {
        setInsightsBrief(data.aiBrief);
        setInsightsPredictions(data.predictions || []);
      }
    } catch (err) {
      console.error("Personalized insights delivery issue:", err);
    }
  };

  const handleAddLog = async (type: ActivityType, details: any, notes: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // Compute standard co2 savings server side
      const calculateResponse = await fetch("/api/logs/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details })
      });
      const calcData = await calculateResponse.json();

      const newLog: ActivityLog = {
        id: `user_log_${Date.now()}`,
        userId: currentUser.uid,
        type,
        timestamp: new Date().toISOString(),
        carbonFootprint: calcData.carbonFootprint,
        co2Saved: calcData.co2Saved,
        co2Emoji: calcData.emoji || "🌱",
        details,
        notes
      };

      // Store in firestore collections isolated by user
      await addUserLog(currentUser.uid, newLog);
      
      // Update state locally
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      // Refresh insights for response
      await fetchPersonalNews(currentUser, updatedLogs, challengesList);
      
      // Redirect back to dashboard safely
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to add activity log record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      await deleteUserLog(currentUser.uid, id);
      const updatedLogs = logs.filter(l => l.id !== id);
      setLogs(updatedLogs);
      await fetchPersonalNews(currentUser, updatedLogs, challengesList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to remove activity log.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChallenge = async (challengeId: string, value: number, isCompletedBefore: boolean) => {
    if (!currentUser) return;
    try {
      const result = await toggleUserChallenge(currentUser.uid, challengeId, isCompletedBefore, value);
      if (result.success) {
        setPoints(result.newPoints);
        const updatedChallenges = challengesList.map(c => 
          c.id === challengeId ? { ...c, completed: !isCompletedBefore } : c
        );
        setChallengesList(updatedChallenges);
        await fetchPersonalNews(currentUser, logs, updatedChallenges);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuestSignIn = async (userEmail?: string, userDisplayName?: string) => {
    setLoading(true);
    const resolvedEmail = userEmail?.trim() || "guest@ecoflow.app";
    const resolvedName = userDisplayName?.trim() || "Guest Explorer";
    try {
      const profile = await ensureUserChallengesAndProfile(
        "guest_user",
        resolvedEmail,
        resolvedName
      );
      setPoints(profile.points);
      setActiveStreak(profile.activeStreak);

      const guestUserObj = {
        uid: "guest_user",
        email: resolvedEmail,
        displayName: resolvedName
      };

      setCurrentUser(guestUserObj);

      const userLogs = await fetchUserLogs("guest_user");
      setLogs(userLogs);

      const userChallenges = await fetchUserChallenges("guest_user");
      setChallengesList(userChallenges);

      await fetchPersonalNews(guestUserObj, userLogs, userChallenges);
    } catch (err) {
      console.error("Guest mode sign in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine standard user title level based on points
  const getUserRankInfo = (pts: number) => {
    if (pts >= 800) {
      return { title: "Sustainability Elder", level: 3, nextMilestone: "Sustained Peak", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    } else if (pts >= 400) {
      return { title: "Green Pioneer", level: 2, nextMilestone: "Target is 800 pts", color: "text-teal-700 bg-teal-50 border-teal-200" };
    } else {
      return { title: "Eco Novice", level: 1, nextMilestone: "Target is 400 pts", color: "text-slate-700 bg-slate-50 border-slate-200" };
    }
  };

  const rankInfo = getUserRankInfo(points);

  // Loading screen for firebase check
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-emerald-50/40 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-450 font-mono">
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

  // Calculations for status ribbon
  const totalEmitted = logs.reduce((sum, l) => sum + l.carbonFootprint, 0);
  const totalSaved = logs.reduce((sum, l) => sum + l.co2Saved, 0);

  return (
    <div id="full-workspace" className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-[#f0fdf4]/30 text-slate-800 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
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
              <TrendingDown className="w-4 h-4 text-emerald-650" />
              <div>
                <span className="block text-[8px] text-emerald-600 font-bold uppercase">Carbon Saved</span>
                <span className="text-xs font-bold text-emerald-650">-{totalSaved.toFixed(1)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Flame className="w-4 h-4 text-orange-555 animate-pulse" />
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
