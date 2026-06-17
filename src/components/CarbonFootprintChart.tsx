/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";
import { ActivityLog, UserProfile } from "../types";
import { 
  Calendar, 
  Layers, 
  TrendingUp, 
  Leaf, 
  Truck, 
  Utensils, 
  Flame, 
  ShoppingBag, 
  Plane,
  ChevronDown
} from "lucide-react";

// Category details
export const CATEGORY_META = {
  transport: { label: "Transport", color: "#6366f1", icon: Truck, bgClass: "bg-indigo-50 border-indigo-100 text-indigo-700" },
  diet: { label: "Diet & Food", color: "var(--color-emerald-500)", icon: Utensils, bgClass: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  energy: { label: "Home Energy", color: "#f59e0b", icon: Flame, bgClass: "bg-amber-50 border-amber-100 text-amber-700" },
  shopping: { label: "Shopping", color: "#a855f7", icon: ShoppingBag, bgClass: "bg-purple-50 border-purple-100 text-purple-700" },
  travel: { label: "Travel & Hotels", color: "#06b6d4", icon: Plane, bgClass: "bg-cyan-50 border-cyan-100 text-cyan-700" },
};

interface CarbonFootprintChartProps {
  logs: ActivityLog[];
  profile: UserProfile | null;
  triggerToast?: (message: string, type?: "success" | "info" | "error") => void;
}

type ViewType = "monthly" | "weekly" | "daily" | "category";

export default function CarbonFootprintChart({ logs, profile, triggerToast }: CarbonFootprintChartProps) {
  const [viewType, setViewType] = useState<ViewType>("daily");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lastNotifiedDay, setLastNotifiedDay] = useState<string>("");
  const [lastNotifiedValue, setLastNotifiedValue] = useState<number>(0);

  // Parse Date strings to extract custom ranges
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Helper to get Year-Week
    const getYearWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      return `${year}-W${week.toString().padStart(2, "0")}`;
    };

    // Helper to get formatted date string: e.g. "Jun 09"
    const formatDateLabel = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {
        return dateStr;
      }
    };

    // Helper to get formatted month label: e.g. "Jun 2026"
    const formatMonthLabel = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      } catch {
        return dateStr;
      }
    };

    if (viewType === "monthly") {
      const groups: Record<string, Record<string, number>> = {};
      logs.forEach((log) => {
        const monthKey = log.date.substring(0, 7); // "YYYY-MM"
        if (!groups[monthKey]) {
          groups[monthKey] = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0, saved: 0 };
        }
        if (log.kg_co2 < 0) {
          groups[monthKey].saved += Math.abs(log.kg_co2);
        } else {
          groups[monthKey][log.category] = (groups[monthKey][log.category] || 0) + log.kg_co2;
        }
      });

      return Object.entries(groups)
        .map(([key, vals]) => ({
          label: formatMonthLabel(`${key}-02`),
          sortKey: key,
          ...vals,
          gross: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel).toFixed(1)),
          net: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel - vals.saved).toFixed(1)),
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }

    if (viewType === "weekly") {
      const groups: Record<string, Record<string, number>> = {};
      logs.forEach((log) => {
        const weekKey = getYearWeek(log.date); // "YYYY-WXX"
        if (!groups[weekKey]) {
          groups[weekKey] = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0, saved: 0 };
        }
        if (log.kg_co2 < 0) {
          groups[weekKey].saved += Math.abs(log.kg_co2);
        } else {
          groups[weekKey][log.category] = (groups[weekKey][log.category] || 0) + log.kg_co2;
        }
      });

      return Object.entries(groups)
        .map(([key, vals]) => {
          const parts = key.split("-W");
          return {
            label: `Wk ${parts[1]} (${parts[0]})`,
            sortKey: key,
            ...vals,
            gross: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel).toFixed(1)),
            net: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel - vals.saved).toFixed(1)),
          };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .slice(-8); // Show last 8 weeks limit
    }

    // Default or Daily
    const groups: Record<string, Record<string, number>> = {};
    // Pad last 7 days with zeros if empty logs
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      groups[dateKey] = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0, saved: 0 };
    }

    logs.forEach((log) => {
      const dateKey = log.date;
      if (!groups[dateKey]) {
        groups[dateKey] = { transport: 0, diet: 0, energy: 0, shopping: 0, travel: 0, saved: 0 };
      }
      if (log.kg_co2 < 0) {
        groups[dateKey].saved += Math.abs(log.kg_co2);
      } else {
        groups[dateKey][log.category] = (groups[dateKey][log.category] || 0) + log.kg_co2;
      }
    });

    return Object.entries(groups)
      .map(([key, vals]) => ({
        label: formatDateLabel(key),
        sortKey: key,
        ...vals,
        gross: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel).toFixed(1)),
        net: Number((vals.transport + vals.diet + vals.energy + vals.shopping + vals.travel - vals.saved).toFixed(1)),
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12); // Last 12 days
  }, [logs, viewType]);

  // Aggregate stats across all logs
  const categorySummaryStats = useMemo(() => {
    let transport = 0;
    let diet = 0;
    let energy = 0;
    let shopping = 0;
    let travel = 0;
    let saved = 0;

    logs.forEach((log) => {
      if (log.kg_co2 < 0) {
        saved += Math.abs(log.kg_co2);
      } else {
        if (log.category === "transport") transport += log.kg_co2;
        else if (log.category === "diet") diet += log.kg_co2;
        else if (log.category === "energy") energy += log.kg_co2;
        else if (log.category === "shopping") shopping += log.kg_co2;
        else if (log.category === "travel") travel += log.kg_co2;
      }
    });

    const totalGross = transport + diet + energy + shopping + travel;
    const items = [
      { id: "transport", name: "Transport", value: Number(transport.toFixed(1)), color: CATEGORY_META.transport.color, percentage: totalGross > 0 ? Math.round((transport / totalGross) * 100) : 0 },
      { id: "diet", name: "Diet & Food", value: Number(diet.toFixed(1)), color: CATEGORY_META.diet.color, percentage: totalGross > 0 ? Math.round((diet / totalGross) * 100) : 0 },
      { id: "energy", name: "Home Energy", value: Number(energy.toFixed(1)), color: CATEGORY_META.energy.color, percentage: totalGross > 0 ? Math.round((energy / totalGross) * 100) : 0 },
      { id: "shopping", name: "Shopping", value: Number(shopping.toFixed(1)), color: CATEGORY_META.shopping.color, percentage: totalGross > 0 ? Math.round((shopping / totalGross) * 100) : 0 },
      { id: "travel", name: "Travel & Hotels", value: Number(travel.toFixed(1)), color: CATEGORY_META.travel.color, percentage: totalGross > 0 ? Math.round((travel / totalGross) * 100) : 0 },
    ];

    return {
      items: items.filter(i => i.value > 0 || viewType === "category"), // Show all if in category view
      totalGross: Number(totalGross.toFixed(1)),
      totalNet: Number((totalGross - saved).toFixed(1)),
      totalSaved: Number(saved.toFixed(1)),
    };
  }, [logs, viewType]);

  // Baseline threshold comparator (if monthly view, use raw profile value; if daily view, divide monthly by 30)
  const baselineLimit = useMemo(() => {
    if (!profile) return 600; // standard default
    const base = profile.baseline_kg_co2_monthly;
    if (viewType === "monthly") return base;
    if (viewType === "weekly") return Number((base / 4.3).toFixed(1));
    return Number((base / 30).toFixed(1)); // daily target
  }, [profile, viewType]);

  // Check if daily emissions exceed the daily target limit
  const isExceeded = useMemo(() => {
    if (!profile || !logs || logs.length === 0) return false;
    const dailyTarget = Number((profile.baseline_kg_co2_monthly / 30).toFixed(1));
    
    const dailyTotals: Record<string, number> = {};
    logs.forEach(log => {
      // Gross daily emission calculation (excluding native carbon offset logs)
      if (log.kg_co2 > 0) {
        dailyTotals[log.date] = (dailyTotals[log.date] || 0) + log.kg_co2;
      }
    });

    return Object.values(dailyTotals).some(total => total > dailyTarget);
  }, [logs, profile]);

  // Trigger toast warning when threshold is exceeded on any calendar day
  useEffect(() => {
    if (!profile || !logs || logs.length === 0 || !triggerToast) return;
    
    const dailyTarget = Number((profile.baseline_kg_co2_monthly / 30).toFixed(1));
    
    // Group daily gross emissions
    const dailyTotals: Record<string, number> = {};
    logs.forEach(log => {
      if (log.kg_co2 > 0) {
        dailyTotals[log.date] = (dailyTotals[log.date] || 0) + log.kg_co2;
      }
    });

    const exceedingDays = Object.entries(dailyTotals).filter(([_, total]) => total > dailyTarget);
    
    if (exceedingDays.length > 0) {
      const sorted = exceedingDays.sort((a, b) => b[0].localeCompare(a[0]));
      const [recentDate, value] = sorted[0];
      
      // Prevent repeated loop triggers if values haven't changed
      if (recentDate !== lastNotifiedDay || Math.abs(value - lastNotifiedValue) > 0.05) {
        setLastNotifiedDay(recentDate);
        setLastNotifiedValue(value);
        
        let formattedDate = recentDate;
        try {
          formattedDate = new Date(recentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch (e) {}

        triggerToast(
          `High Emission Warning: Daily emissions reached ${value.toFixed(1)} kg CO₂ on ${formattedDate}, exceeding your daily target limit of ${dailyTarget} kg!`,
          "error"
        );
      }
    }
  }, [logs, profile, triggerToast, lastNotifiedDay, lastNotifiedValue]);

  // Handle active category selection in custom rendering
  const handlePieHover = (_: any, index: number) => {
    setActiveCategory(categorySummaryStats.items[index]?.id || null);
  };

  const getCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      if (!data) return null;

      const gross = data.gross ?? 0;
      const saved = data.saved ?? 0;
      const net = data.net ?? 0;

      // Extract details for sectors
      const sectors = [
        { key: "transport", label: CATEGORY_META.transport.label, color: CATEGORY_META.transport.color },
        { key: "diet", label: CATEGORY_META.diet.label, color: "#10b981" }, // fallback hex for var() in SVG styling
        { key: "energy", label: CATEGORY_META.energy.label, color: CATEGORY_META.energy.color },
        { key: "shopping", label: CATEGORY_META.shopping.label, color: CATEGORY_META.shopping.color },
        { key: "travel", label: CATEGORY_META.travel.label, color: CATEGORY_META.travel.color },
      ];

      const activeSectors = sectors.map(s => {
        const val = Number((data[s.key] || 0).toFixed(1));
        return { ...s, val };
      }).filter(s => s.val > 0);

      const statusExceeded = baselineLimit > 0 && gross > baselineLimit;

      return (
        <div className="bg-slate-950 text-white p-4 border border-slate-800 rounded-2xl shadow-xl text-xs leading-relaxed max-w-[260px] min-w-[200px] font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-black text-slate-200 uppercase tracking-tight">{label}</span>
            {baselineLimit > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                statusExceeded ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {statusExceeded ? "Over Limit" : "Target Met"}
              </span>
            )}
          </div>

          {/* Sum Stats */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Gross Footprint
              </span>
              <span className="font-mono font-bold text-slate-100">{gross.toFixed(1)} kg</span>
            </div>

            {saved > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  CO₂ Mitigated
                </span>
                <span className="font-mono font-bold">-{saved.toFixed(1)} kg</span>
              </div>
            )}

            <div className="flex justify-between items-center font-bold text-white bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Net Impact
              </span>
              <span className="font-mono text-[#ccff00]">{net.toFixed(1)} kg</span>
            </div>
          </div>

          {/* Sector Breakdown */}
          {activeSectors.length > 0 && (
            <div className="border-t border-slate-800 pt-2.5 mt-2.5 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sector Breakdown</p>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {activeSectors.map((sector) => {
                  const pct = gross > 0 ? Math.round((sector.val / gross) * 100) : 0;
                  return (
                    <div key={sector.key} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full border border-slate-950/25 shrink-0" style={{ backgroundColor: sector.color }} />
                        <span>{sector.label}</span>
                        {pct > 0 && <span className="text-[9px] text-slate-500 font-mono">({pct}%)</span>}
                      </span>
                      <span className="font-mono font-semibold text-slate-100">{sector.val.toFixed(1)} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Target Reference */}
          {baselineLimit > 0 && (
            <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between text-[10px] text-slate-500 font-medium font-sans">
              <span>Goal Target Limit:</span>
              <span className="font-mono text-slate-300 font-semibold">{baselineLimit} kg</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="carbon_footprint_analysis_card" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:border-emerald-200 transition-colors duration-300">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 px-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time Carbon Ledger</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 flex flex-wrap items-center gap-2">
            Emissions & Savings Trajectory
            {isExceeded && (
              <span id="high-emission-warning-badge" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-200 animate-pulse">
                ⚠️ High Emission Warning
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">
            {viewType === "category" 
              ? "Total direct emission allocation per sector" 
              : `Tracking CO₂ footprint over time versus target baseline of ${baselineLimit} kg`}
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start md:self-auto text-xs">
          <button
            id="tab_view_daily"
            onClick={() => setViewType("daily")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewType === "daily" 
                ? "bg-white text-emerald-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daily
          </button>
          <button
            id="tab_view_weekly"
            onClick={() => setViewType("weekly")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewType === "weekly" 
                ? "bg-white text-emerald-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Weekly
          </button>
          <button
            id="tab_view_monthly"
            onClick={() => setViewType("monthly")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewType === "monthly" 
                ? "bg-white text-emerald-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            id="tab_view_category"
            onClick={() => setViewType("category")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewType === "category" 
                ? "bg-white text-emerald-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)]" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3 h-3" />
            Sector Breakdown
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/55 rounded-2xl border border-dashed border-slate-200">
          <Leaf className="w-10 h-10 text-emerald-400 mb-2.5 animate-bounce" />
          <p className="font-semibold text-slate-700 text-sm">No Carbon Records Yet</p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Complete the lifestyle survey or start adding activities using the quick logger or chatbot to plot your curves!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart Column */}
          <div className="lg:col-span-8">
            <div className="w-full h-[280px] relative">
              <AnimatePresence mode="wait">
                {viewType === "category" ? (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySummaryStats.items}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          onMouseEnter={handlePieHover}
                          onMouseLeave={() => setActiveCategory(null)}
                          isAnimationActive={true}
                          animationDuration={800}
                        >
                          {categorySummaryStats.items.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              opacity={activeCategory && activeCategory !== entry.id ? 0.6 : 1}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} kg CO₂`, "Emissions"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : viewType === "monthly" ? (
                  <motion.div
                    key="monthly"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          unit="kg"
                        />
                        <Tooltip content={getCustomTooltip} cursor={{ fill: '#f8fafc' }} />
                        <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, color: '#475569' }} />
                        
                        {isExceeded && (
                          <ReferenceLine 
                            y={baselineLimit} 
                            stroke="#ef4444" 
                            strokeDasharray="4 4" 
                            strokeWidth={2}
                            label={{ 
                              value: `HIGH LIMIT: ${baselineLimit} kg`, 
                              fill: "#ef4444", 
                              position: "top", 
                              fontSize: 9, 
                              fontWeight: "bold" 
                            }} 
                          />
                        )}

                        {/* Stacked Categories */}
                        <Bar dataKey="transport" stackId="emissions" name="transport" fill={CATEGORY_META.transport.color} radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        <Bar dataKey="diet" stackId="emissions" name="diet" fill={CATEGORY_META.diet.color} radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        <Bar dataKey="energy" stackId="emissions" name="energy" fill={CATEGORY_META.energy.color} radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        <Bar dataKey="shopping" stackId="emissions" name="shopping" fill={CATEGORY_META.shopping.color} radius={[0, 0, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        <Bar dataKey="travel" stackId="emissions" name="travel" fill={CATEGORY_META.travel.color} radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={800} />
                        
                        {/* Savings Indicator Bar */}
                        <Bar dataKey="saved" name="saved" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={30} isAnimationActive={true} animationDuration={800} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <motion.div
                    key="time-series"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-emerald-500)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--color-emerald-500)" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10 }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          unit="kg"
                        />
                        <Tooltip content={getCustomTooltip} />
                        
                        {isExceeded && (
                          <ReferenceLine 
                            y={baselineLimit} 
                            stroke="#ef4444" 
                            strokeDasharray="4 4" 
                            strokeWidth={2}
                            label={{ 
                              value: `HIGH LIMIT: ${baselineLimit} kg`, 
                              fill: "#ef4444", 
                              position: "top", 
                              fontSize: 9, 
                              fontWeight: "bold" 
                            }} 
                          />
                        )}

                        {/* Reference Line for Target Baseline */}
                        <Area 
                          type="monotone" 
                          dataKey="gross" 
                          name="Gross Emissions" 
                          stroke="var(--color-emerald-500)" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#colorGross)" 
                          isAnimationActive={true}
                          animationDuration={800}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="saved" 
                          name="Mitigated (Actions)" 
                          stroke="#22c55e" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4" 
                          fillOpacity={1} 
                          fill="url(#colorSaved)" 
                          isAnimationActive={true}
                          animationDuration={800}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="net" 
                          name="Net Emissions" 
                          stroke="#0f172a" 
                          strokeWidth={2.5} 
                          dot={{ r: 3, fill: "#0f172a" }} 
                          isAnimationActive={true}
                          animationDuration={800}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Legend Companion for Sector Breakdown */}
            {viewType !== "category" && (
              <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
                <span className="text-[10px] text-slate-400 font-mono">LEGEND:</span>
                {Object.entries(CATEGORY_META).map(([key, item]) => (
                  <span key={key} className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Savings Card
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <span className="w-4 h-0.5 bg-slate-900 inline-block align-middle" />
                  Net Curve
                </span>
              </div>
            )}
          </div>

          {/* Statistics Stats Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Summative Metrics
              </h4>
              
              <div className="space-y-3">
                {/* Total Gross block */}
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Co₂ Emitted</p>
                    <p className="text-lg font-extrabold text-slate-800 font-mono">{categorySummaryStats.totalGross} <span className="text-[10px] font-sans font-medium text-slate-500">kg</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-mono text-sm font-semibold">
                    CO₂
                  </div>
                </div>

                {/* Mitigated / Savings block */}
                <div className="bg-emerald-50/50 p-3 rounded-2xl flex items-center justify-between border border-emerald-50">
                  <div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Total Saved</p>
                    <p className="text-lg font-extrabold text-emerald-700 font-mono">-{categorySummaryStats.totalSaved} <span className="text-[10px] font-sans font-medium text-emerald-600">kg</span></p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/60 flex items-center justify-center text-emerald-700">
                    <Leaf className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {/* Net Carbon balance */}
                <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Environmental Balance</p>
                    <p className="text-lg font-extrabold font-mono text-emerald-400">{categorySummaryStats.totalNet} <span className="text-[10px] font-sans font-medium text-slate-200">kg</span></p>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    <div>vs Baseline</div>
                    <div className="font-bold font-mono">{categorySummaryStats.totalNet > baselineLimit ? "▲ Over" : "▼ Under"} Target</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic visual progress indicators */}
            <div className="mt-5 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sector Allocation Breakdown</p>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {categorySummaryStats.items.map((item) => {
                  const meta = CATEGORY_META[item.id as keyof typeof CATEGORY_META];
                  const Icon = meta?.icon || Leaf;
                  return (
                    <div key={item.id} className="text-xs group">
                      <div className="flex items-center justify-between mb-0.5 text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          <span className="group-hover:text-slate-900 transition-colors">{item.name}</span>
                        </span>
                        <span className="font-mono">{item.value} kg ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
