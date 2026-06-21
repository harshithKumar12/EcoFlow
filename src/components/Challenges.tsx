import React, { useState } from "react";
import { EcoChallenge, ActivityLog } from "../types";
import {
  Award,
  Flame,
  Zap,
  CheckCircle,
  Trophy,
  Filter,
  Sparkles,
  Leaf,
  Layers,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChallengesProps {
  logs: ActivityLog[];
  uid: string;
  challenges: EcoChallenge[];
  loading: boolean;
  points: number;
  activeStreak: number;
  onToggleChallenge: (challengeId: string, value: number, isCompletedBefore: boolean) => void;
}

const CATEGORIES_CONFIG = [
  { id: "all", label: "All Tasks", icon: Layers },
  { id: "daily", label: "Daily Missions", icon: Zap },
  { id: "weekly", label: "Weekly Marathons", icon: Trophy },
  { id: "transport", label: "Mobility", icon: Leaf },
  { id: "food", label: "Food & Diet", icon: Sparkles },
];

export default function Challenges({ 
  logs, 
  uid, 
  challenges, 
  loading, 
  points, 
  activeStreak, 
  onToggleChallenge 
}: ChallengesProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [alertInfo, setAlertInfo] = useState<{ id: string; text: string; points: number } | null>(null);

  const handleToggle = React.useCallback((id: string, value: number, isCompletedBefore: boolean, title: string) => {
    onToggleChallenge(id, value, isCompletedBefore);
    if (!isCompletedBefore) {
      setAlertInfo({
        id: `${id}_${Date.now()}`,
        text: `Awesome! You completed "${title}"`,
        points: value,
      });
      // Clear alert after 3.5 seconds
      setTimeout(() => setAlertInfo(prev => prev?.id.startsWith(id) ? null : prev), 3500);
    } else {
      setAlertInfo(null);
    }
  }, [onToggleChallenge]);

  // Filter logic
  const filteredChallenges = challenges.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "daily") return c.type === "daily";
    if (activeFilter === "weekly") return c.type === "weekly";
    if (activeFilter === "transport") return c.category === "transport" || c.id === "chal_1";
    if (activeFilter === "food") return c.category === "food" || c.id === "chal_2";
    return true;
  });

  // Unique Badges based on logs
  const badges = [
    {
      title: "Pedal Commuter",
      requirement: "Log at least 1 cycling activity",
      achieved: logs.some((l) => l.details.transport?.mode === "bicycle" || l.notes?.toLowerCase().includes("bike")),
      desc: "Unlocked by substituting driving commutes with breezy biking paths.",
      icon: "🚲",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Plant Diet First",
      requirement: "Log at least 2 plant diet meals",
      achieved: logs.filter((l) => l.details.food?.dietType === "vegan" || l.details.food?.dietType === "vegetarian" || l.notes?.toLowerCase().includes("vegetarian") || l.notes?.toLowerCase().includes("diet")).length >= 2,
      desc: "Unlocked for promoting low footprint meat substitutes.",
      icon: "🥦",
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Watt Slayer",
      requirement: "Log at least 1 solar/wind energy item",
      achieved: logs.some((l) => l.details.electricity?.source === "green_tariff" || l.details.electricity?.source === "solar" || l.notes?.toLowerCase().includes("solar")),
      desc: "Unlocked for securing zero emission solar or wind energy tariff integrations.",
      icon: "⚡",
      color: "from-amber-400 to-orange-500",
    },
    {
      title: "Waste Sorting Expert",
      requirement: "Log at least 1 recycled waste separation",
      achieved: logs.some((l) => l.details.waste?.recycled || l.notes?.toLowerCase().includes("separat") || l.notes?.toLowerCase().includes("recycl")),
      desc: "Unlocked for actively splitting recyclables from organic compost streams.",
      icon: "🗑️",
      color: "from-violet-500 to-pink-500",
    },
  ];

  const totalPointsTarget = 1000;
  const progressPercent = Math.min(100, Math.round((points / totalPointsTarget) * 100));

  return (
    <div id="challenges-section" className="space-y-7">
      {/* Dynamic Alert Banner */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-emerald-600/10 border border-emerald-500/10"
          >
            <div className="flex items-center gap-3.5">
              <span className="p-2 bg-white/15 backdrop-blur-md rounded-xl text-lg animate-bounce">🎉</span>
              <div>
                <p className="text-xs font-bold font-sans">{alertInfo.text}</p>
                <p className="text-[10px] text-emerald-100 mt-0.5">Points updated in real-time. Keep exploring!</p>
              </div>
            </div>
            <div className="bg-white text-emerald-700 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-sm tracking-wide">
              +{alertInfo.points} PTS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gamified Core Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Points Gauge */}
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Eco Rewards</span>
              <h3 className="text-3xl font-black text-slate-900 font-sans tracking-tight">
                {points} <span className="text-xs font-bold text-slate-450 uppercase">points</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 border border-amber-500/10 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Next Target: <span className="font-bold text-slate-800">Green Pioneer</span></span>
            <span className="font-extrabold text-emerald-600">{Math.max(0, totalPointsTarget - points)} pts left</span>
          </div>
        </div>

        {/* Dynamic Interactive Stage Progress */}
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500">Stage Milestone Goal</span>
            <span className="font-mono text-emerald-600 font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-3 relative overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            ></motion.div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <span>✨ Complete tasks below to lock high efficiency offsets.</span>
          </p>
        </div>

        {/* Activity Streak Gauge */}
        <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Logging Streak</span>
              <h3 className="text-3xl font-black text-slate-900 font-sans tracking-tight flex items-baseline gap-1">
                <span>{activeStreak}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">days</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 text-orange-600 border border-orange-500/10 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3.5 text-[11px] text-slate-500">
            Multiplier active: <span className="font-bold text-orange-600">Streak Multiplier (1.5x)</span>
          </div>
        </div>
      </div>

      {/* Category Navigation Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        {CATEGORIES_CONFIG.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition whitespace-nowrap border ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Challenge list + badge collection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active interactive daily/weekly lists */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Eco Tasks & Daily Missions</span>
            </h3>
            <p className="text-[11px] text-slate-500">Complete these challenges to calculate CO₂ reductions and earn points.</p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium font-mono animate-pulse">
              Consulting challenge databases...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl text-xs text-slate-400 font-semibold">
                  No challenges matched the selected filter.
                </div>
              ) : (
                filteredChallenges.map((c) => (
                  <motion.div
                    key={c.id}
                    id={`challenge-card-${c.id}`}
                    whileHover={{ scale: 1.008 }}
                    transition={{ duration: 0.15 }}
                    className={`p-4 border rounded-2xl flex items-start justify-between transition gap-4 ${
                      c.completed
                        ? "border-emerald-500/40 bg-emerald-50/20 text-emerald-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex gap-3.5 items-start">
                      {/* Interactive Circular Checkbutton with beautiful motion feedback */}
                      <button
                        type="button"
                        aria-label={`Toggle completion of challenge: ${c.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(c.id, c.points, c.completed, c.title);
                        }}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 cursor-pointer mt-0.5 transition duration-200 ${
                          c.completed
                            ? "bg-emerald-600 border-emerald-650 text-white shadow-sm hover:bg-emerald-700"
                            : "bg-slate-50 border-slate-350 text-transparent hover:border-emerald-550 hover:bg-emerald-50"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3.5px] text-white" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{c.title}</span>
                          <span className={`text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                            c.completed 
                              ? "bg-emerald-100/60 text-emerald-750 border-emerald-200/50" 
                              : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                            {c.type}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold font-mono">
                            🌿 Saves {c.co2Value.toFixed(1)}kg CO₂e
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Reward</span>
                      <span className="text-xs font-black text-slate-800">+{c.points} pts</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Badges Collection Section */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-650" />
              <span>Eco Badges & Trophies</span>
            </h3>
            <p className="text-[11px] text-slate-500">Earn special recognition directly derived from your logged carbon footprints.</p>
          </div>

          <div className="space-y-3">
            {badges.map((b, idx) => (
              <div
                key={idx}
                className={`p-3.5 border rounded-2xl flex items-center gap-3.5 transition duration-200 ${
                  b.achieved
                    ? "border-emerald-500/25 bg-gradient-to-br from-white to-emerald-50/15 shadow-sm"
                    : "border-slate-100 bg-slate-50/30 opacity-60"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                  b.achieved ? b.color : "from-slate-200 to-slate-250 text-slate-405"
                } flex items-center justify-center text-lg shadow-sm shrink-0`}>
                  {b.achieved ? b.icon : "🔒"}
                </div>

                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate">{b.title}</h4>
                    {b.achieved ? (
                      <span className="text-[8.5px] text-emerald-700 font-extrabold bg-emerald-100/60 border border-emerald-250/50 px-1.5 py-0.5 rounded uppercase shrink-0">
                        Achieved!
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-400 font-bold uppercase shrink-0">In Progress</span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium leading-normal mt-0.5">
                    {b.desc}
                  </p>
                  <div className="text-[9px] text-slate-400 mt-1 font-bold italic">
                    Req: {b.requirement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
