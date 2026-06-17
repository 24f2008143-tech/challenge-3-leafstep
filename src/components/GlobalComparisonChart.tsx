/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Sparkles, 
  Plane, 
  Trees, 
  HelpCircle, 
  TrendingDown, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Layers
} from "lucide-react";
import { UserProfile } from "../types";

interface GlobalComparisonChartProps {
  userBaselineTonne: number;
  profile: UserProfile | null;
}

export default function GlobalComparisonChart({ userBaselineTonne, profile }: GlobalComparisonChartProps) {
  // Simulation mode: steady (100%), breeze (85%), gale (55%)
  const [simulationMode, setSimulationMode] = useState<"steady" | "breeze" | "gale">("steady");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Dynamic simulation scaling
  const simulationFactor = useMemo(() => {
    if (simulationMode === "breeze") return 0.85; // 15% reduction
    if (simulationMode === "gale") return 0.55;  // 45% reduction
    return 1.0;
  }, [simulationMode]);

  const simulatedUserTonne = Number((userBaselineTonne * simulationFactor).toFixed(1));

  // Seeds for Country / Benchmark statistics
  const benchmarksList = useMemo(() => [
    { country: "United States", amount: 14.9, color: "#f87171", desc: "Heavy fossil electricity & car commuting grid", isUser: false },
    { country: "Germany", amount: 8.1, color: "#f59e0b", desc: "Industrial center shifting to clean wind/solar", isUser: false },
    { country: "China", amount: 8.0, color: "#f59e0b", desc: "Rapid grid construction & production hub", isUser: false },
    { country: "Global Average", amount: 4.7, color: "#f59e0b", desc: "Average planetary emission per citizen", isUser: false },
    { country: "India", amount: 1.9, color: "#10b981", desc: "Low per-capita but high industrial expansion", isUser: false },
    { country: "Planetary Sustainable Limit", amount: 1.5, color: "#10b981", desc: "Target ceiling to halt runaway planetary warming", isUser: false },
  ], []);

  // Inject user at their current sorted rank position
  const comparativeItems = useMemo(() => {
    const userItem = {
      country: "You (Projected)",
      amount: simulatedUserTonne,
      color: "#10b981", // vibrant brand green
      desc: profile?.archetype 
        ? `Your '${profile.archetype}' profile mapped to selected activities`
        : "Your current carbon run-rate projection",
      isUser: true
    };

    const combined = [...benchmarksList, userItem];
    // Sort descending by emission amount
    return combined.sort((a, b) => b.amount - a.amount);
  }, [simulatedUserTonne, benchmarksList, profile]);

  // Max value to calibrate scale
  const maxVal = useMemo(() => {
    return Math.max(...comparativeItems.map(item => item.amount), 16);
  }, [comparativeItems]);

  // Helper color map for tracking pin based on simulated value
  const pinDetails = useMemo(() => {
    if (simulatedUserTonne <= 1.5) {
      return {
        colorClass: "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40",
        label: "Eco-Hero Tier 🏆",
        hex: "#10b981"
      };
    }
    if (simulatedUserTonne <= 4.7) {
      return {
        colorClass: "bg-teal-500 border-teal-400 text-white shadow-teal-500/40",
        label: "Moderate Safe Tier",
        hex: "#14b8a6"
      };
    }
    if (simulatedUserTonne <= 8.5) {
      return {
        colorClass: "bg-amber-500 border-amber-400 text-slate-900 shadow-amber-500/40",
        label: "Warning Zone ⚠️",
        hex: "#f59e0b"
      };
    }
    return {
      colorClass: "bg-rose-500 border-rose-400 text-white shadow-rose-500/40",
      label: "Heavy Grid Dependence 🚨",
      hex: "#f43f5e"
    };
  }, [simulatedUserTonne]);

  // Find user rank index
  const userRankIdx = comparativeItems.findIndex(item => item.isUser);

  // Dynamic Contextual Insight based on simulated carbon footprint
  const dynamicAIInsight = useMemo(() => {
    let positionText = "";
    if (simulatedUserTonne >= 14.9) {
      positionText = "exceeds the average United States citizen profile.";
    } else if (simulatedUserTonne >= 8.1) {
      positionText = "places you between the average German (8.1t) and US (14.9t) citizen.";
    } else if (simulatedUserTonne >= 4.7) {
      positionText = "places you between the Global Average (4.7t) and Germany (8.1t) range.";
    } else if (simulatedUserTonne >= 1.9) {
      positionText = "places you below the Global Average, nesting comfortably near India (1.9t).";
    } else if (simulatedUserTonne >= 1.5) {
      positionText = "is extraordinary, resting incredibly close to the sustainable safe limit.";
    } else {
      positionText = "is fully carbon-equilibrium sustainable. You are below the Planetary Sustainable Limit!";
    }

    const treesToOffset = Math.max(0, Math.round(simulatedUserTonne * 45));
    const nextLimitDiff = Math.abs(simulatedUserTonne - 1.5).toFixed(1);

    return {
      text: `Your projected simulation footprint of ${simulatedUserTonne} tonnes ${positionText} Dropping commuter vehicle miles by 15% would move your ranking indicator to a cleaner threshold, sparing emissions equivalent to nursing ${treesToOffset} trees.`,
      trees: treesToOffset,
      diffToLimit: nextLimitDiff
    };
  }, [simulatedUserTonne]);

  // What-If insights based on hovered target comparison
  const coachWhatIfInsight = useMemo(() => {
    const selectedIdx = hoveredIndex !== null ? hoveredIndex : (userRankIdx + 1 < comparativeItems.length ? userRankIdx + 1 : userRankIdx);
    const targetItem = comparativeItems[selectedIdx];
    
    if (!targetItem) return null;

    if (targetItem.isUser) {
      return {
        country: "yourself",
        amount: targetItem.amount,
        text: `You're currently projected at ${targetItem.amount} tonnes/year under "${simulationMode.toUpperCase()}" mode. Hover over adjacent benchmarks to see your tactical targets.`,
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      };
    }

    const diff = Math.abs(simulatedUserTonne - targetItem.amount);
    
    if (simulatedUserTonne > targetItem.amount) {
      // User is worse
      let suggestion = "";
      if (targetItem.country === "Germany" || targetItem.country === "China") {
        suggestion = "Replacing petrol trips with train rides or reducing meat consumption gets your profile into European standards.";
      } else if (targetItem.country === "Global Average") {
        suggestion = "Installing energy-saving lights, air drying laundry, and adopting meatless weekdays will bridge this gap quickly.";
      } else if (targetItem.country === "Planetary Sustainable Limit" || targetItem.country === "India") {
        suggestion = "To reach our holy-grail climate harmony target, support local direct air-capture offsets or transition to zero-emission solar home microgrids.";
      } else {
        suggestion = "Every targeted micro-action on your Dashboard helps chip away at your remaining carbon deficit.";
      }

      return {
        country: targetItem.country,
        amount: targetItem.amount,
        text: `You are ${diff.toFixed(1)} tonnes above the ${targetItem.country} line. ${suggestion}`,
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
      };
    } else {
      // User is better (lower emissions)
      return {
        country: targetItem.country,
        amount: targetItem.amount,
        text: `Incredible! Your active commitments place you ${diff.toFixed(1)} tonnes below the average citizen in ${targetItem.country}. This scale demonstrates real, systemic progress.`,
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-emerald-800"
      };
    }
  }, [comparativeItems, hoveredIndex, simulatedUserTonne, simulationMode, userRankIdx]);

  // Contextual Equivalencies
  const equivalents = useMemo(() => {
    const flights = Number((simulatedUserTonne * 0.51).toFixed(1));
    const treeCount = Math.max(0, Math.round((simulatedUserTonne - 1.5) * 45));
    const smartBulbsYear = Math.round(simulatedUserTonne * 25);

    return [
      {
        icon: Plane,
        label: "Aviation Equivalence",
        metric: `≈ ${flights} Long Flights`,
        sub: "Round-trip transoceanic flights annually per-capita",
        desc: "Long-range high-altitude jets release massive nitrous heat loads."
      },
      {
        icon: Trees,
        label: "Forest Mitigation Need",
        metric: `≈ ${treeCount} Mature Trees`,
        sub: "Needed annually to pull your extra carbon from the atmosphere",
        desc: "Each mature tree bio-sequesters roughly 22kg of gaseous CO₂ per year."
      }
    ];
  }, [simulatedUserTonne]);

  return (
    <div className="space-y-6 font-sans">
      {/* Simulation modeling panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-2 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-black">
                Interactive Simulator
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click modes to simulate lifestyle changes</span>
            </div>
            <h4 className="text-xl font-black text-slate-100 flex items-center gap-2 tracking-tight">
              Action modeling sandbox
              {simulationMode !== "steady" && (
                <span className="text-xs text-emerald-400 font-bold animate-pulse">
                  (Simulated -{simulationMode === "breeze" ? "15%" : "45%"})
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-400 max-w-lg mt-1 font-medium leading-relaxed">
              Model environmental progress in real-time. Watch how small commuter changes ("Breeze") or aggressive carbon-intelligent micro-actions ("Gale") shift your standing relative to global nations.
            </p>
          </div>

          {/* Simulation Toggle Buttons */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shrink-0 shadow-inner">
            {(["steady", "breeze", "gale"] as const).map((mode) => {
              const labelMap = { steady: "Steady (100%)", breeze: "Breeze (-15%)", gale: "Gale (-45%)" };
              const colorMap = {
                steady: "text-slate-300",
                breeze: "text-emerald-300 hover:text-emerald-200",
                gale: "text-cyan-300 hover:text-cyan-200"
              };
              const activeBg = {
                steady: "bg-slate-800 border-slate-700 text-white shadow-md",
                breeze: "bg-emerald-600 border-emerald-500/30 text-white shadow-emerald-900/50",
                gale: "bg-cyan-600 border-cyan-500/30 text-slate-900 font-black shadow-cyan-900/50"
              };

              const isActive = simulationMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSimulationMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-300 border-none cursor-pointer tracking-tight ${
                    isActive ? activeBg[mode] : `${colorMap[mode]} bg-transparent hover:bg-slate-900`
                  }`}
                >
                  {labelMap[mode]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Big Number Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulated Footprint</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-3xl font-black text-[#ccff00]">{simulatedUserTonne}</span>
              <span className="text-xs text-slate-400 font-semibold font-sans">tonnes CO₂e / year</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Extrapolated from your active ledger habits.</p>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Relative Standings</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-extrabold text-slate-200">
                Better than {benchmarksList.filter(b => b.amount > simulatedUserTonne).length} of {benchmarksList.length}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 leading-normal">
              {simulatedUserTonne < 4.7 
                ? "🏆 Below Global Average! Excellent ecological stewardship."
                : "⚡ Working towards aligning with the global baseline."}
            </span>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gap to Sustainable Target</span>
            <div className="flex items-baseline gap-1 mt-1">
              {simulatedUserTonne <= 1.5 ? (
                <span className="font-mono text-2xl font-black text-emerald-400">TARGET ACCOMPLISHED</span>
              ) : (
                <>
                  <span className="font-mono text-3xl font-black text-red-400">+{(simulatedUserTonne - 1.5).toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-semibold">tonnes over limit</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Planetary Sustainable Limit is capped at 1.5 tonnes / capita.</p>
          </div>
        </div>
      </div>

      {/* COMPARISON CHART PANEL - STACKED BAR GRAPH WITH YOU INDICATOR */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-black text-[#1c3f2d] uppercase tracking-wider block">Global Distribution Spectrum</span>
            <p className="text-xs text-slate-500 font-medium">Click or hover over any country bar to interactively adjust "What-If" prediction tracks.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-1 px-3 border border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? "Hide Details" : "Show Scale Details"}</span>
          </button>
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50/50 border border-emerald-100 text-[11px] text-[#1c3f30] rounded-2xl p-4 mb-4 leading-relaxed font-semibold overflow-hidden"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-extrabold mb-1">Humanity's Common Carbon Goal:</h5>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Per standard IPCC emissions modeling trajectories, holding industrial warming beneath 1.5°C commands stabilizing per-capita human signatures at approximately <strong>1.5 tonnes annually</strong>. Current Western industrial infrastructures operate heavy per-capita excesses (8 to 15 tonnes).
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPARISON BARS */}
        <div className="space-y-6 relative pb-10 min-h-[360px]">
          
          {/* Vertical sustainable limit line helper */}
          <div className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-dashed border-emerald-400/80 z-10" style={{ left: `${(1.5 / maxVal) * 100}%` }}>
            <span className="absolute bottom-2 left-2 translate-y-1.5 whitespace-nowrap bg-emerald-600 text-white font-mono font-black text-[8px] uppercase px-2 py-0.5 rounded shadow-md flex items-center gap-1 z-30">
              <span>🌿</span>
              <span>Planetary Goal (1.5t)</span>
            </span>
          </div>

          {/* Dynamic "YOU ARE HERE" Tracking Pin and Overlap Indicator line */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-dashed transition-all duration-500 ease-out z-20" 
            style={{ 
              left: `${(simulatedUserTonne / maxVal) * 100}%`,
              borderColor: pinDetails.hex
            }}
          >
            {/* The Pulsing Accent Pin Flag */}
            <div className="absolute top-2 -translate-x-1/2 whitespace-nowrap z-30 flex flex-col items-center select-none shadow-xl transition-all duration-500">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all duration-500 ${pinDetails.colorClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>YOU: {simulatedUserTonne}t</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-12">
            {comparativeItems.map((item, idx) => {
              const isBetter = item.amount < simulatedUserTonne;
              const widthPct = Math.min(100, (item.amount / maxVal) * 100);
              const isUser = item.isUser;
              
              // Leaf indicator next to Planetary Sustainable Limit
              const hasLeafIcon = item.country === "Planetary Sustainable Limit";
              
              return (
                <div 
                  key={idx} 
                  className={`group relative space-y-1.5 transition-all duration-300 p-2.5 rounded-2xl cursor-pointer ${
                    isUser 
                      ? "bg-emerald-50/40 border border-emerald-200/50 shadow-[0_4px_24px_-10px_rgba(16,185,129,0.2)]" 
                      : hoveredIndex === idx 
                        ? "bg-slate-50 border border-slate-200/50" 
                        : "bg-transparent border border-transparent"
                  }`}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1.5">
                      {isUser ? (
                        <>
                          <span className="w-2 rounded-full h-2 bg-emerald-500 animate-pulse relative shrink-0" />
                          <span className="font-extrabold text-[#112a1f] flex items-center gap-1">
                            You (Projected standing)
                            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-[8px] text-white uppercase font-black font-mono tracking-wider ml-1">
                              {simulationMode.toUpperCase()}
                            </span>
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-700 flex items-center gap-1">
                          {hasLeafIcon && <span className="text-emerald-500">🌿</span>}
                          {item.country}
                        </span>
                      )}

                      {/* Better than User indicator badge */}
                      {!isUser && isBetter && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded bg-emerald-100 border border-emerald-200/40 text-[9px] font-bold text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Goal Track</span>
                        </span>
                      )}
                    </span>

                    <span className="font-mono text-slate-900 font-bold flex items-center gap-1">
                      {item.amount.toFixed(1)} <sub className="bottom-0.5 text-[8px] font-sans text-slate-400 font-medium">tonnes</sub>
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                    {/* The bar content */}
                    <motion.div 
                      className={`h-full rounded-full flex items-center justify-end pr-3 font-mono text-[9px] text-white font-black overflow-hidden relative`}
                      style={{ 
                        backgroundColor: isUser ? pinDetails.hex : item.color,
                        boxShadow: isUser ? `0 0 14px ${pinDetails.hex}60` : "none"
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 14 }}
                    >
                      {widthPct > 15 && (
                        <span className="relative z-10 drop-shadow-sm">{widthPct.toFixed(0)}% scale</span>
                      )}
                    </motion.div>

                    {/* Dotted target path helper for values exceed sustainable limits */}
                    {!isUser && !isBetter && (
                      <div className="absolute right-0 top-0 bottom-0 pointer-events-none flex items-center pr-3">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                          Target line
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-medium">
                      {isUser && profile?.archetype ? (
                        <span className="text-emerald-700 font-bold">
                          Archetype Match: {profile.archetype === "Commuter Heavyweight" 
                            ? "Your heavy driving profile maps closest to fossil electric grids." 
                            : `Typical carbon signature for profile type: ${profile.archetype}`}
                        </span>
                      ) : (
                        item.desc
                      )}
                    </span>
                    {/* Relative offset comparison helper */}
                    {!isUser && (
                      <span className="text-[9px] font-semibold text-slate-500">
                        {simulatedUserTonne > item.amount 
                          ? `+${(simulatedUserTonne - item.amount).toFixed(1)} tonnes above limit` 
                          : `-${(item.amount - simulatedUserTonne).toFixed(1)} tonnes cleaner`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIGH IMPACT DYNAMIC INSIGHTS PANEL (InsightAgent layer) */}
        <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/50 flex gap-3 my-4">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-800 font-black uppercase tracking-wider block">InsightAgent AI Summary</span>
            <p className="text-xs text-[#1c3f30] font-semibold leading-relaxed">
              💡 {dynamicAIInsight.text}
            </p>
          </div>
        </div>

        {/* AI COACH DYNAMIC WHAT-IF POPUP CONTEXT */}
        <AnimatePresence mode="wait">
          {coachWhatIfInsight && (
            <motion.div 
              key={coachWhatIfInsight.country}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="mt-6 p-4 bg-slate-950 text-slate-300 rounded-3xl border border-dashed border-slate-800 relative shadow-inner"
            >
              <div className="absolute top-3 right-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase font-black">AI Prediction</span>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center shrink-0 shadow-lg mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Leafstep Advisor Coaching</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full border border-slate-800 text-slate-400 font-medium">
                      Advice relative to: <strong className="text-emerald-300">{coachWhatIfInsight.country}</strong>
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-slate-300">
                    {coachWhatIfInsight.text}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTEXTUAL EQUIVALENCE GRID CARD */}
      <div className="bg-[#fafafa] border border-slate-200/60 rounded-3xl p-5 shadow-inner">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Layers className="w-4.5 h-4.5 text-emerald-600" />
          <h5 className="text-xs font-extrabold text-[#1a3829] uppercase tracking-wider">
            Real-world Cognitive Translations (Delta breakdown)
          </h5>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {equivalents.map((eq, i) => {
            const IconComponent = eq.icon;
            return (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2 hover:shadow-md transition">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">
                      {eq.label}
                    </span>
                    <span className="font-mono text-base font-black text-slate-800">
                      {eq.metric}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal pt-1">
                  {eq.sub}: <strong className="text-slate-700">{eq.desc}</strong>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
