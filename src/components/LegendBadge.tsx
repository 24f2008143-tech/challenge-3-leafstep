import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";

interface LegendBadgeProps {
  label: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

const RAINBOW_PALETTE = [
  "#C8F500", // Neon Lime
  "#00E5FF", // Cyan Glow
  "#7C3AED", // Violet/Storm
  "#FFB800", // Amber/Canopy
  "#FF4081", // Rose Pink
  "#00FF00", // Bright Green
];

const ORBIT_SPEEDS = [4, 4.5, 5, 3.8, 4.2, 5.5]; // speeds in seconds

export default function LegendBadge({
  label,
  icon,
  unlocked,
  description,
}: LegendBadgeProps) {
  // Resolve Lucide symbol if matching
  const IconComponent = (Icons as any)[icon];

  const renderIcon = () => {
    if (IconComponent) {
      return (
        <IconComponent
          size={32}
          className="shrink-0"
          style={{
            color: unlocked ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
            filter: unlocked ? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))" : "none",
          }}
        />
      );
    }
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

  return (
    <div
      className="flex flex-col items-center justify-start w-[100px] select-none relative"
      title={description}
      id={`legend-badge-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {/* 80x80px bounding container area */}
      <div className="relative w-[80px] h-[80px] flex items-center justify-center mb-2">
        
        {/* Orbiting particles aura (unlocked only) */}
        {unlocked &&
          RAINBOW_PALETTE.map((color, idx) => {
            const startAngle = idx * 60; // 60 degree intervals
            const speed = ORBIT_SPEEDS[idx] || 4.5;

            return (
              <motion.div
                key={idx}
                className="absolute top-1/2 left-1/2 w-0 h-0 z-0 pointer-events-none"
                initial={{ rotate: startAngle }}
                animate={{ rotate: startAngle + 360 }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: speed,
                }}
              >
                {/* Visual Particle offset 52px from center */}
                <div
                  className="absolute w-1.5 h-1.5 rounded-full pointer-events-none -translate-x-[3px] -translate-y-[52px]"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px 1.5px ${color}`,
                  }}
                />
              </motion.div>
            );
          })}

        {/* Outer rotating conic-gradient border container (80x80px, overflow clipped) */}
        <div className="relative w-[80px] h-[80px] rounded-[16px] overflow-hidden flex items-center justify-center z-10 shadow-2xl">
          
          {/* Infinitely rotating conic gradient background layer */}
          <motion.div
            className="absolute w-[140px] h-[140px]"
            animate={{ rotate: [0, 360] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 3, // 3s linear infinite
            }}
            style={{
              background: "conic-gradient(#C8F500, #00E5FF, #7C3AED, #FFB800, #FF4081, #C8F500)",
            }}
          />

          {/* Inner body card overlay, covers the center to expose rotating border */}
          <div
            className="absolute inset-[3px] rounded-[13px] bg-[#0D1B2A] flex items-center justify-center overflow-hidden z-20"
            style={{
              boxShadow: "inset 0 0 20px rgba(200, 245, 0, 0.08)",
            }}
          >
            {/* Custom Icon / Emoji Centered */}
            <div
              className={`z-10 flex items-center justify-center ${
                !unlocked ? "filter grayscale opacity-40" : ""
              }`}
            >
              {renderIcon()}
            </div>

            {/* Lock State 40% Opacity Overlay & Padlock */}
            {!unlocked && (
              <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center rounded-[12px]">
                <span className="text-[20px] select-none opacity-60">🔒</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Label Text below the legendary badge */}
      <span
        className={`text-[11px] font-medium text-white text-center line-clamp-2 max-w-full leading-tight transition-opacity duration-300 ${
          unlocked ? "opacity-100" : "opacity-50"
        }`}
        style={{
          textShadow: unlocked
            ? "0 0 8px rgba(200, 245, 0, 0.3), 0 1px 2px rgba(0,0,0,0.8)"
            : "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}
