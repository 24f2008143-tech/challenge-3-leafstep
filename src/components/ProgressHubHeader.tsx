import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronDown, Trophy, Award, RefreshCw, ArrowUpDown } from "lucide-react";

export interface ProgressHubHeaderProps {
  totalLP: number;
  currentRank: string;
  lpProgressPercent: number;
  trophiesUnlocked: number;
  trophiesTotal: number;
  trophiesPercent: number;
  isMilestoneOpen: boolean;
  isTrophiesOpen: boolean;
  onMilestoneToggle: () => void;
  onTrophiesToggle: () => void;
  onRefresh: () => void;
}

// Custom hook to check vertical scroll status (> 40px)
const useScrollBorder = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
};

export default function ProgressHubHeader({
  totalLP,
  currentRank,
  lpProgressPercent,
  trophiesUnlocked,
  trophiesTotal,
  trophiesPercent,
  isMilestoneOpen,
  isTrophiesOpen,
  onMilestoneToggle,
  onTrophiesToggle,
  onRefresh,
}: ProgressHubHeaderProps) {
  const isScrolled = useScrollBorder();

  const handleManageClick = () => {
    const bothOpen = isMilestoneOpen && isTrophiesOpen;
    if (bothOpen) {
      onMilestoneToggle();
      onTrophiesToggle();
    } else {
      if (!isMilestoneOpen) onMilestoneToggle();
      if (!isTrophiesOpen) onTrophiesToggle();
    }
  };

  return (
    <div
      id="progress-hub-header"
      className="w-full bg-[#0D1B2A] sticky top-0 z-40 transition-all duration-300"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: isScrolled
          ? "1px solid rgba(200, 245, 0, 0.12)"
          : "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Row 1 — Section label row (28px tall) */}
      <div 
        className="h-[28px] bg-white/[0.02] border-b border-white/[0.04] px-5 flex items-center justify-between"
        id="progress-hub-row1"
      >
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[13px] leading-none">🌿</span>
          <span className="text-[10px] font-medium tracking-[0.18em] text-[rgba(255,255,255,0.35)] font-mono">
            PROGRESS HUB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManageClick}
            className="text-[10px] font-bold text-[rgba(200,245,0,0.5)] hover:text-[#C8F500] transition-colors duration-150 cursor-pointer bg-none border-none p-0 flex items-center gap-1 focus:outline-none"
          >
            <span>Manage</span>
            <ArrowUpDown className="w-[11px] h-[11px]" />
          </button>
          <div className="w-[12px]" />
          <button
            onClick={onRefresh}
            className="text-[rgba(255,255,255,0.2)] hover:text-white transition-colors duration-150 cursor-pointer bg-none border-none p-0 focus:outline-none"
            title="Refresh statistics"
          >
            <RefreshCw className="w-[13px] h-[13px]" />
          </button>
        </div>
      </div>

      {/* Row 2 — Unified summary bar (52px tall) */}
      <div 
        className="h-[52px] flex items-center gap-0 select-none relative"
        id="progress-hub-row2"
      >
        {/* LEFT HALF — Milestone Journey segment */}
        <div
          onClick={onMilestoneToggle}
          className="flex-1 h-full pl-5 pr-6 flex items-center cursor-pointer hover:bg-[rgba(200,245,0,0.03)] transition-colors duration-150"
          title={isMilestoneOpen ? "Collapse Milestone Progress Details" : "Collapse Milestone Progress Details"}
          role="button"
          aria-expanded={isMilestoneOpen}
          aria-controls="milestone-hub-content"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onMilestoneToggle();
            }
          }}
        >
          <Trophy className="w-3.5 h-3.5 text-[#C8F500] shrink-0" size={14} />
          <span className="text-[12px] font-bold text-white ml-2 uppercase shrink-0 font-mono tracking-wider">
            {currentRank}
          </span>
          <span className="text-[10px] bg-[rgba(200,245,0,0.12)] border border-[rgba(200,245,0,0.25)] text-[#C8F500] rounded-full px-2 py-0.5 ml-2 font-mono font-bold tracking-wide shrink-0">
            {currentRank.toUpperCase()}
          </span>
          
          <div className="flex-1" />
          
          {/* Progress bar */}
          <div className="hidden sm:block w-[100px] h-1 bg-white/8 rounded-full overflow-hidden relative shrink-0">
            <div
              className="h-full bg-[#C8F500] rounded-full shadow-[0_0_6px_#C8F500]"
              style={{ width: `${Math.min(100, Math.max(0, lpProgressPercent))}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-white font-mono ml-3 shrink-0">
            {totalLP} LP
          </span>

          {/* Expanded indicators Chevron LEFT */}
          <motion.div
            animate={{ rotate: isMilestoneOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-white/40 ml-4 shrink-0"
          >
            <ChevronDown size={14} className="stroke-[3]" />
          </motion.div>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-[28px] bg-[rgba(255,255,255,0.08)] shrink-0" />

        {/* RIGHT HALF — Leafstep Trophies segment */}
        <div
          onClick={onTrophiesToggle}
          className="flex-1 h-full pl-6 pr-5 flex items-center cursor-pointer hover:bg-[rgba(0,229,255,0.03)] transition-colors duration-150"
          role="button"
          aria-expanded={isTrophiesOpen}
          aria-controls="badges-hub-content"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onTrophiesToggle();
            }
          }}
        >
          <Award className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" size={14} />
          <span className="text-[12px] font-bold text-white ml-2 font-mono tracking-wider shrink-0">
            {trophiesUnlocked} / {trophiesTotal}
          </span>
          <span className="text-[10px] text-[rgba(0,229,255,0.6)] ml-1 font-black tracking-widest uppercase shrink-0 font-mono">
            UNLOCKED
          </span>
          
          <div className="flex-1" />
          
          {/* Progress bar */}
          <div className="hidden sm:block w-[100px] h-1 bg-white/8 rounded-full overflow-hidden relative shrink-0">
            <div
              className="h-full bg-[#00E5FF] rounded-full shadow-[0_0_6px_#00E5FF]"
              style={{ width: `${Math.min(100, Math.max(0, trophiesPercent))}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-[#00E5FF] font-mono ml-3 shrink-0">
            {Math.round(trophiesPercent)}%
          </span>

          {/* Expanded indicators Chevron RIGHT */}
          <motion.div
            animate={{ rotate: isTrophiesOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-white/40 ml-4 shrink-0"
          >
            <ChevronDown size={14} className="stroke-[3]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
