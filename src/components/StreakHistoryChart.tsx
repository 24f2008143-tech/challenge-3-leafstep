import React, { useMemo, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from "recharts";
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  CalendarDays, 
  Info, 
  Calendar,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { ActivityLog } from "../types";

interface StreakHistoryChartProps {
  logs: ActivityLog[];
  currentStreak: number;
  bestStreak: number;
}

export default function StreakHistoryChart({ logs = [], currentStreak = 0, bestStreak = 0 }: StreakHistoryChartProps) {
  const [chartType, setChartType] = useState<"binary" | "intensity">("intensity");

  // Get past 30 days dates
  const last30DaysData = useMemo(() => {
    // Read completed daily goals from localStorage
    let completedGoals: string[] = [];
    try {
      const stored = localStorage.getItem("leafstep_completed_dates_v1");
      if (stored) {
        completedGoals = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read completed dates", e);
    }

    const data = [];
    const now = new Date();

    // Map logs to date strings
    const logsByDate: Record<string, number> = {};
    logs.forEach(log => {
      if (log.date) {
        logsByDate[log.date] = (logsByDate[log.date] || 0) + 1;
      }
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      
      const dayNum = d.getDate();
      const monthNum = d.getMonth();
      const label = `${monthNames[monthNum]} ${dayNum}`;

      const logCount = logsByDate[dateStr] || 0;
      const goalCompleted = completedGoals.includes(dateStr) ? 1 : 0;
      
      // Total daily participations
      const totalParticipationScore = logCount + (goalCompleted ? 2 : 0); // Goals weigh more
      const isActive = (logCount > 0 || goalCompleted > 0) ? 1 : 0;

      data.push({
        dateStr,
        label,
        logCount,
        goalCompleted,
        participationScore: totalParticipationScore,
        isActive, // 1 or 0
        // Friendly tooltip description
        desc: isActive 
          ? `Active (${logCount} logged, ${goalCompleted ? "Goal Completed" : "No Goal"})`
          : "No logged actions"
      });
    }

    return data;
  }, [logs]);

  // Calculate statistics over past 30 days
  const stats = useMemo(() => {
    const activeDaysCount = last30DaysData.filter(d => d.isActive === 1).length;
    const consistencyRate = Math.round((activeDaysCount / 30) * 100);
    const totalActionsCount = last30DaysData.reduce((acc, d) => acc + d.logCount + d.goalCompleted, 0);
    
    return {
      activeDaysCount,
      consistencyRate,
      totalActionsCount
    };
  }, [last30DaysData]);

  // Custom Tooltip component for a beautifully styled overlay
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-xl text-xs space-y-1 z-30 font-sans">
          <p className="font-extrabold text-slate-300">{data.label}</p>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className={`w-2 h-2 rounded-full ${data.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
            <span className="font-bold text-emerald-300">{data.isActive ? "Active Day" : "Inactive"}</span>
          </div>
          <p className="text-slate-400 text-[10px]">Logged events: {data.logCount}</p>
          <p className="text-slate-400 text-[10px]">Habits completed: {data.goalCompleted ? "Yes (🥗)" : "No"}</p>
          {data.isActive && (
            <p className="text-[10px] text-amber-300 font-extrabold mt-1">Consistency Weight: {data.participationScore}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="streak_consistency_section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100/80 transition-all duration-300">
      
      {/* Header section with toggle between activity intensity and active days */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Streak & Habits Consistency (Last 30 Days)</h2>
              <p className="text-[11px] text-slate-400">Review your daily sustainability engagement</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setChartType("intensity")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartType === "intensity"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Activity Level
          </button>
          <button
            onClick={() => setChartType("binary")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chartType === "binary"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Active Days
          </button>
        </div>
      </div>

      {/* Mini Stats Card Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
          <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Consistency Rate</span>
          <h4 className="text-xl font-black text-slate-900 mt-1">{stats.consistencyRate}%</h4>
          <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">{stats.activeDaysCount} of 30 days active</span>
        </div>

        <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
          <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Current Streak</span>
          <h4 className="text-xl font-black text-orange-600 mt-1 flex items-center gap-1">
            <Flame className="w-4 h-4 fill-orange-500 stroke-none" />
            {currentStreak} <span className="text-xs text-slate-400">days</span>
          </h4>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Consecutive logging streak</span>
        </div>

        <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
          <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Personal Record</span>
          <h4 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1">
            🌿 {bestStreak} <span className="text-xs text-slate-400">days</span>
          </h4>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Your maximum active streak</span>
        </div>

        <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl">
          <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Total Actions</span>
          <h4 className="text-xl font-black text-emerald-700 mt-1">{stats.totalActionsCount}</h4>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Logs and habit goals checked</span>
        </div>
      </div>

      {/* Recharts Consistency Graph */}
      <div className="w-full h-56 pt-2 select-none relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "intensity" ? (
            <AreaChart 
              data={last30DaysData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorParticipation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                interval={4} 
              />
              <YAxis 
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="participationScore" 
                stroke="#10b981" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorParticipation)" 
              />
            </AreaChart>
          ) : (
            <BarChart 
              data={last30DaysData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              barCategoryGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                interval={4} 
              />
              <YAxis 
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(val) => val === 1 ? "Active" : "Idle"}
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="isActive" radius={[6, 6, 0, 0]}>
                {last30DaysData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isActive === 1 ? "#10b981" : "#e2e8f0"} 
                  />
                ))}
              </Bar>
              <ReferenceLine y={1} stroke="#cbd5e1" strokeDasharray="2 2" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Info Callout */}
      <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>How are scores weighed?</strong> Logging carbon activities contributes <strong className="text-slate-800">+1 intensity point</strong>. Checking off your Daily Goals adds high-impact habit consistency weighting <strong className="text-slate-800">+2 points</strong>. Aim to stay active every day!
        </p>
      </div>

    </div>
  );
}
