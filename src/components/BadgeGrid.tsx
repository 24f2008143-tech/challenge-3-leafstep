import React from "react";
import { motion, AnimatePresence } from "motion/react";
import Badge, { BadgeProps } from "./Badge";

export interface BadgeData {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji or lucide-react icon name
  tier: "seed" | "sprout" | "grove" | "canopy" | "storm" | "legend";
  category?: "rank" | "streak" | "grid" | "quest" | "social" | "special";
  unlockCondition?: string;
  aeroCreditsReward?: number;
  unlocked: boolean;
  unlockedAt?: string; // ISO date string
  progress?: number; // 0–100, shown if not yet unlocked
}

interface BadgeGridProps {
  badges: BadgeData[];
  showLocked?: boolean; // default true
  filterTier?: string; // e.g. "seed", "sprout", if set, only show that tier
}

const TIER_ORDER = ["seed", "sprout", "grove", "canopy", "storm", "legend"] as const;

interface TierMetadata {
  color: string;
  label: string;
  gradient?: string;
}

const TIER_METADATA: Record<"seed" | "sprout" | "grove" | "canopy" | "storm" | "legend", TierMetadata> = {
  seed: {
    color: "#4CAF50",
    label: "SEED",
  },
  sprout: {
    color: "#C8F500",
    label: "SPROUT",
  },
  grove: {
    color: "#00E5FF",
    label: "GROVE",
  },
  canopy: {
    color: "#FFB800",
    label: "CANOPY",
  },
  storm: {
    color: "#7C3AED",
    label: "STORM",
  },
  legend: {
    color: "#E040FB",
    label: "LEGEND",
    gradient: "linear-gradient(to right, #00E5FF, #FFB800, #C8F500, #7C3AED)",
  },
};

export default function BadgeGrid({
  badges,
  showLocked = true,
  filterTier,
}: BadgeGridProps) {
  // 1. Filter badges based on showLocked and filterTier props
  const filteredBadges = badges.filter((badge) => {
    // If showLocked is false, only show unlocked badges
    if (!showLocked && !badge.unlocked) return false;
    // If filterTier is configured, only show badges matching that exact tier
    if (filterTier && badge.tier !== filterTier) return false;
    return true;
  });

  // 2. Identify if all visible badges are locked (or there are no badges)
  const isAllLocked = filteredBadges.length === 0 || filteredBadges.every((b) => !b.unlocked);

  if (isAllLocked) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        id="badgegrid-empty-state"
      >
        <span className="text-6xl mb-4 select-none animate-bounce" style={{ animationDuration: "2.5s" }}>
          🐼
        </span>
        <p className="text-sm font-black font-mono tracking-wide" style={{ color: "#C8F500" }}>
          No badges unlocked yet. Start your first quest to earn one.
        </p>
      </div>
    );
  }

  // 3. Group filtered badges by tier in defined sequence order
  // Only process tiers that match the filterTier criteria (if filterTier is active)
  const activeTiers = TIER_ORDER.filter(
    (t) => !filterTier || t === filterTier
  );

  // Animation variants
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Stagger 0.15s between tier sections
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as any,
        staggerChildren: 0.05, // Stagger 0.05s between badges in the section
      },
    },
  };

  const badgeWrapperVariants = {
    hidden: { opacity: 0, scale: 0.82 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as any,
        stiffness: 280,
        damping: 18,
      },
    },
  };

  return (
    <div className="w-full bg-[#0D1B2A]/40 rounded-3xl p-4 sm:p-6 border border-white/5" id="leafstep-badges-shelf">
      <motion.div
        variants={gridContainerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <AnimatePresence mode="popLayout">
          {activeTiers.map((tierKey) => {
            const tierBadges = filteredBadges.filter((b) => b.tier === tierKey);
            // Hide section entirely if it contains no visible badges
            if (tierBadges.length === 0) return null;

            const meta = TIER_METADATA[tierKey];
            const unlockedCount = tierBadges.filter((b) => b.unlocked).length;
            const totalCount = tierBadges.length;

            return (
              <motion.section
                key={tierKey}
                variants={sectionVariants}
                className="w-full"
                id={`badge-section-${tierKey}`}
              >
                {/* Visual Tier Header Bar */}
                <div className="flex items-center gap-3 w-full mb-5 mt-2">
                  <div className="flex items-center gap-2 text-white text-xs font-black tracking-wider flex-shrink-0">
                    {/* Colored dot with radial glow */}
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: meta.gradient || meta.color,
                        boxShadow: `0 0 8px ${meta.color}`,
                      }}
                    />
                    <span className="font-extrabold uppercase italic">
                      {meta.label}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {unlockedCount}/{totalCount}
                    </span>
                  </div>

                  {/* Thin colored decorative tracker divider line */}
                  <div
                    className="flex-grow h-[1px]"
                    style={{
                      background: meta.gradient
                        ? `${meta.gradient}`
                        : `linear-gradient(to right, ${meta.color}50, transparent)`,
                    }}
                  />
                </div>

                {/* Responsive Badges Grid layout */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-y-6 gap-x-4 justify-items-center">
                  {tierBadges.map((badge) => (
                    <motion.div
                      key={badge.id}
                      variants={badgeWrapperVariants}
                      className="transition-all duration-300"
                      style={{
                        // Grayscale and opacity applied exactly to locked state
                        filter: !badge.unlocked ? "grayscale(0.8)" : "none",
                        opacity: !badge.unlocked ? 0.6 : 1,
                      }}
                    >
                      <Badge
                        id={badge.id}
                        label={badge.label}
                        description={badge.description}
                        icon={badge.icon}
                        tier={badge.tier}
                        unlocked={badge.unlocked}
                        unlockedAt={badge.unlockedAt}
                        progress={badge.progress}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
