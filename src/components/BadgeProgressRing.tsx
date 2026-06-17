import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface BadgeProgressRingProps {
  progress: number; // 0–100
  size?: number; // outer diameter in px
  tierColor: string; // hex colour for the arc stroke
  strokeWidth?: number;
}

export default function BadgeProgressRing({
  progress,
  size = 80,
  tierColor,
  strokeWidth = 3,
}: BadgeProgressRingProps) {
  // Clamp progress to safe ranges [0, 100]
  const safeProgress = Math.min(100, Math.max(0, progress));

  // Determine geometry parameters
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  // Set up motion values for animating the progress arc
  const progressValue = useMotionValue(0);

  // Map progress [0, 100] to strokeDashoffset [circumference, 0]
  const strokeDashoffset = useTransform(
    progressValue,
    [0, 100],
    [circumference, 0]
  );

  // Handle the progress ring's tip coordinates dynamically
  const angle = useTransform(progressValue, (v) => (v * 2 * Math.PI) / 100);
  const dotX = useTransform(angle, (a) => cx + r * Math.cos(a));
  const dotY = useTransform(angle, (a) => cy + r * Math.sin(a));

  // Hide the dot when there is no visible progress
  const dotOpacity = useTransform(progressValue, (v) => (v > 0.5 ? 1 : 0));

  // Play the entrance progress animation on mount
  useEffect(() => {
    const controls = animate(progressValue, safeProgress, {
      duration: 0.8, // 800ms
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [safeProgress, progressValue]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
      id="badge-progress-ring-container"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Full grey circle background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          className="stroke-white/8"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic progress arc layer */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={tierColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
        />

        {/* Tip highlight glowing dot */}
        <motion.circle
          cx={dotX}
          cy={dotY}
          r={strokeWidth * 1.25}
          fill={tierColor}
          style={{
            opacity: dotOpacity,
            filter: `drop-shadow(0 0 4px ${tierColor})`,
          }}
        />
      </svg>
    </div>
  );
}
