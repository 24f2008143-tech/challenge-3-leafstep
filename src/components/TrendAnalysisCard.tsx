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
  ReferenceLine,
  Legend
} from "recharts";
import { 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  Calendar, 
  Layers, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  Info,
  Activity
} from "lucide-react";
import { ActivityLog } from "../types";

interface TrendAnalysisCardProps {
  logs: ActivityLog[];
}

export default function TrendAnalysisCard({ logs = [] }: TrendAnalysisCardProps) {
  const [metricMode, setMetricMode] = useState<"gross" | "net">("gross");

  // Calculate trends for Last 30 Days vs Previous 30 Days
  const trendData = useMemo(() => {
    const now = new Date();
    // Reset hours to get predictable date boundaries
    now.setHours(0, 0, 0, 0);

    const MS_IN_DAY = 24 * 60 * 60 * 1000;

    // Boundary dates
    const currentStart = new Date(now.getTime() - 29 * MS_IN_DAY); // From 29 days ago until today (30 days total)
    const prevStart = new Date(now.getTime() - 59 * MS_IN_DAY); // From 59 days ago to 30 days ago (30 days total)

    const currentStartStr = currentStart.toISOString().split("T")[0];
    const prevStartStr = prevStart.toISOString().split("T")[0];
    const midpointStr = currentStartStr; // Date dividing previous and current

    let currentGross = 0;
    let currentSavings = 0;
    let prevGross = 0;
    let prevSavings = 0;

    // Category breakdown
    const categories = ["transport", "diet", "energy", "shopping", "travel"] as const;
    const currentCatGross: Record<string, number> = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0 };
    const prevCatGross: Record<string, number> = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0 };

    logs.forEach(log => {
      const isNegative = log.kg_co2 < 0;
      const val = Math.abs(log.kg_co2);

      if (log.date >= currentStartStr) {
        // Current 30 days
        if (isNegative) {
          currentSavings += val;
        } else {
          currentGross += val;
          if (log.category in currentCatGross) {
            currentCatGross[log.category] += val;
          }
        }
      } else if (log.date >= prevStartStr && log.date < currentStartStr) {
        // Previous 30 days (days 31-60 ago)
        if (isNegative) {
          prevSavings += val;
        } else {
          prevGross += val;
          if (log.category in prevCatGross) {
            prevCatGross[log.category] += val;
          }
        }
      }
    });

    const currentNet = currentGross - currentSavings;
    const prevNet = prevGross - prevSavings;

    // Percentage change calculations
    // Formula: ((Current - Prev) / Prev) * 100
    let grossPercentChange = 0;
    if (prevGross > 0) {
      grossPercentChange = Math.round(((currentGross - prevGross) / prevGross) * 100);
    } else if (currentGross > 0) {
      grossPercentChange = 100; // From 0 to something
    }

    let netPercentChange = 0;
    if (prevNet !== 0) {
      netPercentChange = Math.round(((currentNet - prevNet) / Math.abs(prevNet)) * 100);
    } else if (currentNet !== 0) {
      netPercentChange = currentNet > 0 ? 100 : -100;
    }

    // Daily breakdown for visual chart (group logs by day across the whole 60 days)
    // To make it super high-fidelity, let's create a continuous line representing the sum of emissions each day.
    const dailyRecords: Record<string, { dateStr: string; gross: number; net: number; savings: number; period: "Previous" | "Current" }> = {};
    
    // Initialize 60 days of records
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * MS_IN_DAY);
      const dateStr = d.toISOString().split("T")[0];
      const period = i >= 30 ? "Previous" : "Current";
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      
      dailyRecords[dateStr] = {
        dateStr,
        gross: 0,
        net: 0,
        savings: 0,
        period
      };
    }

    // Accumulate logs into daily records (only those in the 60-day range)
    logs.forEach(log => {
      if (dailyRecords[log.date]) {
        const isNegative = log.kg_co2 < 0;
        const val = Math.abs(log.kg_co2);
        if (isNegative) {
          dailyRecords[log.date].savings += val;
        } else {
          dailyRecords[log.date].gross += val;
        }
      }
    });

    // Calculate net for each daily record
    const chartList = Object.entries(dailyRecords).map(([dateStr, data]) => {
      const d = new Date(dateStr);
      const label = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      return {
        ...data,
        label,
        net: Number((data.gross - data.savings).toFixed(1)),
        gross: Number(data.gross.toFixed(1)),
        savings: Number(data.savings.toFixed(1))
      };
    }).sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    // Calculate category changes
    const categoryComparison = categories.map(cat => {
      const curr = Number(currentCatGross[cat].toFixed(1));
      const prev = Number(prevCatGross[cat].toFixed(1));
      let pct = 0;
      if (prev > 0) {
        pct = Math.round(((curr - prev) / prev) * 100);
      } else if (curr > 0) {
        pct = 100;
      }
      return {
        category: cat,
        current: curr,
        previous: prev,
        pctChange: pct
      };
    });

    return {
      currentGross: Number(currentGross.toFixed(1)),
      prevGross: Number(prevGross.toFixed(1)),
      currentNet: Number(currentNet.toFixed(1)),
      prevNet: Number(prevNet.toFixed(1)),
      currentSavings: Number(currentSavings.toFixed(1)),
      prevSavings: Number(prevSavings.toFixed(1)),
      grossPercentChange,
      netPercentChange,
      chartList,
      categoryComparison
    };
  }, [logs]);

  const activePercentChange = metricMode === "gross" ? trendData.grossPercentChange : trendData.netPercentChange;
  const activeCurrentValue = metricMode === "gross" ? trendData.currentGross : trendData.currentNet;
  const activePrevValue = metricMode === "gross" ? trendData.prevGross : trendData.prevNet;

  // Visual cues based on whether the footprint change is decreasing (Good 🟢) or increasing (Bad ⚠️)
  const isOptimal = activePercentChange <= 0;

  return (
    <div className="bg-[#111827] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#1f2937] relative overflow-hidden transition-all duration-300">
      
      {/* Dark Vibe Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 select-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }} 
      />

      {/* Subtle bottom-left glow */}
      <div className={`absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 -z-10 transition-all duration-500 ${isOptimal ? "bg-[#cfff04]" : "bg-rose-500"}`} />

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10 border-b border-[#1f2937] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#cfff04] text-[#111827] px-3 py-1 rounded-full mb-3 shadow-md">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Vibe Diagnostics
          </div>
          <h2 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
            60-Day Carbon Trend Analysis
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Comparing last 30 days of data against previous 30 days</p>
        </div>

        {/* Diagnostic Variable Toggles */}
        <div className="flex bg-[#1f2937] p-1 rounded-xl w-full md:w-auto border border-[#374151]">
          <button
            onClick={() => setMetricMode("gross")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
              metricMode === "gross"
                ? "bg-[#cfff04] text-[#111827] shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gross CO₂
          </button>
          <button
            onClick={() => setMetricMode("net")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-wider ${
              metricMode === "net"
                ? "bg-[#cfff04] text-[#111827] shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Net Footprint
          </button>
        </div>
      </div>

      {/* Main Metric Spotlight Column / Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        
        {/* Left Side: Summary Callout Stats with neon percentages */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#1f2937] border-2 border-[#374151] p-5 sm:p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-5 select-none text-9xl font-black italic">
            CO₂
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-black text-[#cfff04] uppercase tracking-widest block">
              Diagnostics Summary
            </span>

            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl flex items-center justify-center ${
                isOptimal ? "bg-[#cfff04]/10 text-[#cfff04]" : "bg-rose-500/10 text-rose-400"
              }`}>
                {isOptimal ? <TrendingDown className="w-10 h-10" /> : <TrendingUp className="w-10 h-10" />}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black italic tracking-tighter ${
                    isOptimal ? "text-[#cfff04]" : "text-rose-400"
                  }`}>
                    {activePercentChange > 0 ? `+${activePercentChange}` : activePercentChange}%
                  </span>
                </div>
                <span className="text-xs text-slate-305 font-bold uppercase tracking-wide block mt-0.5">
                  {isOptimal ? "Footprint Reduced!" : "Footprint Increased"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#374151]">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Last 30 Days
                </span>
                <span className="text-lg font-black text-white block mt-0.5 font-mono">
                  {activeCurrentValue} <span className="text-[10px] text-slate-400 font-sans">kg</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Previous 30 Days
                </span>
                <span className="text-lg font-black text-slate-300 block mt-0.5 font-mono">
                  {activePrevValue} <span className="text-[10px] text-slate-400 font-sans">kg</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#374151] space-y-1.5 p-3 rounded-xl bg-[#111827]">
            {isOptimal ? (
              <p className="text-[11px] text-[#cfff04] flex items-start gap-1.5 font-medium leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Goated energy! Your carbon levels dropped by <strong className="font-extrabold">{Math.abs(activePercentChange)}%</strong> compared to the previous 30-day interval. You are actively cooling the grid!</span>
              </p>
            ) : (
              <p className="text-[11px] text-rose-300 flex items-start gap-1.5 font-medium leading-relaxed">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Urgent: emissions rose <strong className="font-extrabold">{activePercentChange}%</strong>. Try logging more eco-friendly transit logs or turning down household standby power items.</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Visual continuous line comparison */}
        <div className="lg:col-span-7 bg-[#1f2937]/50 border-2 border-[#1f2937] p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-[#cfff04] tracking-widest uppercase block">
              60-Day Continual Timeline
            </span>
            <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-600 inline-block" /> Previous Month
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-[#cfff04] inline-block" /> Current Month
              </span>
            </div>
          </div>

          {/* Continuous Recharts visualization */}
          <div className="w-full h-44 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.chartList} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendColors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricMode === "gross" ? "#cfff04" : "#10b981"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricMode === "gross" ? "#cfff04" : "#10b981"} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.2} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  interval={9}
                />
                <YAxis 
                  tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const val = metricMode === "gross" ? item.gross : item.net;
                      return (
                        <div className="bg-[#111827] border-2 border-[#374151] rounded-xl p-2.5 text-[10px] text-white font-sans space-y-0.5">
                          <p className="font-bold text-slate-300">{item.label}</p>
                          <p className="font-black text-[#cfff04]">{val} kg CO₂</p>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">{item.period} Period</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={trendData.chartList[30]?.label} stroke="#374151" strokeWidth={1} strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey={metricMode === "gross" ? "gross" : "net"} 
                  stroke={metricMode === "gross" ? "#cfff04" : "#10b981"} 
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendColors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-bold uppercase mt-2">
            The vertical dashed line marks the midpoint boundary between standard compare intervals
          </p>
        </div>

      </div>

      {/* Category diagnostics drilldown */}
      <div className="mt-6 pt-5 border-t border-[#1f2937] relative z-10">
        <span className="text-[10px] font-black text-[#cfff04] uppercase tracking-widest block mb-3">
          Category-Level Volatility (Last 30 Days vs Previous)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {trendData.categoryComparison.map(cat => {
            const isGoodChange = cat.pctChange <= 0;
            return (
              <div key={cat.category} className="bg-[#1f2937] border border-[#374151] p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
                    {cat.category}
                  </span>
                  <p className="text-sm font-black text-white mt-1 font-mono leading-none">
                    {cat.current} <span className="text-[9px] text-[#cfff04]">kg</span>
                  </p>
                </div>
                
                <div className="mt-2.5 pt-2 border-t border-[#111827] flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500">Change:</span>
                  <span className={`text-[10px] font-black font-mono flex items-center ${
                    isGoodChange ? "text-[#cfff04]" : "text-rose-450 text-rose-400"
                  }`}>
                    {isGoodChange ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {cat.pctChange > 0 ? `+${cat.pctChange}` : cat.pctChange}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
