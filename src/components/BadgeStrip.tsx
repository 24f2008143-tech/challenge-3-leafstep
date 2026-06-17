import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { BadgeData } from "./BadgeGrid";

interface BadgeStripProps {
  badges: BadgeData[]; // unlocked badges sorted by unlockedAt desc
  maxVisible?: number; // default 8
}

const TIER_COLORS = {
  seed: { glow: "#4CAF50", bg: "#1B3A1F" },
  sprout: { glow: "#C8F500", bg: "#1C2A0A" },
  grove: { glow: "#00E5FF", bg: "#0A1F2A" },
  canopy: { glow: "#FFB800", bg: "#2A1A00" },
  storm: { glow: "#7C3AED", bg: "#1A0A2A" },
  legend: { glow: "#E040FB", bg: "#0D1B2A" },
};

export default function BadgeStrip({ badges, maxVisible = 8 }: BadgeStripProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  // Render content or empty skeleton state
  const isStripEmpty = badges.length === 0;

  return (
    <div 
      className="w-full bg-[#0D1B2A]/60 border border-white/5 rounded-2xl py-3 px-4 flex items-center justify-between gap-4 overflow-hidden shadow-inner relative"
      id="leafstep-badge-strip"
    >
      {/* Hide scrollbars custom inline stylesheet */}
      <style>{`
        .scrollbar-cleanup::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-cleanup {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {isStripEmpty ? (
        // === EMPTY STATE: 4 Placeholder skeletons ===
        <div className="flex items-center gap-3.5 w-full">
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((num) => (
              <div
                key={num}
                className="w-[48px] h-[48px] rounded-xl bg-slate-800/40 border border-dashed border-slate-700/60 animate-pulse flex items-center justify-center shrink-0"
              >
                <div className="w-5 h-5 rounded-md bg-slate-700/50" />
              </div>
            ))}
          </div>
          <p className="text-xs font-black font-mono text-[#C8F550] text-[#C8F500]/70 select-none tracking-wider uppercase animate-pulse">
            Complete quests to earn badges
          </p>
        </div>
      ) : (
        // === POPULATED BADGE ROW ===
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-cleanup w-full relative py-1">
          <div className="flex items-center gap-2.5">
            <AnimatePresence mode="popLayout">
              {visibleBadges.map((badge, idx) => {
                const colors = TIER_COLORS[badge.tier] || TIER_COLORS.seed;
                const IconComp = (Icons as any)[badge.icon];

                return (
                  <div
                    key={badge.id}
                    className="relative shrink-0 select-none cursor-help"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Compact Tooltip (placed above the compact badge) */}
                    <AnimatePresence>
                      {hoveredIdx === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-40 bg-[#111827] border border-white/10 rounded-lg px-2.5 py-1.5 shadow-2xl text-[10px] whitespace-nowrap leading-relaxed flex flex-col items-center pointer-events-none"
                          style={{ boxShadow: "0 8px 16px rgba(0,0,0,0.6)" }}
                        >
                          <span className="font-extrabold text-white">{badge.label}</span>
                          <span 
                            className="font-black text-[8px] uppercase tracking-wider font-mono mt-0.5"
                            style={{ color: colors.glow }}
                          >
                            {badge.tier} Tier
                          </span>
                          
                          {/* Triangle indicator pointing down */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#111827]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Compact Image Container: Slide-in staggered on mount */}
                    <motion.div
                      initial={{ x: 24, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.06, duration: 0.4, ease: "easeOut" }}
                      whileHover={{ scale: 1.08 }}
                      id={`badge-strip-mini-${badge.id}`}
                      className="relative w-[48px] h-[48px] rounded-xl flex items-center justify-center overflow-hidden border"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: badge.tier === "legend" ? "#E040FB" : colors.glow,
                        boxShadow: `0 0 10px ${colors.glow}40, inset 0 0 4px ${colors.glow}20`,
                      }}
                    >
                      {/* Premium Rainbow Background Spinning Gradient overlay for Legend Tier */}
                      {badge.tier === "legend" && (
                        <>
                          <div
                            className="absolute inset-0 animate-spin"
                            style={{
                              background: "conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00E5FF, #7C3AED, #FF007F, #FF0000)",
                              animationDuration: "3s",
                              animationTimingFunction: "linear",
                              animationIterationCount: "infinite",
                            }}
                          />
                          <div className="absolute inset-[1.5px] rounded-[10px] z-[1]" style={{ backgroundColor: colors.bg }} />
                        </>
                      )}

                      {/* Icon Container (20px sized) */}
                      <div className="z-[2] flex items-center justify-center size-5 select-none text-[18px]">
                        {IconComp ? (
                          <IconComp size={20} style={{ color: badge.tier === "legend" ? "#FFFFFF" : colors.glow }} />
                        ) : (
                          <span className="leading-none">{badge.icon}</span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>

            {/* +X More Chip */}
            {remainingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: visibleBadges.length * 0.06 }}
                whileHover={{ scale: 1.05 }}
                className="w-[48px] h-[48px] rounded-xl bg-[#1A2232] border border-white/10 flex flex-col items-center justify-center select-none shrink-0"
                title={`${remainingCount} more achievements unlocked`}
              >
                <span className="text-xs font-black text-[#C8F500]">+{remainingCount}</span>
                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">More</span>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
