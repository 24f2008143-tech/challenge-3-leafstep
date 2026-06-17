import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Trees, ArrowUpRight, HelpCircle, ShieldCheck, ChevronRight, Info, Check, Zap, Trophy, Star } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";

interface MilestoneProgressBarProps {
  leafPoints: number;
  currentRank?: string;
}

interface MilestoneTier {
  pts: number;
  label: string;
  badgeName: string;
  icon: string;
  desc: string;
}

const MILESTONE_TIERS: MilestoneTier[] = [
  { pts: 200, label: "Sprouting", badgeName: "Eco Apprentice", icon: "🌱", desc: "Starting your sustainable habit journey." },
  { pts: 500, label: "Sapling", badgeName: "Sapling Steward", icon: "🌳", desc: "First major milestone threshold secured." },
  { pts: 1000, label: "Bamboo Walker", badgeName: "Bamboo Walker Badge", icon: "🎋", desc: "Unlocking advanced energy conservation rules." },
  { pts: 2000, label: "Grove Guardian", badgeName: "Forest Guardian", icon: "🛡️", desc: "Consistently mitigating municipal footprints." },
  { pts: 4000, label: "Forest Keeper", badgeName: "Forest Keeper Rank", icon: "🌲", desc: "Elite ecological stewardship level." },
  { pts: 7500, label: "Earth Steward", badgeName: "Climate Legend Master", icon: "🌍", desc: "Legendary status, steering grids in real time." },
  { pts: 15000, label: "Carbon Champion", badgeName: "Carbon Champion Status", icon: "👑", desc: "Absolute pinnacle of preservation power." },
];

export default function MilestoneProgressBar({ leafPoints = 350, currentRank = "Sprouting" }: MilestoneProgressBarProps) {
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const displayPoints = useCountUp(leafPoints, 1200);
  
  const [prevRawPoints, setPrevRawPoints] = useState(leafPoints);
  const [increment, setIncrement] = useState(0);
  const [showIncrement, setShowIncrement] = useState(false);
  const isMounted = React.useRef(false);

  const [showTiersTooltip, setShowTiersTooltip] = useState(false);
  const tooltipTimeout = React.useRef<any>(null);

  const handleMouseEnter = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = setTimeout(() => setShowTiersTooltip(true), 400);
  };
  const handleMouseLeave = () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
    setShowTiersTooltip(false);
  };

  React.useEffect(() => {
    if (isMounted.current) {
      if (leafPoints > prevRawPoints) {
        setIncrement(leafPoints - prevRawPoints);
        setShowIncrement(true);
      }
      setPrevRawPoints(leafPoints);
    } else {
      isMounted.current = true;
      setPrevRawPoints(leafPoints);
    }
  }, [leafPoints, prevRawPoints]);

  React.useEffect(() => {
    if (showIncrement) {
      const timer = setTimeout(() => setShowIncrement(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showIncrement]);

  // Determine current tier and next milestone based on leafPoints
  let currentTierIndex = -1;
  let nextMilestone = MILESTONE_TIERS[0];

  for (let i = 0; i < MILESTONE_TIERS.length; i++) {
    if (leafPoints >= MILESTONE_TIERS[i].pts) {
      currentTierIndex = i;
    }
  }

  const currentTier = currentTierIndex >= 0 ? MILESTONE_TIERS[currentTierIndex] : null;
  const nextTier = currentTierIndex + 1 < MILESTONE_TIERS.length ? MILESTONE_TIERS[currentTierIndex + 1] : null;

  // Calculate overall progress inside the current active tier interval
  const prevThreshold = currentTier ? currentTier.pts : 0;
  const nextThreshold = nextTier ? nextTier.pts : prevThreshold;

  const pointsPassedInTier = leafPoints - prevThreshold;
  const tierTotalSpan = nextThreshold - prevThreshold;
  const progressPercent = nextTier 
    ? Math.min(100, Math.max(0, (pointsPassedInTier / tierTotalSpan) * 100))
    : 100;

  return (
    <div 
      className="rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300 border border-[#1f2937]/50"
      style={{
        background: `
          radial-gradient(circle at 8% 90%, rgba(200,245,0,0.04) 0%, transparent 55%),
          radial-gradient(circle at 92% 8%, rgba(0,229,255,0.04) 0%, transparent 50%),
          #0D1B2A
        `,
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(200,245,0,0.08)'
      }}
    >
      {/* 2px left-edge ambient accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-[2px] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #C8F500, transparent)',
          opacity: 0.4
        }}
      />
      
      {/* Visual background dark grid with upgraded opacity */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', 
          backgroundSize: '20px 20px', 
          opacity: 0.06 
        }} 
      />

      {/* Main Stats Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
        <div>
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#111827] px-3 py-1 rounded-full mb-3 shadow-md cursor-default relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #C8F500 0%, #A8D400 100%)',
              boxShadow: '0 2px 12px rgba(200,245,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
              letterSpacing: '0.07em'
            }}
          >
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.5, ease: "easeInOut" }}
            >
              <Award className="w-3.5 h-3.5" />
            </motion.span>
            Milestone Journey
          </motion.div>
          <div className="flex items-baseline gap-2 relative">
            <span 
              className="text-5xl font-black text-white tracking-tight italic uppercase relative"
              style={{ textShadow: '0 0 15px #00E5FF, 0 0 5px rgba(0,229,255,0.3)' }}
            >
              {displayPoints}
              
              <AnimatePresence>
                {showIncrement && (
                  <motion.span 
                    initial={{ y: 15, opacity: 0, scale: 0.6 }}
                    animate={{ y: -30, opacity: [0, 1, 1, 0], scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, times: [0, 0.15, 0.8, 1], ease: "easeOut" }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl font-black text-[#00E5FF] whitespace-nowrap pointer-events-none"
                    style={{ textShadow: '0 0 15px #00E5FF, 0 0 6px rgba(0,229,255,0.9)' }}
                  >
                    +{increment} LP
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="text-sm font-bold text-[#cfff04] uppercase">Total LP</span>
          </div>
          <p className="text-white/70 text-xs mt-1 font-medium">Keep climbing the planetary ranks.</p>
        </div>

        {/* Action Button & Active Rank Indicator */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto items-center">
          <motion.div 
            whileHover="hover"
            className="bg-[#1f2937] rounded-2xl px-5 py-3 flex items-center gap-3 flex-grow sm:flex-grow-0 relative overflow-hidden"
            style={{
              border: '1px solid rgba(0,229,255,0.35)',
              boxShadow: '0 0 12px rgba(0,229,255,0.15)'
            }}
          >
            {/* Shimmer overlay */}
            <motion.div 
              className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              initial={{ x: "-100%" }}
              variants={{
                hover: { x: ["-100%", "200%"] }
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            <span className="text-2xl z-10" style={{ filter: 'drop-shadow(0 0 6px #FFB800)' }}>🏆</span>
            <div className="z-10">
              <span className="text-[10px] font-black block uppercase tracking-widest text-[#00E5FF]">Current rank</span>
              <span className="text-sm font-black text-white uppercase italic flex items-center gap-1.5">
                <span>{currentTier ? currentTier.icon : "🌱"}</span>
                {currentTier ? currentTier.label : "Initiate"}
              </span>
            </div>
          </motion.div>

          <div className="relative inline-block">
            <motion.button
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.04 }}
              whileTap={{ y: 2 }}
              onClick={() => {
                setShowTiersTooltip(false);
                setShowMilestonesModal(true);
              }}
              className="text-[#111827] px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all"
              style={{
                backgroundColor: '#C8F500',
                boxShadow: '0 4px 0 #6B7A00, inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(0,0,0,0.25)'
              }}
              title="View all Milestones"
            >
              <HelpCircle className="w-4 h-4" />
              <span style={{ letterSpacing: '0.1em' }} className="font-extrabold">Tiers</span>
            </motion.button>

            <AnimatePresence>
              {showTiersTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-3 z-30 bg-[#111827] border border-[#374151] rounded-lg px-3 py-1.5 shadow-2xl text-[11.5px] font-bold text-[#C8F500] whitespace-nowrap pointer-events-none"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                  View all rank tiers →
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Bar Container with absolute waypoint markers */}
      <div className="space-y-4 mt-6 relative z-10">
        <div className="relative flex justify-between items-end text-xs font-black uppercase tracking-wider text-slate-400 pb-7">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm bg-[#1f2937] px-2 py-1 rounded-md border border-[#374151]">{prevThreshold}</span>
            <span className="ml-1 hidden sm:inline text-white/90">{currentTier ? currentTier.label : "Start"}</span>
          </div>
          
          {/* Waypoint absolute overlay row */}
          {nextTier && (
            <div className="absolute left-[130px] right-[130px] bottom-1 select-none pointer-events-none hidden md:flex items-center justify-between">
              {[0.33, 0.66, 1.0].map((ratio, index) => {
                const waypointLP = Math.round(prevThreshold + tierTotalSpan * ratio);
                const isEarned = leafPoints >= waypointLP;
                const isChasing = !isEarned && Math.abs(leafPoints - waypointLP) <= 30;

                return (
                  <div key={index} className="flex flex-col items-center relative">
                    {/* Circle Dot with dynamic lights */}
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        isEarned 
                          ? "bg-[#C8F500] shadow-[0_0_8px_rgba(200,245,0,0.8)]" 
                          : isChasing 
                            ? "bg-[#00E5FF] animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" 
                            : "border-[1.5px] border-[#2A3D50] bg-transparent"
                      }`}
                    />
                    
                    {/* Tick / LP Label below */}
                    <div className="absolute top-3 flex flex-col items-center">
                      <span className={`text-[9px] font-black leading-none ${isEarned ? "text-[#C8F500]" : "text-slate-600"}`}>
                        {isEarned ? "✓" : "-"}
                      </span>
                      <span className="text-[9px] text-slate-405 text-slate-400 font-bold mt-1">{waypointLP}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {nextTier ? (
            <div 
              className="flex items-center gap-2 text-right"
              style={{ borderLeft: '3px solid #7C3AED', paddingLeft: '8px' }}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="text-[#cfff04] flex items-center gap-1 bg-[#1f2937] px-2 py-1 rounded-md border border-[#cfff04]/30 shadow-[0_0_10px_rgba(207,255,4,0.1)]">
                {nextTier.icon} {nextTier.pts}
              </span>
            </div>
          ) : (
            <span className="text-[#cfff04]">👑 MAXED OUT</span>
          )}
        </div>

        {/* Visual Progress Track - Upgraded h-6 & Glow Effects */}
        <div 
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Milestone progress: ${Math.round(progressPercent)}% towards next rank`}
          className="relative w-full h-6 rounded-full p-0.5 overflow-hidden shadow-inner flex items-center"
          style={{
            background: '#1C2A3A',
            border: '1px solid #2A3D50'
          }}
        >
          <span className="sr-only">{Math.round(progressPercent)}% completed</span>
          <motion.div 
            className="h-full rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
            style={{ 
              backgroundColor: '#C8F500',
              boxShadow: '0 0 16px rgba(200,245,0,0.55), 0 0 4px rgba(200,245,0,0.85)' 
            }}
          >
            {/* Gloss pattern on bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            {/* Striped diagonal texture */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} />

            {/* Circular pulse indicator at the extreme right of the fill */}
            {progressPercent < 100 && progressPercent > 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-3 h-3 rounded-full bg-[#C8F500] flex items-center justify-center">
                <div 
                  className="absolute w-6 h-6 rounded-full animate-ping pointer-events-none"
                  style={{ backgroundColor: 'rgba(0, 229, 255, 0.5)', animationDuration: '1.5s' }}
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Informative helper tag underneath progress bar */}
        <div className="flex justify-between items-start sm:items-center pt-2">
          {nextTier ? (
             <div className="text-[11px] text-slate-300 flex items-center gap-2 max-w-sm leading-relaxed">
              <span className="bg-[#1f2937] p-1 rounded inline-flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse mr-1" />
                <Info className="w-3 h-3 text-[#cfff04] shrink-0" />
              </span>
              <span>
                Earn <strong className="text-white font-black">{nextThreshold - leafPoints}</strong> more to unlock{' '}
                <motion.span 
                  className="font-bold cursor-help inline-flex items-center gap-0.5"
                  style={{ color: '#FFB800', textShadow: '0 0 10px rgba(255,184,0,0.4)' }}
                >
                  <motion.span
                    initial={{ rotateY: 0 }}
                    animate={progressPercent >= 100 ? { rotateY: [0, 180, 0] } : { rotateY: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block"
                  >
                    {progressPercent >= 100 ? "🔓" : "🔒"}
                  </motion.span>
                  "{nextTier.badgeName}"
                </motion.span>
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>You have reached the ultimate standard of climate preservation! Spectacular.</span>
            </p>
          )}

          <span 
            className="text-xs font-black font-mono px-2 py-1 select-none"
            style={{
              background: 'rgba(200,245,0,0.12)',
              border: '1px solid #C8F500',
              color: '#C8F500',
              borderRadius: '999px',
              fontWeight: 700
            }}
          >
            {nextTier ? `${Math.round(progressPercent)}%` : "100%"}
          </span>
        </div>
      </div>

      {/* Tiers List Dialog Modal Drawer */}
      <AnimatePresence>
        {showMilestonesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={() => setShowMilestonesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-[#1f2937] max-h-[85vh] overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start border-b border-[#374151] pb-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-[#cfff04]" />
                      Milestone Ladder
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Climb the planetary ranks and secure your legacy.</p>
                  </div>
                  <button 
                    onClick={() => setShowMilestonesModal(false)}
                    className="p-1.5 rounded-xl hover:bg-[#1f2937] text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 pr-1">
                  {MILESTONE_TIERS.map((tier, idx) => {
                    const isEarned = leafPoints >= tier.pts;
                    const isNext = !isEarned && (idx === 0 || leafPoints >= MILESTONE_TIERS[idx - 1].pts);

                    return (
                      <div 
                        key={tier.pts} 
                        className={`p-4 rounded-2xl flex items-center gap-4 border-2 transition ${
                          isEarned 
                            ? "bg-[#1f2937] border-[#374151]" 
                            : isNext 
                            ? "border-[#cfff04] bg-[#cfff04]/10 shadow-[0_0_15px_rgba(207,255,4,0.1)]"
                            : "opacity-50 border-[#1f2937] bg-transparent"
                        }`}
                      >
                        <span className="text-3xl select-none leading-none drop-shadow-md">{tier.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white uppercase italic truncate">{tier.label}</h4>
                            <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {tier.pts} LP
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{tier.desc}</p>
                          <p className="text-[9px] font-black text-[#cfff04] mt-1 uppercase tracking-widest">{tier.badgeName}</p>
                        </div>

                        {/* Status icon right */}
                        <div className="shrink-0">
                          {isEarned ? (
                            <div className="w-8 h-8 bg-[#cfff04] text-[#111827] rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 stroke-[4]" />
                            </div>
                          ) : isNext ? (
                            <div className="text-[10px] bg-[#cfff04] text-[#111827] font-black px-3 py-1.5 rounded-full animate-pulse uppercase tracking-widest">
                              Chasing
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-slate-500 bg-[#1f2937] px-3 py-1.5 rounded-full uppercase tracking-widest">
                              Locked
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setShowMilestonesModal(false)}
                className="w-full mt-6 bg-[#cfff04] text-[#111827] font-black py-4 px-6 rounded-2xl hover:bg-[#b8e600] active:translate-y-1 transition text-sm uppercase tracking-widest border-b-4 border-[#9abf00] active:border-b-0"
              >
                Secure Trophies
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
