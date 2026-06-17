import React, { useState, useEffect } from "react";
import { Award, Sparkles, Trophy, BarChart3, Star, Play, Columns, Eye, EyeOff, RefreshCw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BadgeGrid, { BadgeData } from "./BadgeGrid";
import BadgeStrip from "./BadgeStrip";
import BadgeUnlockModal from "./BadgeUnlockModal";
import { BADGES } from "../badgeData";

interface BadgesShowcaseProps {
  badgeIds?: string[];
  leafPoints?: number;
}

// Custom hook to detect mobile view (< 1024px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export const BadgesShowcase = ({ badgeIds = [], leafPoints = 350 }: BadgesShowcaseProps) => {
  // Initialize state with the 24 high-fidelity leafstep badges
  const [localBadges, setLocalBadges] = useState<BadgeData[]>([]);
  const [showLocked, setShowLocked] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [currentUnlockBadge, setCurrentUnlockBadge] = useState<BadgeData | null>(null);
  const [acReward, setAcReward] = useState(150);

  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);

  // Synchronize initial expanded state with user screen scale & persistence
  useEffect(() => {
    const cached = localStorage.getItem("badgesHubOpen");
    if (cached !== null) {
      setIsOpen(cached === "true");
    } else {
      setIsOpen(!isMobile);
    }
  }, [isMobile]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const nextVal = !prev;
      localStorage.setItem("badgesHubOpen", String(nextVal));
      return nextVal;
    });
  };

  // Sync state on load and support some demo unlocked states initially
  useEffect(() => {
    const demoBadges = BADGES.map((b) => {
      // Unlock 5 initial badges for robust presentation, with staggered unlocked timestamps
      if (b.id === "first_steps") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 3600000).toISOString() }; // 1 hr ago
      }
      if (b.id === "carbon_curious") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 172800000).toISOString() }; // 48 hrs ago
      }
      if (b.id === "grid_watcher") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 5 * 3600000).toISOString() }; // 5 hrs ago
      }
      if (b.id === "sapling_steward") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 12 * 3600000).toISOString() }; // 12 hrs ago
      }
      if (b.id === "eco_streak") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 25 * 3600000).toISOString() }; // 25 hrs ago
      }
      // Populate partial progress on a couple of items to showcase the custom SVG circle progress ring
      if (b.id === "defer_starter") {
        return { ...b, progress: 40 };
      }
      if (b.id === "grid_guardian") {
        return { ...b, progress: 75 };
      }
      if (b.id === "streak_lord") {
        return { ...b, progress: 85 };
      }
      if (b.id === "smog_slayer") {
        return { ...b, progress: 10 };
      }
      return b;
    });
    setLocalBadges(demoBadges as BadgeData[]);
  }, []);

  // Compute live stats for the dashboard info box
  const totalBadgesCount = localBadges.length;
  const unlockedBadges = localBadges.filter((b) => b.unlocked);
  const unlockedCount = unlockedBadges.length;
  const lockPercentage = totalBadgesCount ? Math.round((unlockedCount / totalBadgesCount) * 100) : 0;

  // Sorting unlocked badges chronologically desc
  const sortedUnlockedBadges = [...unlockedBadges].sort((a, b) => {
    const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
    const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Action: Reset demo state for interactive testing
  const handleResetShowcase = () => {
    localStorage.removeItem("leafstep_cached_demo_badges");
    const reset = BADGES.map((b) => {
      if (b.id === "first_steps") {
        return { ...b, unlocked: true, unlockedAt: new Date(Date.now() - 3600000).toISOString() };
      }
      if (b.id === "defer_starter") return { ...b, progress: 40 };
      if (b.id === "grid_guardian") return { ...b, progress: 75 };
      return b;
    });
    setLocalBadges(reset as BadgeData[]);
  };

  // Action: Trigger a sequenced quest complete event causing next badge unlock
  const handleSimulateUnlock = () => {
    const lockedItems = localBadges.filter((b) => !b.unlocked);
    if (lockedItems.length === 0) {
      alert("Planetary Champ Status Achieved! All leafstep badges are already unlocked.");
      return;
    }
    // Select a random locked badge
    const randomBadge = lockedItems[Math.floor(Math.random() * lockedItems.length)];
    const rewardAC = randomBadge.aeroCreditsReward || 150;

    // Open the animated modal
    setAcReward(rewardAC);
    setCurrentUnlockBadge({ ...randomBadge, unlocked: true, unlockedAt: new Date().toISOString() });

    // Update state to mark unlocked
    setLocalBadges((prev) =>
      prev.map((b) =>
        b.id === randomBadge.id
          ? {
              ...b,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
              progress: undefined,
            }
          : b
      )
    );
  };

  return (
    <div 
      className="bg-[#0D1B2A] text-white rounded-3xl p-6 sm:p-8 border border-[#C8F500]/25 shadow-2xl relative overflow-hidden"
      id="leafstep-achievement-hub"
    >
      {/* Background radial glowing gradients */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C8F500]/5 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[#C8F500] font-black tracking-widest text-[11px] uppercase font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Achievement Engine Live</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#C8F500] drop-shadow-[0_0_8px_rgba(200,245,0,0.5)]" />
            leafstep Trophies
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Save power, shave peak loads, and participate in microgrid quests to earn real climate badges. Each unlocks high-value <span className="text-[#C8F500] font-bold font-mono">Aero-Credits (AC)</span>!
          </p>
        </div>

        {/* Dynamic score summary */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-[#14263B] border border-white/5 rounded-2xl p-3 px-4 flex flex-col justify-center min-w-[120px]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Secured Trophies</span>
            <span className="text-2xl font-black text-[#C8F500] mt-1">
              {unlockedCount} <span className="text-xs text-slate-400 font-normal">/ {totalBadgesCount}</span>
            </span>
          </div>
          <div className="bg-[#14263B] border border-white/5 rounded-2xl p-3 px-4 flex flex-col justify-center min-w-[120px]">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Completed</span>
            <span className="text-2xl font-black text-[#00E5FF] mt-1">
              {lockPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* COMPONENT DEMONSTRATION 1 of 4: The horizontal scrolls BadgeStrip */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] font-mono">
              Live Feed: Recently Unlocked Badges
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Horizontal scrollbar auto-hidden
          </span>
        </div>
        <BadgeStrip badges={sortedUnlockedBadges} maxVisible={7} />
      </div>

      {/* Control Panel Options Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#14263B]/50 border border-white/5 rounded-2xl p-4 mb-6 relative z-10">
        
        {/* Tier filter selections */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono mr-1">Tiers:</span>
          ={[
            { id: "all", label: "ALL TIERS" },
            { id: "seed", label: "Seed" },
            { id: "sprout", label: "Sprout" },
            { id: "grove", label: "Grove" },
            { id: "canopy", label: "Canopy" },
            { id: "storm", label: "Storm" },
            { id: "legend", label: "Legend" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedTier(pill.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all duration-200 cursor-pointer ${
                selectedTier === pill.id
                  ? "bg-[#C8F500] text-[#0D1B2A] shadow-lg shadow-[#C8F500]/20"
                  : "bg-[#1A2E44]/70 text-slate-300 hover:text-white hover:bg-[#1A2E44]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Interactive Simulation tools */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Locked items visibility toggle */}
          <button
            onClick={() => setShowLocked(!showLocked)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1A2E44]/80 text-[#00E5FF] border border-[#00E5FF]/20 rounded-xl text-xs font-bold hover:bg-[#1A2E44] transition-all cursor-pointer"
          >
            {showLocked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showLocked ? "Hide Locked" : "Show Locked"}</span>
          </button>

          {/* Simulate Action Unlock Trigger */}
          <button
            onClick={handleSimulateUnlock}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C8F500] to-[#00E5FF] active:translate-y-[0.5px] text-[#0D1B2A] font-black uppercase text-xs rounded-xl shadow-md cursor-pointer hover:opacity-90 transition-all"
            id="test-trigger-simulate-unlock"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Quest Earn!</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetShowcase}
            className="p-2 bg-[#1A2E44]/80 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl transition-all cursor-pointer"
            title="Reset simulation states"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COMPONENT DEMONSTRATION 2 of 4: Animated Segment Group BadgeGrid */}
      <div className="relative z-10">
        <BadgeGrid
          badges={localBadges}
          showLocked={showLocked}
          filterTier={selectedTier === "all" ? undefined : selectedTier}
        />
      </div>

      {/* COMPONENT DEMONSTRATION 3 of 4: Quest Completed Staggered Entrance Overlay Unlock Modal */}
      {currentUnlockBadge && (
        <BadgeUnlockModal
          badge={currentUnlockBadge}
          onClose={() => setCurrentUnlockBadge(null)}
          aeroCreditsEarned={acReward}
        />
      )}
    </div>
  );
};
