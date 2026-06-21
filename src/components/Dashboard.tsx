import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Leaf,
  Trash2,
  Calendar,
  AlertTriangle,
  Zap,
  Info,
} from "lucide-react";
import { ActivityLog, ActivityType } from "../types";
import { motion } from "motion/react";

interface DashboardProps {
  logs: ActivityLog[];
  onDeleteLog: (id: string) => void;
  insightsBrief: string;
  insightsPredictions: { title: string; tip: string }[];
}

const CATEGORIES = [
  { name: "transport", label: "Transport", color: "#10b981", icon: "🚗" },
  { name: "electricity", label: "Energy", color: "#f59e0b", icon: "⚡" },
  { name: "food", label: "Food", color: "#3b82f6", icon: "🥗" },
  { name: "shopping", label: "Shopping", color: "#8b5cf6", icon: "👕" },
  { name: "flights", label: "Flights", color: "#ec4899", icon: "✈️" },
  { name: "water", label: "Water", color: "#06b6d4", icon: "💧" },
  { name: "waste", label: "Waste", color: "#6b7280", icon: "🗑️" },
];

export default function Dashboard({
  logs,
  onDeleteLog,
  insightsBrief,
  insightsPredictions,
}: DashboardProps) {
  // Compute aggregated stats using useMemo
  const {
    totalCarbon,
    totalSaved,
    last7DaysData,
    breakdownData,
    biggestEmission,
    carbonStatus,
  } = React.useMemo(() => {
    const computedCarbon = logs.reduce(
      (acc, log) =>
        acc +
        (typeof log.carbonFootprint === "number" && !isNaN(log.carbonFootprint)
          ? log.carbonFootprint
          : 0),
      0
    );

    const computedSaved = logs.reduce(
      (acc, log) =>
        acc +
        (typeof log.co2Saved === "number" && !isNaN(log.co2Saved)
          ? log.co2Saved
          : 0),
      0
    );

    const trendData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dayLogs = logs.filter((log) => log.timestamp.startsWith(dateStr));
      const dayFootprint = dayLogs.reduce(
        (sum, l) =>
          sum +
          (typeof l.carbonFootprint === "number" && !isNaN(l.carbonFootprint)
            ? l.carbonFootprint
            : 0),
        0
      );
      const daySaved = dayLogs.reduce(
        (sum, l) =>
          sum +
          (typeof l.co2Saved === "number" && !isNaN(l.co2Saved)
            ? l.co2Saved
            : 0),
        0
      );

      const formattedDate = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      return {
        date: dateStr,
        displayDate: formattedDate,
        Emissions: Number(dayFootprint.toFixed(1)),
        Saved: Number(daySaved.toFixed(1)),
      };
    }).reverse();

    const catBreakdown = CATEGORIES.map((cat) => {
      const sum = logs
        .filter((log) => log.type === cat.name)
        .reduce(
          (acc, l) =>
            acc +
            (typeof l.carbonFootprint === "number" && !isNaN(l.carbonFootprint)
              ? l.carbonFootprint
              : 0),
          0
        );
      return {
        name: cat.label,
        value: Number(sum.toFixed(1)),
        color: cat.color,
        icon: cat.icon,
      };
    });

    const peakEmission = [...catBreakdown].sort((a, b) => b.value - a.value)[0];

    const dailyAvg = computedCarbon / 7;
    const computedStatus =
      dailyAvg <= 5.0
        ? {
            text: "Elite Eco-Warrior",
            color: "text-emerald-500 bg-emerald-50/70 border-emerald-200",
          }
        : dailyAvg <= 12.0
        ? {
            text: "Sustainable Commuter",
            color: "text-blue-500 bg-blue-50/70 border-blue-200",
          }
        : {
            text: "Carbon Intensive",
            color: "text-amber-500 bg-amber-50/70 border-amber-200",
          };

    return {
      totalCarbon: computedCarbon,
      totalSaved: computedSaved,
      last7DaysData: trendData,
      breakdownData: catBreakdown,
      biggestEmission: peakEmission,
      carbonStatus: computedStatus,
    };
  }, [logs]);

  return (
    <div id="dashboard-section" className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          id="stat-card-emissions"
          className="bg-gradient-to-br from-white to-red-50/20 border border-slate-200/90 border-t-4 border-t-rose-500 shadow-sm rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">7-Day Emissions</p>
              <h3 className="text-3xl font-extrabold font-sans tracking-tight text-slate-900 mt-1">
                {totalCarbon.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kg CO₂e</span>
              </h3>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 text-red-500 rounded-xl shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Avg of {(totalCarbon / 7).toFixed(1)} kg / day</span>
          </div>
        </motion.div>

        <motion.div
          id="stat-card-saved"
          className="bg-gradient-to-br from-white to-emerald-50/25 border border-slate-200/90 border-t-4 border-t-emerald-600 shadow-sm rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">7-Day Saved Offsets</p>
              <h3 className="text-3xl font-extrabold font-sans tracking-tight text-emerald-600 mt-1">
                {totalSaved.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kg CO₂e</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-55 text-emerald-600 rounded-xl shadow-sm border border-emerald-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <Leaf className="w-3.5 h-3.5" />
            <span>Equivalent to {Math.round(totalSaved * 0.05)} tree-days</span>
          </div>
        </motion.div>

        <motion.div
          id="stat-card-badge"
          className="bg-gradient-to-br from-white to-amber-50/20 border border-slate-200/90 border-t-4 border-t-amber-500 shadow-sm rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Eco-Score Badge</p>
              <h3 className="text-base font-extrabold text-slate-800 mt-1 tracking-tight leading-snug">
                {carbonStatus.text}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-500 rounded-xl shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-medium">Daily Average Baseline of 12kg</span>
          </div>
        </motion.div>

        <motion.div
          id="stat-card-intensity"
          className="bg-gradient-to-br from-white to-indigo-50/20 border border-slate-200/90 border-t-4 border-t-indigo-500 shadow-sm rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Primary Stress Source</p>
              <h3 className="text-lg font-extrabold text-slate-800 mt-1 capitalize tracking-tight">
                {biggestEmission.value > 0 ? `${biggestEmission.icon} ${biggestEmission.name}` : "None"}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Peak category shares</span>
            <span className="font-bold text-slate-700">
              {totalCarbon > 0 ? Math.round((biggestEmission.value / totalCarbon) * 100) : 0}% of net
            </span>
          </div>
        </motion.div>
      </div>



      {/* Graphical Trend Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 7-Day Net Trend */}
        <div className="lg:col-span-2 bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/90 shadow-sm rounded-2xl p-5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Footprint Trend</h3>
              <p className="text-xs text-slate-500">Comparison of daily emissions vs offset reductions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500">Active Saved (kg)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-400"></span>
                <span className="text-slate-500">Emitted (kg)</span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData}>
                <defs>
                  <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "kg CO₂e",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#64748b", fontSize: 10 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                    fontSize: "12px",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: "#0f172a" }}
                />
                <Area
                  type="monotone"
                  dataKey="Emissions"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fill="transparent"
                />
                <Area
                  type="monotone"
                  dataKey="Saved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSaved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Categories Breakdown */}
        <div className="bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/90 shadow-sm rounded-2xl p-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Emission Sources</h3>
            <p className="text-xs text-slate-500">Total emissions logged by lifestyle categories</p>
          </div>

          <div className="h-56 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#0f172a",
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
            {breakdownData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1 text-slate-500">
                <span>{item.icon}</span>
                <span className="capitalize">{item.name}:</span>
                <span className="text-slate-800 font-semibold">{item.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Logs Listing */}
      <div className="bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/95 shadow-sm rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Carbon Logs</h3>
            <p className="text-xs text-slate-500">Manage your reported resource inputs</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">No activity logs recorded yet. Start tracking above!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <motion.div
                  key={log.id}
                  id={`log-item-${log.id}`}
                  className="bg-slate-50/55 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between hover:border-emerald-300 hover:bg-white hover:shadow-sm transition"
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-white rounded-lg text-lg border border-slate-200 shrink-0 shadow-sm">
                      {log.co2Emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 capitalize">{log.type}</span>
                        <span className="text-[10px] text-slate-400">• {dateStr}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 max-w-sm md:max-w-xl truncate">
                        {log.notes}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-slate-850">
                        {log.carbonFootprint} kg <span className="text-[9px] font-normal text-slate-400">CO₂e</span>
                      </div>
                      {log.co2Saved > 0 && (
                        <div className="text-[10px] font-medium text-emerald-600">
                          -{log.co2Saved} kg offset
                        </div>
                      )}
                    </div>

                    <button
                      id={`delete-btn-${log.id}`}
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-red-500 rounded-lg transition"
                      title="Remove activity log"
                      aria-label="Delete activity log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
