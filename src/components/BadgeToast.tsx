import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { BadgeData } from "./BadgeGrid";

interface BadgeToastProps {
  key?: React.Key;
  badge: BadgeData;
  onDismiss: () => void;
  autoDismissMs?: number; // default 4000
}

const TIER_COLORS = {
  seed: "#4CAF50",
  sprout: "#C8F500",
  grove: "#00E5FF",
  canopy: "#FFB800",
  storm: "#7C3AED",
  legend: "#E040FB",
};

const TIER_BGS = {
  seed: "#1B3A1F",
  sprout: "#1C2A0A",
  grove: "#0A1F2A",
  canopy: "#2A1A00",
  storm: "#1A0A2A",
  legend: "#0D1B2A",
};

export default function BadgeToast({
  badge,
  onDismiss,
  autoDismissMs = 4000,
}: BadgeToastProps) {
  const [timeLeft, setTimeLeft] = useState(autoDismissMs);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const tierColor = TIER_COLORS[badge.tier] || TIER_COLORS.seed;
  const tierBg = TIER_BGS[badge.tier] || TIER_BGS.seed;

  // React-based precise timer for pausing progress bar and countdown
  useEffect(() => {
    lastTickRef.current = Date.now();
    const tick = () => {
      if (!isHovered) {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        setTimeLeft((prev) => {
          const nextVal = prev - delta;
          if (nextVal <= 0) {
            onDismiss();
            return 0;
          }
          return nextVal;
        });
      }
      lastTickRef.current = Date.now();
    };

    const intervalId = setInterval(tick, 30);
    return () => clearInterval(intervalId);
  }, [isHovered, onDismiss]);

  const IconComp = (Icons as any)[badge.icon];

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    lastTickRef.current = Date.now(); // reset tick reference to avoid sudden time jumps
  };

  // Convert remaining time into a progress percentage
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / autoDismissMs) * 100));

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-[280px] bg-[#0D1B2A] rounded-[14px] p-3 shadow-2xl overflow-hidden border pointer-events-auto"
      style={{
        borderColor: tierColor,
        boxShadow: `0 8px 30px ${tierColor}33, inset 0 0 10px rgba(0, 0, 0, 0.4)`,
      }}
      id={`badge-toast-${badge.id}`}
    >
      <div className="flex items-start gap-3 select-none">
        {/* Compact Badge Icon (40px) */}
        <div
          className="relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden"
          style={{
            backgroundColor: tierBg,
            borderColor: tierColor,
            boxShadow: `0 0 8px ${tierColor}40`,
          }}
        >
          {badge.tier === "legend" && (
            <>
              {/* Special spinning background for Legend toast icon */}
              <div
                className="absolute inset-0 animate-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00E5FF, #7C3AED, #FF007F, #FF0000)",
                  animationDuration: "2.5s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}
              />
              <div
                className="absolute inset-[1.5px] rounded-[6px] z-[1]"
                style={{ backgroundColor: tierBg }}
              />
            </>
          )}

          <div className="z-[2] flex items-center justify-center">
            {IconComp ? (
              <IconComp size={18} style={{ color: tierColor }} />
            ) : (
              <span className="text-xl leading-none">{badge.icon}</span>
            )}
          </div>
        </div>

        {/* Text Column content */}
        <div className="flex-1 min-w-0 pr-1">
          <div
            className="text-[11px] font-semibold uppercase tracking-wider font-mono"
            style={{ color: tierColor, letterSpacing: "0.1em" }}
          >
            Badge Unlocked!
          </div>
          <div className="text-[14px] font-bold text-white leading-tight mt-0.5 truncate">
            {badge.label}
          </div>
          <div className="text-[12px] font-black text-[#C8F500] mt-0.5">
            +{badge.aeroCreditsReward ?? 100} AC
          </div>
        </div>

        {/* Dismiss Button (x) */}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors p-0.5 shrink-0 hover:bg-white/5 rounded"
          aria-label="Dismiss notification"
          id={`badge-toast-close-${badge.id}`}
        >
          <Icons.X size={14} />
        </button>
      </div>

      {/* Progress depletion bar at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: tierColor,
            boxShadow: `0 0 6px ${tierColor}`,
            transition: isHovered ? "none" : "width 50ms linear", // smooth progress update
          }}
        />
      </div>
    </motion.div>
  );
}

// Supporting multi-stack toast container helper components
export interface ToastItem {
  id: string; // unique event id
  badge: BadgeData;
}

interface BadgeToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function BadgeToastContainer({ toasts, onDismiss }: BadgeToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      id="badge-toast-wrapper-stack"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <BadgeToast
            key={toast.id}
            badge={toast.badge}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
