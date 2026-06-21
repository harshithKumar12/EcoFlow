import React, { useState, useEffect, useRef } from "react";
import { 
  ensureUserChallengesAndProfile, 
  fetchUserLogs, 
  fetchUserChallenges, 
  toggleUserChallenge, 
  addUserLog, 
  deleteUserLog 
} from "../lib/firebaseHelper";
import { ActivityLog, ActivityType, EcoChallenge, UserSession, UserProfile } from "../types";

export interface RankInfo {
  title: string;
  level: number;
  nextMilestone: string;
  color: string;
}

export function useEcoFlow() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
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

  const fetchPersonalNews = React.useCallback(async (user: UserSession, currentLogs: ActivityLog[], currentChals: EcoChallenge[]) => {
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
  }, []);

  // Check for existing local/guest session on mount
  useEffect(() => {
    const initLocalSession = async () => {
      setLoading(true);
      try {
        const savedProfile = localStorage.getItem("guest_profile");
        if (savedProfile) {
          const profile: UserProfile = JSON.parse(savedProfile);
          const guestUserObj: UserSession = {
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
  }, [fetchPersonalNews]);

  const handleAddLog = React.useCallback(async (type: ActivityType, details: any, notes: string) => {
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
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs];
        fetchPersonalNews(currentUser, updatedLogs, challengesList);
        return updatedLogs;
      });
      
      // Redirect back to dashboard safely
      setActiveTab("dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to add activity log record.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, challengesList, fetchPersonalNews]);

  const handleDeleteLog = React.useCallback(async (id: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      await deleteUserLog(currentUser.uid, id);
      setLogs(prevLogs => {
        const updatedLogs = prevLogs.filter(l => l.id !== id);
        fetchPersonalNews(currentUser, updatedLogs, challengesList);
        return updatedLogs;
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to remove activity log.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, challengesList, fetchPersonalNews]);

  const handleToggleChallenge = React.useCallback(async (challengeId: string, value: number, isCompletedBefore: boolean) => {
    if (!currentUser) return;
    try {
      const result = await toggleUserChallenge(currentUser.uid, challengeId, isCompletedBefore, value);
      if (result.success) {
        setPoints(result.newPoints);
        setChallengesList(prevList => {
          const updatedChallenges = prevList.map(c => 
            c.id === challengeId ? { ...c, completed: !isCompletedBefore } : c
          );
          fetchPersonalNews(currentUser, logs, updatedChallenges);
          return updatedChallenges;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [currentUser, logs, fetchPersonalNews]);

  const handleGuestSignIn = React.useCallback(async (userEmail?: string, userDisplayName?: string) => {
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

      const guestUserObj: UserSession = {
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
  }, [fetchPersonalNews]);

  // Determine standard user title level based on points
  const getUserRankInfo = (pts: number): RankInfo => {
    if (pts >= 800) {
      return { title: "Sustainability Elder", level: 3, nextMilestone: "Sustained Peak", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    } else if (pts >= 400) {
      return { title: "Green Pioneer", level: 2, nextMilestone: "Target is 800 pts", color: "text-teal-700 bg-teal-50 border-teal-200" };
    } else {
      return { title: "Eco Novice", level: 1, nextMilestone: "Target is 400 pts", color: "text-slate-700 bg-slate-50 border-slate-200" };
    }
  };

  const rankInfo = getUserRankInfo(points);

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

  const totalEmitted = React.useMemo(() => logs.reduce((sum, l) => sum + l.carbonFootprint, 0), [logs]);
  const totalSaved = React.useMemo(() => logs.reduce((sum, l) => sum + l.co2Saved, 0), [logs]);

  return {
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
  };
}
