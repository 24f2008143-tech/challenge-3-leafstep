import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { BadgeData } from "./BadgeGrid";

interface BadgeUnlockModalProps {
  badge: BadgeData;
  onClose: () => void;
  aeroCreditsEarned: number;
}

const TIER_COLORS = {
  seed: "#4CAF50",
  sprout: "#C8F500",
  grove: "#00E5FF",
  canopy: "#FFB800",
  storm: "#7C3AED",
  legend: "#E040FB", // Vibrant backup for text/particles
};

const TIER_BGS = {
  seed: "#1B3A1F",
  sprout: "#1C2A0A",
  grove: "#0A1F2A",
  canopy: "#2A1A00",
  storm: "#1A0A2A",
  legend: "#0D1B2A",
};

const TIER_PARTICLE_COLORS = {
  seed: ["#4CAF50", "#81C784", "#388E3C", "#2E7D32", "#A5D6A7", "#C8F500"],
  sprout: ["#C8F500", "#DDFB44", "#AFE600", "#EAFE7C", "#769B00", "#9BE106"],
  grove: ["#00E5FF", "#33ECFF", "#00B2CC", "#80F3FF", "#0097A7", "#B2F9FF"],
  canopy: ["#FFB800", "#FFA000", "#FFC107", "#FFE082", "#FF8F00", "#FFD54F"],
  storm: ["#7C3AED", "#6D28D9", "#8B5CF6", "#A78BFA", "#C4B5FD", "#00E5FF"],
  legend: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#00E5FF", "#7C3AED", "#FF007F", "#E040FB"],
};

interface Particle {
  id: number;
  xDest: number;
  yDest: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

export default function BadgeUnlockModal({
  badge,
  onClose,
  aeroCreditsEarned,
}: BadgeUnlockModalProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const tierColor = TIER_COLORS[badge.tier] || TIER_COLORS.seed;
  const tierBg = TIER_BGS[badge.tier] || TIER_BGS.seed;

  // Generate 24 randomized particles radiating outward from center
  useEffect(() => {
    // Focus the card for screen readers / keyboard control
    if (cardRef.current) {
      cardRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    setHasMounted(true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const generated: Particle[] = [];
    const palette = TIER_PARTICLE_COLORS[badge.tier] || TIER_PARTICLE_COLORS.seed;
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15 * Math.PI) / 180; // evenly spread, slightly randomized below
      const randAngle = angle + (Math.random() - 0.5) * 0.15;
      const distance = 60 + Math.random() * 80; // 60px to 140px
      const xDest = Math.cos(randAngle) * distance;
      const yDest = Math.sin(randAngle) * distance;
      const color = palette[i % palette.length];
      const size = 3 + Math.round(Math.random() * 5); // 3px to 8px
      const delay = 0.52 + Math.random() * 0.28; // Staggered around the badge drop-in moment
      const duration = 0.7 + Math.random() * 0.6; // 700ms to 1300ms

      generated.push({
        id: i,
        xDest,
        yDest,
        color,
        size,
        delay,
        duration,
      });
    }
    setParticles(generated);
  }, [badge.tier]);

  // Resolve Lucide Icon Component if exists
  const IconComponent = (Icons as any)[badge.icon];

  const renderBadgeIcon = () => {
    if (IconComponent) {
      return (
        <IconComponent
          size={36}
          style={{ color: badge.tier === "legend" ? "#FFFFFF" : tierColor }}
        />
      );
    }
    return <span className="text-3xl select-none leading-none">{badge.icon}</span>;
  };

  // Convert "BADGE UNLOCKED" into characters for staggered typing animation
  const titleText = "BADGE UNLOCKED";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }} // Step 1: Overlay fades in (opacity 0→1, 300ms)
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        id="badge-unlock-overlay"
      >
        {/* Modal Card wrapper */}
        <motion.div
          ref={cardRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Badge Unlocked"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: [0.7, 1.05, 1], opacity: 1 }}
          transition={{
            delay: 0.3, // Step 2: Scales in after 300ms
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className="relative max-w-sm w-full bg-[#0D1B2A] rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-2xl focus:outline-none"
          style={{
            border: `1.5px solid ${tierColor}`,
            boxShadow: `0 10px 40px -10px ${tierColor}40, inset 0 0 20px rgba(0, 0, 0, 0.4)`,
          }}
          onClick={(e) => e.stopPropagation()}
          id="badge-unlock-modal-card"
        >
          {/* Legend conic visual border inside the popup */}
          {badge.tier === "legend" && (
            <div
              className="absolute inset-0 rounded-[22.5px] pointer-events-none opacity-40"
              style={{
                background:
                  "conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00E5FF, #7C3AED, #FF007F, #FF0000)",
                animation: "spin 4s linear infinite",
              }}
            />
          )}

          {/* 1. BADGE UNLOCKED Title */}
          <div className="h-6 flex items-center justify-center overflow-hidden mb-6 z-10">
            {titleText.split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.9 + index * 0.04, // Step 5: Starts typing at 900ms, stagger 0.04s per char
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className="text-[11px] font-black uppercase tracking-wider font-mono select-none"
                style={{
                  color: tierColor,
                  letterSpacing: "0.2em",
                  textShadow: `0 0 8px ${tierColor}60`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>

          {/* Badge Icon & Sparkles Area */}
          <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-6">
            
            {/* Step 4: Particle Burst (Starts at 700ms) */}
            {hasMounted &&
              particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: p.xDest,
                    y: p.yDest,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    delay: p.delay, // Organic staggered starting point matching drop keyframe
                    duration: p.duration, // Staggered fadeout/gravity timing
                    ease: "easeOut",
                  }}
                  className="absolute rounded-full pointer-events-none z-20"
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 8px ${p.color}, 0 0 3px ${p.color}`,
                    top: "calc(50% - 4px)",
                    left: "calc(50% - 4px)",
                  }}
                />
              ))}

            {/* Static Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full bg-transparent border border-dashed opacity-25"
              style={{
                borderColor: tierColor,
                animation: "spin 20s linear infinite",
              }}
            />

            {/* Step 3: Badge icon drops in from above (y: -40→0, spring, starts at 500ms) */}
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5, // Step 3 drops in at 500ms
                type: "spring",
                stiffness: 280,
                damping: 18,
              }}
              className="relative w-[80px] h-[80px] rounded-[16px] flex items-center justify-center z-10 overflow-hidden"
              style={{
                backgroundColor: tierBg,
                border: badge.tier === "legend" ? "none" : `2px solid ${tierColor}`,
                boxShadow:
                  badge.tier === "legend"
                    ? "0 0 25px rgba(200,245,0,0.6), 0 0 10px rgba(0,229,255,0.6)"
                    : `0 0 20px ${tierColor}80, inset 0 0 10px ${tierColor}40`,
              }}
            >
              {/* Legend background spinner in modal badge */}
              {badge.tier === "legend" && (
                <>
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
                    className="absolute inset-[2.5px] rounded-[13.5px] flex items-center justify-center overflow-hidden z-[1]"
                    style={{ backgroundColor: tierBg }}
                  />
                </>
              )}

              <div className="z-[2] flex items-center justify-center">
                {renderBadgeIcon()}
              </div>
            </motion.div>
          </div>

          {/* Step 6: Badge info staggers in after 1100ms */}
          <div className="space-y-4 w-full z-10">
            {/* 3. Badge Label */}
            <motion.h4
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }} // starts at 1100ms
              className="text-22px text-white font-bold text-2xl tracking-tight select-none"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}
            >
              {badge.label}
            </motion.h4>

            {/* 4. Badge Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }} // 1100 + 100ms
              className="text-[13px] text-white/70 font-medium leading-relaxed max-w-sm px-2 select-none"
            >
              {badge.description}
            </motion.p>

            {/* 5. AC Reward Chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }} // 1100 + 200ms
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full select-none"
              style={{
                backgroundColor: "rgba(200, 245, 0, 0.1)",
                border: "1px solid rgba(200, 245, 0, 0.3)",
              }}
            >
              <span className="text-[10px] font-black uppercase text-slate-400">Bonus unlocked</span>
              <span className="text-xs font-extrabold text-[#C8F500]">
                +{aeroCreditsEarned} AC
              </span>
            </motion.div>

            {/* 6. Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }} // 1100 + 300ms
              className="pt-4"
            >
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-[#C8F500] hover:bg-[#b8e600] active:translate-y-[1px] transition-all text-[#0D1B2A] text-xs font-black uppercase tracking-wider rounded-full shadow-lg"
                style={{
                  boxShadow: "0 4px 15px rgba(200, 245, 0, 0.25)",
                }}
                id="badge-unlock-modal-continue"
              >
                Continue
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
