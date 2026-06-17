import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import BadgeProgressRing from "./BadgeProgressRing";
import LegendBadge from "./LegendBadge";

export interface BadgeProps {
  id: string;
  label: string;
  description: string;
  icon: string; // emoji or lucide-react icon name
  tier: "seed" | "sprout" | "grove" | "canopy" | "storm" | "legend";
  unlocked: boolean;
  unlockedAt?: string; // ISO date string
  progress?: number; // 0–100, shown if not yet unlocked
}

const TIER_COLORS = {
  seed: {
    glow: "#4CAF50",
    bg: "#1B3A1F",
    text: "#81C784",
  },
  sprout: {
    glow: "#C8F500",
    bg: "#1C2A0A",
    text: "#E6FF73",
  },
  grove: {
    glow: "#00E5FF",
    bg: "#0A1F2A",
    text: "#80F3FF",
  },
  canopy: {
    glow: "#FFB800",
    bg: "#2A1A00",
    text: "#FFD54F",
  },
  storm: {
    glow: "#7C3AED",
    bg: "#1A0A2A",
    text: "#B085F5",
  },
  legend: {
    glow: "#E040FB", // default vibrant backup glow
    bg: "#0D1B2A",   // deep navy card bg
    text: "#FFFFFF",
  },
};

// Check if a badge is "NEW" (unlocked within the last 48 hours)
const checkIsNew = (unlocked: boolean, unlockedAt?: string): boolean => {
  if (!unlocked || !unlockedAt) return false;
  try {
    const earnedTime = new Date(unlockedAt).getTime();
    if (isNaN(earnedTime)) return false;
    const now = Date.now();
    const diffHours = (now - earnedTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  } catch {
    return false;
  }
};

export default function Badge({
  id,
  label,
  description,
  icon,
  tier,
  unlocked,
  unlockedAt,
  progress,
}: BadgeProps) {
  // If tier is legend, return the specialized LegendBadge
  if (tier === "legend") {
    return (
      <LegendBadge
        label={label}
        icon={icon}
        unlocked={unlocked}
        description={description}
      />
    );
  }

  const currentColors = TIER_COLORS[tier] || TIER_COLORS.seed;
  const isNew = checkIsNew(unlocked, unlockedAt);
  const showProgress = !unlocked && progress !== undefined;

  // Resolve standard lucide icon if possible
  const IconComponent = (Icons as any)[icon];

  const renderIcon = () => {
    if (IconComponent) {
      return (
        <IconComponent
          size={32}
          className="shrink-0"
          style={{
            color: unlocked ? currentColors.glow : "rgba(255, 255, 255, 0.4)",
          }}
        />
      );
    }
    // Emojis or other text string characters
    return (
      <span
        className="text-[32px] select-none leading-none flex items-center justify-center shrink-0"
        style={{
          filter: unlocked ? "none" : "grayscale(100%) opacity(0.5)",
        }}
      >
        {icon}
      </span>
    );
  };

  // Base motion container spring settings
  const containerVariants = {
    hidden: { scale: 0.6, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      } as any
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-start w-[100px] select-none"
      title={description}
      id={`achievement-badge-${id}`}
    >
      {/* 80x80 Container relative space */}
      <div className="relative w-[80px] h-[80px] flex items-center justify-center mb-2">
        
        {/* Progress circular frame arc */}
        {showProgress && (
          <BadgeProgressRing
            progress={progress ?? 0}
            size={90}
            tierColor={currentColors.glow}
          />
        )}

        {/* The Core 80x80px rounded square Badge container */}
        <motion.div
          variants={unlocked ? containerVariants : undefined}
          initial={unlocked ? "hidden" : undefined}
          animate={unlocked ? "visible" : undefined}
          className="relative w-[80px] h-[80px] rounded-[16px] overflow-hidden flex items-center justify-center"
          style={{
            backgroundColor: unlocked ? currentColors.bg : "#1A2232",
            border: `2px solid ${unlocked ? currentColors.glow : "rgba(255,255,255,0.08)"}`,
            boxShadow:
              unlocked
                ? `0 0 16px ${currentColors.glow}80, inset 0 0 8px ${currentColors.glow}33`
                : "none",
          }}
        >

          {/* Render the icon component / emoji */}
          <div className="z-[2] flex items-center justify-center w-full h-full">
            {renderIcon()}
          </div>

          {/* Lock state opaque overlay */}
          {!unlocked && (
            <div className="absolute inset-0 bg-black/60 z-[3] flex items-center justify-center rounded-[14px]">
              <span className="text-[20px] select-none opacity-60">🔒</span>
            </div>
          )}
        </motion.div>

        {/* "NEW" Achievement badge overlay pill */}
        {isNew && (
          <div
            className="absolute -top-1 -right-1 z-20 text-[9px] font-black px-1.5 py-0.5 rounded-full select-none shadow-md"
            style={{
              backgroundColor: "#C8F500",
              color: "#0D1B2A",
              letterSpacing: "0.05em",
            }}
          >
            NEW
          </div>
        )}
      </div>

      {/* Label Text below the Badge container */}
      <span
        className={`text-[11px] font-medium text-white text-center line-clamp-2 max-w-full leading-tight transition-opacity duration-300 ${
          unlocked ? "opacity-100" : "opacity-50"
        }`}
        style={{
          textShadow: unlocked ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}
