import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, 
  Zap, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Trees, 
  Droplet, 
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Heart
} from "lucide-react";

interface InteractiveIntelTreeProps {
  userStreak: number;
  userLp: number;
  carbonIq: number;
  onStateUpdate: (updatedState: any) => void;
  triggerToast: (msg: string, type?: "success" | "info" | "error") => void;
}

interface TreeMetric {
  id: string;
  label: string;
  number: string;
  unit: string;
  vibe: string;
  icon: React.ComponentType<any>;
  desc: string;
  zDesc: string; // Gen-Z translation
  x: number; // SVG coordinates for the fruit/branch
  y: number;
  color: string;
  neonShadow: string;
  actionDoneKey: string;
}

export default function InteractiveIntelTree({ 
  userStreak, 
  userLp, 
  carbonIq, 
  onStateUpdate, 
  triggerToast 
}: InteractiveIntelTreeProps) {
  const [activeMetricId, setActiveMetricId] = useState<string>("co2");
  const [nourishedNodes, setNourishedNodes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nourished_nodes_2026");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [nourishLoading, setNourishLoading] = useState(false);

  const metrics: TreeMetric[] = [
    {
      id: "co2",
      label: "Global CO₂ Concentration",
      number: "426.8",
      unit: "ppm",
      vibe: "Peak Spicy 🥵",
      icon: Flame,
      desc: "Our atmosphere's current carbon load. Normal historical levels are under 350 ppm. Over 425 is serious.",
      zDesc: "The sky is literally operating on 100% spice mode. It's giving greenhouse drama. We need to cool it down, stat.",
      x: 100,
      y: 90,
      color: "#ef4444",
      neonShadow: "shadow-[0_0_15px_rgba(239,68,68,0.7)]",
      actionDoneKey: "nourished_co2",
    },
    {
      id: "solar",
      label: "Marine Solar Capacity",
      number: "140",
      unit: "GWp",
      vibe: "Infinite Energy Glitch ⚡",
      icon: Zap,
      desc: "Floating ocean solar panels are growing exponentially across oceanic shorelines, shifting grids to clean electrons.",
      zDesc: "Skins unlocked: Maritime photovoltaics are eating the fossil grid and leaving no crumbs. Truly a legendary renewable setup.",
      x: 220,
      y: 75,
      color: "#eab308",
      neonShadow: "shadow-[0_0_15px_rgba(234,179,8,0.7)]",
      actionDoneKey: "nourished_solar",
    },
    {
      id: "planet_limit",
      label: "Planetary Budget",
      number: "1.5",
      unit: "tonnes/yr",
      vibe: "Main Character Target 🎯",
      icon: Globe,
      desc: "The absolute per-person annual carbon budget to stop global warming from hitting the catastrophic 1.5°C threshold.",
      zDesc: "The strict target you need to unlock to run a perfect simulation of saving the planet. Anything more is NPC energy.",
      x: 300,
      y: 140,
      color: "#10b981",
      neonShadow: "shadow-[0_0_15px_rgba(16,185,129,0.7)]",
      actionDoneKey: "nourished_limit",
    },
    {
      id: "streak",
      label: "Your Active Habit Streak",
      number: `${userStreak}`,
      unit: "days",
      vibe: "Cooking on Fire 🔥",
      icon: Heart,
      desc: "Your daily continuous actions logged in Leafstep, directly preserving local community ecosystems.",
      zDesc: "You are currently on a server-validated high streak. No skips, pure focus. Keep cooking and don’t let it blow away!",
      x: 120,
      y: 190,
      color: "#fb923c",
      neonShadow: "shadow-[0_0_15px_rgba(251,146,60,0.7)]",
      actionDoneKey: "nourished_streak",
    },
    {
      id: "carbon_iq",
      label: "Your Climate Intelligence",
      number: `${carbonIq}%`,
      unit: "IQ",
      vibe: "Galaxy Brain Active 🧠",
      icon: Trees,
      desc: "Calculated based on your accuracy in the Daily Carbon Sorter and deep conversations with AI Climate Coach.",
      zDesc: "Literally running a 200 IQ carbon optimization matrix. You can spot a high-emissions greenwash from a mile away.",
      x: 270,
      y: 220,
      color: "#a855f7",
      neonShadow: "shadow-[0_0_15px_rgba(168,85,247,0.7)]",
      actionDoneKey: "nourished_iq",
    }
  ];

  const handleNourish = async (metric: TreeMetric) => {
    if (nourishedNodes[metric.id]) {
      triggerToast("Already nourished today! This branch is perfectly blooming! 🌱", "info");
      return;
    }

    setNourishLoading(true);
    try {
      const rewardPoints = 25; // Good hefty boost!
      const res = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: rewardPoints,
          reason: `nourish_tree_${metric.id}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data.state);
        
        const updated = { ...nourishedNodes, [metric.id]: true };
        setNourishedNodes(updated);
        localStorage.setItem("nourished_nodes_2026", JSON.stringify(updated));

        triggerToast(`💦 Bloomed ${metric.label}! You got +${rewardPoints} Leaf Points!`, "success");
      } else {
        triggerToast("Failed to reward points. Let's try again shortly!", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network issue watering the tree.", "error");
    } finally {
      setNourishLoading(false);
    }
  };

  const activeMetric = metrics.find(m => m.id === activeMetricId) || metrics[0];
  const ActiveIcon = activeMetric.icon;

  return (
    <div className="bg-slate-950 border-4 border-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[8px_8px_0px_#0f3620] space-y-6">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4 border-slate-900 pb-5">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#ccff00] text-slate-950 font-black text-[10px] tracking-widest px-2.5 py-1 rounded-md uppercase border-2 border-slate-900 rotate-[-1deg]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Biome</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight uppercase mt-2">
            The Planetary Vibe Tree
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Touch glowing fruit nodes below to inspect critical real-time carbon numbers and nourish branches!
          </p>
        </div>

        {/* Current status display */}
        <div className="flex bg-slate-900 border-2 border-slate-800 p-2.5 rounded-2xl items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-lg shadow-sm">
            🌳
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">LIVE CO₂ STATUS</span>
            <span className="text-xs font-black text-[#ccff00] uppercase tracking-wider block">
              Dynamic Canopy Safe
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left interactive Tree, Right Vibe Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
        
        {/* LEFT COLUMN: Beautiful Interactive SVG Tree */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative bg-slate-900/40 rounded-3xl p-4 border-2 border-slate-900/60 shadow-inner h-[320px] sm:h-[350px]">
          <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 select-none">
            PLANETARY INTERACTIVE GRAPH
          </div>

          <svg 
            viewBox="0 0 400 320" 
            className="w-full h-full max-w-[380px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          >
            {/* Trunk */}
            <path 
              d="M185,300 C185,270 190,260 190,240 C190,210 170,180 160,160 C150,140 160,110 170,100" 
              fill="none" 
              stroke="#2e4033" 
              strokeWidth="14" 
              strokeLinecap="round" 
            />
            <path 
              d="M195,300 C195,270 200,260 200,240 C200,200 220,180 230,150 C240,120 230,105 220,80" 
              fill="none" 
              stroke="#2e4033" 
              strokeWidth="12" 
              strokeLinecap="round" 
            />
            {/* Branches and Sub-Branches */}
            <path d="M178,198 C160,190 145,185 125,190" fill="none" stroke="#2e4033" strokeWidth="8" strokeLinecap="round" />
            <path d="M211,180 C230,170 260,165 295,145" fill="none" stroke="#2e4033" strokeWidth="8" strokeLinecap="round" />
            <path d="M170,145 C150,130 120,115 105,92" fill="none" stroke="#2e4033" strokeWidth="6" strokeLinecap="round" />
            <path d="M218,130 C240,120 260,150 270,215" fill="none" stroke="#2e4033" strokeWidth="6" strokeLinecap="round" />

            {/* Ground / Soil Mound */}
            <path d="M120,300 C160,295 240,295 280,300" fill="none" stroke="#1b3024" strokeWidth="8" strokeLinecap="round" />

            {/* Interactive Metrics (Glowing Fruits) */}
            {metrics.map((metric) => {
              const active = metric.id === activeMetricId;
              const nourished = nourishedNodes[metric.id];

              return (
                <g 
                  key={metric.id}
                  className="cursor-pointer group"
                  onClick={() => setActiveMetricId(metric.id)}
                >
                  {/* Outer Pulsing Glow Circle */}
                  <circle 
                    cx={metric.x} 
                    cy={metric.y} 
                    r={active ? 28 : (nourished ? 22 : 18)} 
                    fill="transparent" 
                    className="transition-all duration-300"
                  />
                  {/* Glow shadow projection */}
                  <circle 
                    cx={metric.x} 
                    cy={metric.y} 
                    r={active ? 20 : 15} 
                    fill={metric.color} 
                    opacity={active ? 0.45 : 0.15}
                    className={`transition-all duration-300 animate-pulse`}
                  />
                  
                  {/* Core fruit circle with dynamic color based on status */}
                  <circle 
                    cx={metric.x} 
                    cy={metric.y} 
                    r={active ? 18 : 14} 
                    fill={active ? metric.color : (nourished ? "#1b5e38" : "#1e293b")} 
                    stroke={active ? "#74c69d" : (nourished ? "#a3e635" : "#334155")} 
                    strokeWidth={active ? 3 : 2}
                    className="transition-all duration-300 transform group-hover:scale-110"
                  />

                  {/* Inside Icons */}
                  <foreignObject
                    x={metric.x - 9}
                    y={metric.y - 9}
                    width={18}
                    height={18}
                    className="pointer-events-none"
                  >
                    <span className="flex items-center justify-center w-full h-full text-white">
                      {React.createElement(metric.icon, { 
                        className: `w-3.5 h-3.5 ${active ? "text-slate-950" : (nourished ? "text-emerald-400" : "text-slate-300")}`,
                        style: { color: active ? '#000000' : undefined }
                      })}
                    </span>
                  </foreignObject>

                  {/* Styled Floating Mini Tag displaying the Dynamic Value on Tree */}
                  <g className="pointer-events-none">
                    <rect 
                      x={metric.x - 30} 
                      y={metric.y - (active ? 38 : 34)} 
                      width={60} 
                      height={16} 
                      rx={4} 
                      fill="rgba(15, 23, 42, 0.9)" 
                      stroke={active ? metric.color : "#475569"} 
                      strokeWidth={1}
                    />
                    <text 
                      x={metric.x} 
                      y={metric.y - (active ? 27 : 23)} 
                      textAnchor="middle" 
                      fill={active ? "#fff" : "#94a3b8"} 
                      fontSize="9" 
                      fontWeight="black"
                      fontFamily="monospace"
                    >
                      {metric.number}{active ? "" : ""}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Prompt guide */}
          <div className="absolute bottom-2 flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[9px] font-mono text-slate-400 font-bold tracking-wider">
            <span>🔴 ACTIVE SPOTLIGHT:</span>
            <span className="text-white uppercase">{activeMetric.id}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: The Vibe Check Terminal Panel */}
        <div className="md:col-span-6 flex flex-col justify-between bg-slate-900 border-4 border-slate-950 rounded-2xl p-5 min-h-[320px] transition-all relative">
          
          <div className="space-y-4">
            
            {/* Header / Vibe Indicator */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-black uppercase text-emerald-400 font-mono tracking-widest flex items-center gap-1">
                  <ActiveIcon className="w-3.5 h-3.5 text-white" />
                  <span>Metric Info</span>
                </span>
              </div>

              <span className="text-[10px] font-black uppercase text-[#ccff00] tracking-widest font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-[#ccff00]/20 animate-pulse">
                {activeMetric.vibe}
              </span>
            </div>

            {/* Dynamic Content Display with AnimatePresence for smooth tabs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMetric.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-slate-100 uppercase tracking-tight">
                    {activeMetric.label}
                  </h4>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-4xl sm:text-5xl font-black font-sans tracking-tighter text-white" style={{ color: activeMetric.color }}>
                      {activeMetric.number}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {activeMetric.unit}
                    </span>
                  </div>
                </div>

                {/* Technical / Scientific Descriptor */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                  {activeMetric.desc}
                </p>

                {/* Gen Z Translation Speech Balloon */}
                <div className="bg-slate-950 border-2 border-slate-800 p-3.5 rounded-xl space-y-1 relative">
                  <div className="text-[9px] font-black uppercase text-purple-400 font-mono tracking-wider">
                    💅 Translator Vibe Check:
                  </div>
                  <p className="text-[11px] text-[#ccff00] leading-relaxed italic font-semibold">
                    "{activeMetric.zDesc}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Action Row: Watering / Nourishing the tree node */}
          <div className="pt-4 mt-4 border-t-2 border-slate-950 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-[10px] text-slate-400 font-medium font-sans">
              {nourishedNodes[activeMetric.id] ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  ✓ Perfectly Bloomed Today! 🎋
                </span>
              ) : (
                <span>Untapped Growth. Click to nourish!</span>
              )}
            </div>

            <button
              type="button"
              disabled={nourishedNodes[activeMetric.id] || nourishLoading}
              onClick={() => handleNourish(activeMetric)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b0dc00] text-slate-900 font-black text-xs uppercase tracking-wider cursor-pointer border-2 border-slate-900 shadow-[2px_2px_0px_#000] disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
            >
              {nourishLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Droplet className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Water Branch (+25 LP)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
