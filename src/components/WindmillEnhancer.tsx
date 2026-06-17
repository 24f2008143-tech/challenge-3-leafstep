/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trees, Wind, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface WindmillEnhancerProps {
  windSpeed: "normal" | "fast" | "breeze";
  showTurbines: boolean;
}

export default function WindmillEnhancer({ windSpeed, showTurbines }: WindmillEnhancerProps) {
  // Determine spin duration based on speed
  const getSpinDuration = () => {
    if (windSpeed === "fast") return "4s";
    if (windSpeed === "breeze") return "12s";
    return "7s"; // normal
  };

  return (
    <div className="fixed inset-y-0 left-0 right-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Embedded Keyframe Styles for ultra-smooth animations without index.css modifications */}
      <style>{`
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes smooth-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: subtle-float 8s ease-in-out infinite;
        }
        .rotor-spin {
          transform-origin: 100px 105px;
          animation: smooth-spin var(--spin-duration, 7s) linear infinite;
        }
        .rotor-spin-secondary {
          transform-origin: 60px 65px;
          animation: smooth-spin var(--spin-duration, 8.5s) linear infinite;
        }
      `}</style>

      {/* Large Wind Turbine on Lower Left Margin (visible on medium viewports and up if showTurbines is true) */}
      {showTurbines && (
        <div 
          className="absolute left-4 sm:left-6 bottom-[8%] hidden md:flex flex-col items-center opacity-[0.24] hover:opacity-[0.5] transition-opacity duration-500 animate-float pointer-events-auto cursor-help select-none origin-bottom-left scale-90 lg:scale-100"
          style={{ "--spin-duration": getSpinDuration() } as React.CSSProperties}
          title="Eco-grid Energy Harvester. Click the speed control panel to shift wind power."
        >
          <svg
            width="200"
            height="320"
            viewBox="0 0 200 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm"
          >
            {/* Tower support tower leg */}
            <path
              d="M96 102L84 320H116L104 102H96Z"
              fill="url(#towerGrad)"
              stroke="#1B4332"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            
            {/* Rotor hub center circle */}
            <circle cx="100" cy="105" r="7" fill="#2D6A4F" stroke="#1B4332" strokeWidth="2" />

            {/* 3-Blade Windmill Rotor Head */}
            <g className="rotor-spin">
              {/* Blade 1 (pointing up) */}
              <path
                d="M100 105C100 80 97 40 98.5 15C100 40 103 80 100 105Z"
                fill="url(#bladeGrad)"
                stroke="#2D6A4F"
                strokeWidth="1"
              />
              {/* Blade 2 (pointing bottom right) */}
              <path
                d="M100 105C118.5 121.5 149 146.5 170.5 159C149 137.5 118.5 116.5 100 105Z"
                fill="url(#bladeGrad)"
                stroke="#2D6A4F"
                strokeWidth="1"
              />
              {/* Blade 3 (pointing bottom left) */}
              <path
                d="M100 105C81.5 121.5 51 146.5 29.5 159C51 137.5 81.5 116.5 100 105Z"
                fill="url(#bladeGrad)"
                stroke="#2D6A4F"
                strokeWidth="1"
              />
              
              {/* Tiny accent on each blade edge */}
              <circle cx="98.5" cy="15" r="1.5" fill="#52B788" />
              <circle cx="170.5" cy="159" r="1.5" fill="#52B788" />
              <circle cx="29.5" cy="159" r="1.5" fill="#52B788" />
            </g>

            {/* Ground flora / small bushes at the bottom of the mill */}
            <ellipse cx="100" cy="320" rx="35" ry="8" fill="#1B4332" fillOpacity="0.15" />
            
            <defs>
              <linearGradient id="towerGrad" x1="84" y1="320" x2="116" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A3E635" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="bladeGrad" x1="100" y1="15" x2="100" y2="105" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A3E635" stopOpacity="0.8" />
                <stop offset="80%" stopColor="#E2ECE8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Small informational pill attached below */}
          <div className="mt-1 bg-white/70 px-2.5 py-1 rounded-full border border-emerald-100 text-[10px] font-sans font-bold text-emerald-800 backdrop-blur-sm shadow-xs flex items-center gap-1">
            <Wind className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>Clean Yield: 2.4 MW</span>
          </div>
        </div>
      )}

      {/* Medium Wind Turbine on Lower Right Margin (visible if showTurbines is true) */}
      {showTurbines && (
        <div 
          className="absolute right-10 top-[22%] hidden md:flex flex-col items-center opacity-[0.18] hover:opacity-[0.45] transition-opacity duration-500 animate-float pointer-events-auto cursor-help select-none origin-top-right scale-90 lg:scale-100"
          style={{ 
            "--spin-duration": windSpeed === "fast" ? "4.5s" : windSpeed === "breeze" ? "13s" : "8.5s",
            animationDelay: "1.5s"
          } as React.CSSProperties}
          title="Auxiliary wind tracker. Feeds real-time carbon offset telemetry."
        >
          <svg
            width="120"
            height="200"
            viewBox="0 0 120 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Tower support tower leg */}
            <path
              d="M58 63L50 200H70L62 63H58Z"
              fill="url(#towerGradSec)"
              stroke="#1B4332"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            
            {/* Rotor hub center circle */}
            <circle cx="60" cy="65" r="4.5" fill="#2D6A4F" stroke="#1B4332" strokeWidth="1" />

            {/* Blades */}
            <g className="rotor-spin-secondary">
              {/* Blade 1 */}
              <path
                d="M60 65C60 48 58 20 59 5C60 20 62 48 60 65Z"
                fill="url(#bladeGradSec)"
                stroke="#2D6A4F"
                strokeWidth="0.8"
              />
              {/* Blade 2 */}
              <path
                d="M60 65C72 76 92 92 106 100C92 86 72 72 60 65Z"
                fill="url(#bladeGradSec)"
                stroke="#2D6A4F"
                strokeWidth="0.8"
              />
              {/* Blade 3 */}
              <path
                d="M60 65C48 76 28 92 14 100C28 86 48 72 60 65Z"
                fill="url(#bladeGradSec)"
                stroke="#2D6A4F"
                strokeWidth="0.8"
              />
            </g>

            <defs>
              <linearGradient id="towerGradSec" x1="50" y1="200" x2="70" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="bladeGradSec" x1="60" y1="5" x2="60" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="mt-1 bg-white/60 px-2.5 py-0.5 rounded-full border border-emerald-50 text-[9px] font-mono text-emerald-700 backdrop-blur-xs">
            960 kW
          </div>
        </div>
      )}
    </div>
  );
}
