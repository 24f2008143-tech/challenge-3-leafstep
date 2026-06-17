/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { STATE_DECARBONIZATION_GUIDE } from "../data/stateClimateAdvices";
import * as d3 from "d3";
import { supabase } from "../supabaseClient";
import {   Zap, 
  Clock, 
  Activity, 
  Sliders, 
  Server, 
  Compass, 
  CheckCircle, 
  Sparkles, 
  RefreshCw, 
  Info,
  Flame,
  Award,
  TrendingUp,
  Database,
  Calendar,
  ShieldAlert,
  Copy,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppState, ActivityLog } from "../types";
import IndiaGridMap from "./IndiaGridMap";
import IndiaEmissionMap from "./IndiaEmissionMap";

interface GridZoneData {
  region_code: string;
  state_code: string;
  region_name: string;
  current_load_mw: number;
  peak_load_mw: number;
  load_percentage: number;
  grid_frequency_hz: number;
  thermal_share_percent: number;
  renewable_share_percent: number;
  status: "NORMAL" | "ELEVATED" | "HIGH" | "CRITICAL";
  demand_driver: string;
  last_updated: string;
}

interface GridOptimizerProps {
  state: AppState;
  onSaveAndApplyState: (newState: AppState) => Promise<void>;
  triggerToast: (message: string, type: "success" | "info" | "error") => void;
}

interface DataPoint {
  time: string;
  value: number;
  isNow?: boolean;
}

function generateTrendData(region: string, currentValue: number): DataPoint[] {
  const data: DataPoint[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
    const hour = d.getHours();
    
    // Base load curve tailored to the active region based on historical benchmarks
    let base = 65;
    if (region === "ERLDC" || region === "WB" || region === "BR" || region === "SK" || region === "JH" || region === "OD") {
      base = 76;
    } else if (region === "SRLDC" || region === "KA" || region === "TN" || region === "KL" || region === "AP" || region === "TS") {
      base = 56;
    } else if (region === "NRLDC" || region === "DL" || region === "UP" || region === "RJ" || region === "PB" || region === "HR" || region === "HP" || region === "UK" || region === "JK") {
      base = 70;
    } else if (region === "WRLDC" || region === "MH" || region === "GJ" || region === "MP" || region === "CG" || region === "GA") {
      base = 67;
    } else if (region === "NERLDC" || region === "AS" || region === "AR" || region === "ML" || region === "MN" || region === "MZ" || region === "NL" || region === "TR") {
      base = 60;
    }

    // Peak 1: Mid-day/afternoon cooling (peaks around 2 PM to 5 PM, i.e., 14:00 to 17:00)
    const peakMidday = 14 * Math.exp(-Math.pow((hour - 14) / 4, 2));
    // Peak 2: Evening lighting/appliance peak (peaks around 8 PM, i.e., 20:00)
    const peakEvening = 18 * Math.exp(-Math.pow((hour - 20) / 3, 2));

    let val = base + peakMidday + peakEvening;
    // Cap values between 35% and 98%
    val = Math.max(35, Math.min(98, val));
    
    // Add small deterministic variance
    val += Math.sin(hour * 0.7) * 3;
    val = Math.round(val);

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true
    });

    data.push({
      time: timeStr,
      value: i === 0 ? currentValue : val,
      isNow: i === 0
    });
  }
  return data;
}

export function GridTrendChart({ region, currentValue }: { region: string; currentValue: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [width, setWidth] = useState<number>(600);
  const [loading, setLoading] = useState<boolean>(false);
  const [usingSimulation, setUsingSimulation] = useState<boolean>(false);
  const height = 180;

  // Set up ResizeObserver to handle container resize events fluidly
  useEffect(() => {
    if (!containerRef.current) return;
    let timeoutId: number;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: contentWidth } = entries[0].contentRect;
      if (contentWidth > 0) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setWidth(contentWidth), 150);
      }
    });
    observer.observe(containerRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  // Fetch real-time grid_readings from Supabase, or fall back to simulation
  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from("grid_readings")
          .select("timestamp, load_percentage")
          .eq("region_code", region)
          .gte("timestamp", twentyFourHoursAgo)
          .order("timestamp", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0 && active) {
          const points: DataPoint[] = data.map((reading: any) => {
            const timeDate = new Date(reading.timestamp);
            const timeStr = timeDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true
            });
            return {
              time: timeStr,
              value: Number(reading.load_percentage),
              isNow: false
            };
          });

          // Append or merge the current live user/slider adjustment as the active reference
          const nowStr = new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
          });
          points.push({
            time: nowStr,
            value: currentValue,
            isNow: true
          });

          setDataPoints(points);
          setUsingSimulation(false);
        } else {
          // If table returned empty, fall back to simulated trend metrics
          if (active) {
            setDataPoints(generateTrendData(region, currentValue));
            setUsingSimulation(true);
          }
        }
      } catch (err) {
        console.warn("[GridTrendChart] Failed to load Supabase grid_readings history, activating fallback:", err);
        if (active) {
          setDataPoints(generateTrendData(region, currentValue));
          setUsingSimulation(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      active = false;
    };
  }, [region, currentValue]);

  useEffect(() => {
    if (!svgRef.current || dataPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const margin = { top: 20, right: 25, bottom: 25, left: 35 };

    const chartWidth = Math.max(280, width - margin.left - margin.right);
    const chartHeight = height - margin.top - margin.bottom;

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scalePoint()
      .domain(dataPoints.map(d => d.time))
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // Grid lines for horizontal grid scale readability
    chartGroup.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.08)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => "")
      );

    // X Axis with dynamic label frequency based on chartWidth to prevent overlapping Labels
    const tickStep = chartWidth < 400 ? 3 : 2;
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickValues(dataPoints.filter((_, idx) => idx % tickStep === 0).map(d => d.time)))
      .attr("font-family", "monospace")
      .attr("font-size", "8px")
      .attr("color", "#94a3b8")
      .selectAll("text")
      .attr("opacity", 0.8);

    // Y Axis
    chartGroup.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + "%"))
      .attr("font-family", "monospace")
      .attr("font-size", "8px")
      .attr("color", "#94a3b8")
      .selectAll("text")
      .attr("opacity", 0.8);

    const isPeak = currentValue >= 80;
    const colorTheme = currentValue >= 90 ? "#f43f5e" : currentValue >= 80 ? "#f59e0b" : "#10b981";
    const gradientId = `trend-gradient-${region}-${currentValue}`;

    // Define linear area gradient for graph fill
    const defs = svg.append("defs");
    const areaGradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorTheme)
      .attr("stop-opacity", 0.35);

    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorTheme)
      .attr("stop-opacity", 0.0);

    // Area path
    const areaGenerator = d3.area<DataPoint>()
      .x(d => xScale(d.time) || 0)
      .y0(chartHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    chartGroup.append("path")
      .datum(dataPoints)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", areaGenerator);

    // Line path drawing
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.time) || 0)
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    chartGroup.append("path")
      .datum(dataPoints)
      .attr("fill", "none")
      .attr("stroke", colorTheme)
      .attr("stroke-width", 2.5)
      .attr("d", lineGenerator);

    // Peak threshold guideline at 80% (High)
    chartGroup.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(80))
      .attr("x2", chartWidth)
      .attr("y2", yScale(80))
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5);

    chartGroup.append("text")
      .attr("x", chartWidth - 5)
      .attr("y", yScale(80) - 4)
      .attr("text-anchor", "end")
      .attr("font-size", "7px")
      .attr("font-family", "monospace")
      .attr("fill", "#f59e0b")
      .attr("font-weight", "bold")
      .text("HIGH THRESHOLD (80%)");

    // Critical threshold guideline at 90% (Critical)
    chartGroup.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(90))
      .attr("x2", chartWidth)
      .attr("y2", yScale(90))
      .attr("stroke", "#f43f5e")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5);

    chartGroup.append("text")
      .attr("x", chartWidth - 5)
      .attr("y", yScale(90) - 4)
      .attr("text-anchor", "end")
      .attr("font-size", "7px")
      .attr("font-family", "monospace")
      .attr("fill", "#f43f5e")
      .attr("font-weight", "bold")
      .text("CRITICAL STRAIN (90%)");

    // Interactive circular nodes along path
    chartGroup.selectAll<SVGCircleElement, DataPoint>("circle.point")
      .data(dataPoints)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d: DataPoint) => xScale(d.time) || 0)
      .attr("cy", (d: DataPoint) => yScale(d.value))
      .attr("r", (d: DataPoint) => d.isNow ? 6 : 3.5)
      .attr("fill", (d: DataPoint) => d.isNow ? colorTheme : "#1e293b")
      .attr("stroke", (d: DataPoint) => d.isNow ? "#ffffff" : colorTheme)
      .attr("stroke-width", (d: DataPoint) => d.isNow ? 2 : 1.5)
      .style("cursor", "pointer")
      .append("title")
      .text((d: DataPoint) => `${d.time}: ${d.value}% load`);

    // Concentric glowing pulse indicator on high-load events for active center
    if (isPeak) {
      const nowPoint = dataPoints[dataPoints.length - 1];
      const nowX = xScale(nowPoint.time) || 0;
      const nowY = yScale(nowPoint.value);

      chartGroup.append("circle")
        .attr("cx", nowX)
        .attr("cy", nowY)
        .attr("r", 10)
        .attr("fill", "none")
        .attr("stroke", colorTheme)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", "6;16")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite");

      chartGroup.append("circle")
        .attr("cx", nowX)
        .attr("cy", nowY)
        .attr("r", 10)
        .attr("fill", "none")
        .attr("stroke", colorTheme)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8)
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "1;0")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite");
    }

  }, [dataPoints, region, currentValue, width]);

  return (
    <div ref={containerRef} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-inner w-full">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 text-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-black tracking-wider uppercase font-mono">
            24-Hour Regional Load Profile ({region})
          </h4>
          {usingSimulation && (
            <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded animate-pulse">
              Simulated
            </span>
          )}
          {loading && !usingSimulation && (
            <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Warning
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Peak
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto overflow-y-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} 180`}
            style={{ width: "100%", height: "180px" }}
            className="min-w-[280px]"
          />
        </div>
      </div>
    </div>
  );
}

export function GridBackgroundAnimation({ loadPercentage }: { loadPercentage: number }) {
  // Speed and ambient colors are dynamically adjusted based on grid load percentage
  const pulseColor = loadPercentage >= 90 
    ? "rgba(244, 63, 94, 0.08)"  // rose-500
    : loadPercentage >= 80 
    ? "rgba(245, 158, 11, 0.07)" // amber-500
    : "rgba(16, 185, 129, 0.05)"; // emerald-500

  const strokeColor = loadPercentage >= 90
    ? "#ef4444"
    : loadPercentage >= 80
    ? "#f59e0b"
    : "#10b981";

  // Framer Motion path animation speed depends on grid congestion
  const duration = loadPercentage >= 90 ? 2 : loadPercentage >= 80 ? 4 : 7;

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none sm:rounded-3xl">
      {/* Dynamic ambient background glow */}
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: pulseColor }}
      />
      
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: duration * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: pulseColor }}
      />

      {/* SVG Grid Structure with Framer Motion animated paths */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.22] sm:rounded-3xl" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="animated-bg-grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path 
              d="M 50 0 L 0 0 0 50" 
              fill="none" 
              stroke="#cbd5e1" 
              strokeWidth="0.5" 
              strokeOpacity="0.3" 
            />
            {/* Tiny intersection dots */}
            <circle cx="0" cy="0" r="1" fill="#94a3b8" fillOpacity="0.4" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#animated-bg-grid)" />

        {/* Dynamic scanning grid lines / signal currents */}
        <g stroke={strokeColor} strokeWidth="1" strokeLinecap="round" opacity="0.6">
          {/* Vertical moving pulse line */}
          <motion.line
            x1="100"
            y1="0"
            x2="100"
            y2="100%"
            strokeDasharray="4,8"
            animate={{
              y1: ["0%", "100%"],
              y2: ["0%", "100%"],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: duration * 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <motion.line
            x1="300"
            y1="0"
            x2="300"
            y2="100%"
            strokeDasharray="4,8"
            animate={{
              y1: ["100%", "0%"],
              y2: ["100%", "0%"],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Horizontal moving pulse line */}
          <motion.line
            x1="0"
            y1="250"
            x2="100%"
            y2="250"
            strokeDasharray="5,10"
            animate={{
              x1: ["0%", "100%"],
              x2: ["0%", "100%"],
              opacity: [0.1, 0.6, 0.1]
            }}
            transition={{
              duration: duration * 1.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Glowing node pulses traversing paths */}
          <motion.circle
            r="3"
            fill={strokeColor}
            animate={{
              cx: ["50", "350", "350", "50", "50"],
              cy: ["100", "100", "400", "400", "100"],
              scale: [1, 1.3, 1, 1.3, 1]
            }}
            transition={{
              duration: duration * 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.circle
            r="2.5"
            fill={strokeColor}
            animate={{
              cx: ["400", "100", "100", "400", "400"],
              cy: ["300", "300", "50", "50", "300"],
              scale: [1, 1.4, 1, 1.4, 1]
            }}
            transition={{
              duration: duration * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </g>
      </svg>
    </div>
  );
}

interface FiredAlertParams {
  userId: string;
  regionCode: string;
  applianceId: string;
  applianceName: string;
  loadPercentage: number;
  savingsPercentage: number;
  advisoryText: string;
}

/**
 * GridAlertOrchestrator manages live smart grid alert distribution, 
 * automatically logging fired alerts into the 'grid_alerts_sent' database table in Supabase.
 */
export const GridAlertOrchestrator = {
  async logFiredAlert(params: FiredAlertParams) {
    try {
      const { data, error } = await supabase
        .from("grid_alerts_sent")
        .insert({
          user_id: params.userId,
          region_code: params.regionCode,
          appliance_id: params.applianceId,
          appliance_name: params.applianceName,
          load_percentage: Number(params.loadPercentage),
          savings_percentage: Number(params.savingsPercentage),
          advisory_text: params.advisoryText,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.warn("[GridAlertOrchestrator] Failed insertion:", error.message);
        return { success: false, error };
      }
      console.log("[GridAlertOrchestrator] Successfully logged grid alert inside Supabase:", params);
      return { success: true };
    } catch (err) {
      console.error("[GridAlertOrchestrator] Error logging alert:", err);
      return { success: false, error: err };
    }
  }
};

const APPLIANCE_PROFILES = [
  { id: "wash", name: "Washing Machine", power_w: 500, average_cycle_duration_hr: 0.75, co2_multiplier: 0.82, base_saving_g: 120, icon: "🧺" },
  { id: "geyser", name: "Electric Water Geyser", power_w: 2000, average_cycle_duration_hr: 0.5, co2_multiplier: 0.82, base_saving_g: 320, icon: "🚿" },
  { id: "ac", name: "Central Air Conditioner", power_w: 1500, average_cycle_duration_hr: 2, co2_multiplier: 0.82, base_saving_g: 960, icon: "❄️" },
  { id: "ev", name: "EV Fast Charger", power_w: 3300, average_cycle_duration_hr: 3, co2_multiplier: 0.82, base_saving_g: 3100, icon: "⚡" }
];

export default function GridOptimizer({ state, onSaveAndApplyState, triggerToast }: GridOptimizerProps) {
  const [zones, setZones] = useState<Record<string, GridZoneData>>({});
  const [selectedRegion, setSelectedRegion] = useState<string>("MH");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [advisoryLoading, setAdvisoryLoading] = useState<boolean>(false);
  const [customAdvisory, setCustomAdvisory] = useState<string>("");
  const [sliderVal, setSliderVal] = useState<number>(85);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>("wash");
  const [isSubmittingAdvisory, setIsSubmittingAdvisory] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [mapViewMode, setMapViewMode] = useState<"cartogram" | "geographic">("geographic");
  const [alertsHistory, setAlertsHistory] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);
  const [isDbSynced, setIsDbSynced] = useState<boolean>(false);

  // Ref to track last logged alert load percent and appliance to prevent duplicates/spam
  const lastLoggedAlertKeyRef = useRef<string>("");

  const emissionData = React.useMemo(() => {
    const mapNames: Record<string, string> = {
      "Jammu & Kashmir": "Jammu and Kashmir",
      "Odisha": "Orissa",
      "Uttarakhand": "Uttaranchal",
    };
    
    return (Object.values(zones) as GridZoneData[]).reduce((acc, z) => {
      if (!z.region_name) return acc;
      const load = z.current_load_mw || 0;
      const thermal = z.thermal_share_percent || 60;
      const emission = load * (thermal / 100) * 0.95;
      
      const targetName = mapNames[z.region_name] || z.region_name;
      
      acc[targetName] = {
        emission,
        load,
        status: z.status || "NORMAL"
      };
      return acc;
    }, {} as Record<string, { emission: number; load: number; status: string }>);
  }, [zones]);

  // Load grid readings from Express backend
  const fetchGridStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/grid/status");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.zones) {
          setZones(data.zones);
          
          let targetRegion = selectedRegion;
          const zoneKeys = Object.keys(data.zones);
          if (!data.zones[selectedRegion] && zoneKeys.length > 0) {
            // Find a valid fallback (prefer MH, otherwise first available state)
            const fallbackKey = zoneKeys.includes("MH") ? "MH" : zoneKeys[0];
            targetRegion = fallbackKey;
            setSelectedRegion(fallbackKey);
          }
          
          // Sync slider with actual backend state on start
          if (!silent && data.zones[targetRegion]) {
            setSliderVal(data.zones[targetRegion].load_percentage);
          }
        }
      }
    } catch (err) {
      console.error("[GridOptimizer] Failed to fetch grid status:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Mapping of state codes to State names in STATE_DECARBONIZATION_GUIDE
  const stateCodeToName: Record<string, string> = {
    "MH": "Maharashtra", "DL": "Delhi", "KA": "Karnataka", "GJ": "Gujarat", "TN": "Tamil Nadu",
    "UP": "Uttar Pradesh", "WB": "West Bengal", "AP": "Andhra Pradesh", "TS": "Telangana",
    "MP": "Madhya Pradesh", "RJ": "Rajasthan", "PB": "Punjab", "HR": "Haryana", "BR": "Bihar",
    "JH": "Jharkhand", "OD": "Odisha", "CG": "Chhattisgarh", "JK": "Jammu & Kashmir",
    "HP": "Himachal Pradesh", "UK": "Uttarakhand", "KL": "Kerala", "GA": "Goa", "AS": "Assam",
    "SK": "Sikkim", "TR": "Tripura", "ML": "Meghalaya", "MN": "Manipur", "NL": "Nagaland",
    "MZ": "Mizoram", "AR": "Arunachal Pradesh", "CH": "Chandigarh", "PY": "Puducherry",
    "LD": "Lakshadweep", "AN": "Andaman and Nicobar", "DN": "Dadra and Nagar Haveli", "DD": "Daman and Diu"
  };

  // Poll-based grid stress alerts
  useEffect(() => {
    if (!zones || !state.profile?.state_code) return;
    
    // Find zone for user's state
    const userStateZone = (Object.values(zones) as GridZoneData[]).find(z => z.state_code === state.profile?.state_code);
    if (!userStateZone) return;
    
    if (userStateZone.status === "ELEVATED" || userStateZone.status === "HIGH") {
       const stateName = stateCodeToName[userStateZone.state_code];
       const advice = STATE_DECARBONIZATION_GUIDE[stateName];
       
       if (advice) {
         const alertKey = `alert_${userStateZone.state_code}_${userStateZone.status}`;
         if (lastLoggedAlertKeyRef.current !== alertKey) {
            const peakHoursMsg = advice.peakHours ? ` Peak hours: ${advice.peakHours}.` : "";
            const strategyMsg = advice.strategies?.length > 0 ? ` Try: ${advice.strategies[0]}.` : "";
            
            triggerToast(`⚠️ Grid ${userStateZone.status} in ${stateName}.${peakHoursMsg}${strategyMsg}`, "error");
            lastLoggedAlertKeyRef.current = alertKey;
         }
       }
    }
  }, [zones, state.profile?.state_code]);

  // Fetch historical grid alerts from Supabase, or use simulated fallback
  const fetchAlertsHistory = async () => {
    setLoadingAlerts(true);
    try {
      const { data, error } = await supabase
        .from("grid_alerts_sent")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }
      if (data) {
        setAlertsHistory(data);
        setIsDbSynced(true);
      }
    } catch (err) {
      console.warn("[GridOptimizer] Failed to fetch grid_alerts_sent from Supabase. Active simulator:", err);
      setIsDbSynced(false);
      // Fallback: Generate some styled simulated historical records
      const simulatedLogs = [
        {
          id: "sim-alert-1",
          user_id: state?.user_id || "default_user",
          region_code: "WRLDC",
          appliance_id: "wash",
          appliance_name: "Washing Machine",
          load_percentage: 84,
          savings_percentage: 35,
          advisory_text: "Western Region load peak. Delayed laundry operation cycle by 2 hours, preventing peak coal-power reliance.",
          timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "sim-alert-2",
          user_id: state?.user_id || "default_user",
          region_code: "ERLDC",
          appliance_id: "geyser",
          appliance_name: "Electric Water Geyser",
          load_percentage: 92,
          savings_percentage: 45,
          advisory_text: "Critical Eastern dispatch grid choke. Scheduled water heating to off-peak slots.",
          timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "sim-alert-3",
          user_id: state?.user_id || "default_user",
          region_code: "SRLDC",
          appliance_id: "ac",
          appliance_name: "Central Air Conditioner",
          load_percentage: 79,
          savings_percentage: 20,
          advisory_text: "Southern Region grid elevated strain. Optimized smart thermostat temperature thresholds.",
          timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString()
        }
      ];
      setAlertsHistory(simulatedLogs);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchGridStatus();
    // Auto refresh every 15 seconds silently
    const interval = setInterval(() => fetchGridStatus(true), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAlertsHistory();
  }, [selectedRegion, state?.user_id]);

  const activeZone = zones[selectedRegion] || {
    region_code: selectedRegion,
    state_code: "GJ",
    region_name: "Western Region (Gujarat, Maharashtra)",
    current_load_mw: 18420,
    peak_load_mw: 21500,
    load_percentage: sliderVal,
    grid_frequency_hz: 49.97,
    thermal_share_percent: 67,
    renewable_share_percent: 28,
    status: sliderVal >= 90 ? "CRITICAL" : sliderVal >= 80 ? "HIGH" : sliderVal >= 70 ? "ELEVATED" : "NORMAL",
    demand_driver: "Simulated load balance state",
    last_updated: new Date().toISOString()
  };

  // Adjust/Spike the load on the backend
  const handleSliderChange = async (val: number) => {
    setSliderVal(val);
    try {
      const res = await fetch("/api/grid/trigger-spike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: selectedRegion, loadPercentage: val })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.zone) {
          setZones(prev => ({ ...prev, [selectedRegion]: data.zone }));
        }
      }
    } catch (err) {
      console.warn("[GridOptimizer] Failed to trigger live spike:", err);
    }
  };

  // Call Gemini to synthesize custom live grid advisories
  const generateAdvisory = async () => {
    setAdvisoryLoading(true);
    setCustomAdvisory("");
    const applianceObj = APPLIANCE_PROFILES.find(a => a.id === selectedApplianceId);
    
    try {
      const res = await fetch("/api/grid/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: selectedRegion,
          appliance: applianceObj?.name || "washing cycle",
          loadPercent: activeZone.load_percentage
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCustomAdvisory(data.advisory);
        }
      } else {
        throw new Error("Advisory backend failed");
      }
    } catch (err) {
      console.warn("Falling back to local helper copy:", err);
      const pct = activeZone.load_percentage;
      const reduction = pct >= 90 ? "40%" : pct >= 80 ? "35%" : "20%";
      setCustomAdvisory(`Evaluating ${activeZone.region_name} capacity. Shifting your ${applianceObj?.name} by 2 hours reduces active coal emissions by ${reduction}, mitigating primary boiler heat spikes during peak active load.`);
    } finally {
      setAdvisoryLoading(false);
    }
  };

  // Trigger advisory on appliance change or load level change
  useEffect(() => {
    if (activeZone) {
      generateAdvisory();
    }
  }, [selectedApplianceId, selectedRegion, activeZone?.load_percentage]);

  // Automatically log every fired alert above 80% load using the GridAlertOrchestrator
  useEffect(() => {
    if (!activeZone || activeZone.load_percentage < 80) return;

    const applianceObj = APPLIANCE_PROFILES.find(a => a.id === selectedApplianceId);
    if (!applianceObj) return;

    // Create a unique key for this combination of region, appliance, and load block (rounded to nearest 5%) to prevent DB spam when adjusting sliders
    const loadBlock = Math.round(activeZone.load_percentage / 5) * 5;
    const alertKey = `${selectedRegion}_${selectedApplianceId}_${loadBlock}`;

    if (lastLoggedAlertKeyRef.current === alertKey) {
      return; 
    }

    // Capture the current advisory text if finished loading, otherwise skip until it resolves
    if (advisoryLoading) return;

    const finalAdvisoryText = customAdvisory || `Heavy grid load detected in ${activeZone.region_name} at ${Math.round(activeZone.load_percentage)}%. Postponing current ${applianceObj.name} wash/charge load is advised.`;
    const savingsPct = activeZone.load_percentage >= 90 ? 45 : activeZone.load_percentage >= 80 ? 35 : 20;

    const fireAndLogAlert = async () => {
      lastLoggedAlertKeyRef.current = alertKey;
      console.log("[GridAlertOrchestrator] Firing grid load alert for: ", alertKey);
      
      await GridAlertOrchestrator.logFiredAlert({
        userId: state?.user_id || "default_user",
        regionCode: selectedRegion,
        applianceId: selectedApplianceId,
        applianceName: applianceObj.name,
        loadPercentage: Number(activeZone.load_percentage),
        savingsPercentage: savingsPct,
        advisoryText: finalAdvisoryText
      });

      // Refresh alert history so it shows in the table
      fetchAlertsHistory();
    };

    fireAndLogAlert();
  }, [activeZone?.load_percentage, selectedApplianceId, selectedRegion, customAdvisory, advisoryLoading, state?.user_id]);

  // Commit to Postpone Appliance Run! Logs a negative carbon footprint trace as compensation
  const commitPostponement = async () => {
    if (!state) return;
    setIsSubmittingAdvisory(true);

    const applianceObj = APPLIANCE_PROFILES.find(a => a.id === selectedApplianceId);
    if (!applianceObj) return;

    // Calculate dynamic carbon footprint savings
    const multiplier = activeZone.load_percentage >= 90 ? 1.35 : activeZone.load_percentage >= 80 ? 1.2 : 1.0;
    const powerKwh = (applianceObj.power_w / 1000) * applianceObj.average_cycle_duration_hr;
    const kgSavedRaw = powerKwh * applianceObj.co2_multiplier * (multiplier - 1.0) * 1.5 + (applianceObj.base_saving_g / 1000);
    const kgSavedFormatted = Number(kgSavedRaw.toFixed(2));

    const todayStr = new Date().toISOString().split("T")[0];

    const logItem: ActivityLog = {
      id: `grid_opt_sav_${Date.now()}`,
      date: todayStr,
      category: "energy",
      activity_name: `[Grid Load Decommitment] Postponed ${applianceObj.name} run (${activeZone.region_code})`,
      quantity: 1,
      unit: "action",
      kg_co2: -kgSavedFormatted, // Negative footprint is a credit / savings
      source: "manual"
    };

    // Award +50 Leaf points on decommitment
    const prevPoints = state.leaf_points ?? 350;
    const newPoints = prevPoints + 50;

    // Badge triggers
    const updatedBadges = [...(state.badges || ["onboarding_pioneers_badge"])];
    if (!updatedBadges.includes("grid_mastermind_certification")) {
      updatedBadges.push("grid_mastermind_certification");
    }

    // Recalculate rank locally
    let newRank = state.rank || "Seedling";
    if (newPoints >= 15000) newRank = "Carbon Champion";
    else if (newPoints >= 7500) newRank = "Earth Steward";
    else if (newPoints >= 4000) newRank = "Forest Keeper";
    else if (newPoints >= 2000) newRank = "Grove Guardian";
    else if (newPoints >= 1000) newRank = "Bamboo Walker";
    else if (newPoints >= 500) newRank = "Sapling";
    else if (newPoints >= 200) newRank = "Sprouting";

    const updatedState: AppState = {
      ...state,
      logs: [logItem, ...state.logs],
      leaf_points: newPoints,
      rank: newRank,
      badges: updatedBadges
    };

    try {
      await onSaveAndApplyState(updatedState);
      
      // Save entry to Supabase grid_alerts_sent table
      const savingsPct = activeZone.load_percentage >= 90 ? 45 : activeZone.load_percentage >= 80 ? 35 : 20;
      const { error: insertErr } = await supabase
        .from("grid_alerts_sent")
        .insert({
          user_id: state?.user_id || "default_user",
          region_code: selectedRegion,
          appliance_id: selectedApplianceId,
          appliance_name: applianceObj.name,
          load_percentage: Number(activeZone.load_percentage),
          savings_percentage: savingsPct,
          advisory_text: customAdvisory || `Delayed ${applianceObj.name} run in response to heavy grid load at ${activeZone.load_percentage}%.`,
          timestamp: new Date().toISOString()
        });

      if (insertErr) {
        console.warn("[GridOptimizer] Failed logging grid_alerts_sent entry directly, using local synchronization cache (table may not exist yet in Supabase):", insertErr.message);
      } else {
        console.log("[GridOptimizer] Successfully logged grid alert inside Supabase!");
      }

      // Refresh alert history tracking
      await fetchAlertsHistory();

      triggerToast(`Committed! Postponed "${applianceObj.name}". Credited -${kgSavedFormatted}kg CO2 & awarded +50 Green Points!`, "success");
    } catch (e) {
      triggerToast("Failed updating points. Cached locally inside browser.", "error");
    } finally {
      setIsSubmittingAdvisory(false);
    }
  };

  // Determine indicator colors
  const statusColor = activeZone.load_percentage >= 90
    ? "text-rose-500 bg-rose-50 border-rose-200"
    : activeZone.load_percentage >= 80
    ? "text-amber-500 bg-amber-50 border-amber-200"
    : "text-emerald-500 bg-emerald-50 border-emerald-200";

  const particleColor = activeZone.load_percentage >= 90
    ? "#f43f5e" // rose-500
    : activeZone.load_percentage >= 80
    ? "#f59e0b" // amber-500
    : "#10b981"; // emerald-500

  // Particle speed derived from grid load for direct visual impact
  const speedSec = activeZone.load_percentage >= 90 
    ? "0.8s" 
    : activeZone.load_percentage >= 80 
    ? "1.8s" 
    : "4s";

  return (
    <div className="relative space-y-6 max-w-4xl mx-auto font-sans text-slate-800">
      {/* Subtle animated SVG grid background using Framer Motion */}
      <GridBackgroundAnimation loadPercentage={sliderVal} />
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl -z-10" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Smart Power Grid Optimizer</span>
            </span>
            <span className="text-[10px] bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2 py-0.5 rounded font-mono uppercase">
              India RLDC Integrator
            </span>
          </div>
          
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">
            Hyper-Localized Indian Load Advisor
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl font-sans leading-relaxed">
            Real-time parsing of Indian regional Despatch Centres (WRLDC, SRLDC, NRLDC, ERLDC). Shifting appliance operations out of peak gas-coal burn events directly scales down grid emission intensity carbon traces.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-500 text-xs font-mono">Syncing real-time RLDC load registries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Screen Indicator (8 spans) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Real-time Metric Dials */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Live Grid Diagnostics</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Auto-sync: 15s</span>
                  <button 
                    onClick={() => fetchGridStatus()} 
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Manual refresh"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Region and Search Selector bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: "ALL", label: "All India" },
                    { code: "NRLDC", label: "North" },
                    { code: "WRLDC", label: "West" },
                    { code: "SRLDC", label: "South" },
                    { code: "ERLDC", label: "East" },
                    { code: "NERLDC", label: "Northeast" }
                  ].map((filterOpt) => (
                    <button
                      key={filterOpt.code}
                      type="button"
                      onClick={() => setRegionFilter(filterOpt.code)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        regionFilter === filterOpt.code
                          ? "bg-slate-900 border border-slate-900 text-white shadow-sm"
                          : "bg-white border border-slate-200/90 hover:border-slate-300 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {filterOpt.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search 30+ Indian states..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl outline-none text-slate-700 font-medium placeholder-slate-400 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-sans font-bold text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Zone Button Grid */}
              {(() => {
                const filteredZoneKeys = Object.keys(zones).filter((key) => {
                  const z = zones[key];
                  const matchesSearch = 
                    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    z.region_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    z.state_code.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  if (regionFilter === "ALL") return matchesSearch;
                  return matchesSearch && z.region_code === regionFilter;
                });

                if (filteredZoneKeys.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                      <p className="text-xs font-semibold">No Indian states match your search or regional filter.</p>
                      <button 
                        type="button"
                        onClick={() => { setSearchQuery(""); setRegionFilter("ALL"); }}
                        className="mt-2 text-[10px] text-emerald-600 hover:underline font-bold cursor-pointer"
                      >
                        Reset and View All States
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredZoneKeys.map((key) => {
                      const z = zones[key];
                      const isActive = selectedRegion === key;
                      const isHigh = z.load_percentage >= 80;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(key);
                            setSliderVal(z.load_percentage);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                            isActive 
                              ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 shadow-sm" 
                              : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black font-mono tracking-wider">{key}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? "bg-amber-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                          </div>
                          <span className="text-[10px] text-slate-500 block truncate font-sans font-semibold mt-0.5">{z.region_name}</span>
                          <div className="mt-1.5 flex items-baseline gap-1">
                            <span className="text-xs font-bold font-mono">{Math.round(z.load_percentage)}%</span>
                            <span className="text-[8px] text-slate-400 font-sans uppercase">Load</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Dynamic Information Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase font-mono">Current Load</span>
                  <span className="text-lg font-bold font-mono text-slate-800">{activeZone.current_load_mw.toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500 block font-mono">MW</span>
                </div>
                <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase font-mono">Grid Frequency</span>
                  <span className={`text-lg font-bold font-mono ${activeZone.grid_frequency_hz < 49.9 ? 'text-rose-500' : 'text-slate-800'}`}>
                    {activeZone.grid_frequency_hz}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-mono">Hz</span>
                </div>
                <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase font-mono">Thermal (Coal)</span>
                  <span className="text-lg font-bold font-mono text-slate-800">{activeZone.thermal_share_percent}%</span>
                  <span className="text-[9px] text-rose-500 block font-sans font-semibold">Peaking resource</span>
                </div>
                <div className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider block uppercase font-mono font-sans">Renewables</span>
                  <span className="text-lg font-bold font-mono text-emerald-600">{activeZone.renewable_share_percent}%</span>
                  <span className="text-[9px] text-emerald-600 block font-sans font-semibold">Solar & Wind</span>
                </div>
              </div>

              {/* Adaptive advisory diagnostics */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${statusColor} space-y-1`}>
                <div className="flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider text-[10px]">
                  <Compass className="w-4 h-4" />
                  <span>State: {activeZone.status} LOAD PERIOD</span>
                </div>
                <p className="font-medium text-slate-700 font-sans">
                  {activeZone.demand_driver}. Grid nodes require stabilization parameters. 
                  Reduce heavy home load cycles to avoid triggering high-carbon diesel-peaking backup generation units.
                </p>
              </div>
            </div>


            {/* Real-time D3.js 24-Hour Load Trend chart */}
            <GridTrendChart region={selectedRegion} currentValue={sliderVal} />

            {/* Magnificent SVG Interactive Grid Node Animation */}
            <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 relative shadow-2xl overflow-hidden min-h-[300px]">
              
              {/* Outer grid backdrop visualizers */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">
                  Live Electron Routing Topology
                </span>
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/30 flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active Flow Engine
                </span>
              </div>

              {/* Animated SVG Diagram representing the complete Power Grid flow path */}
              <svg className="w-full h-[220px]" viewBox="0 0 600 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                
                {/* SVG Definitions for filters, gradients and markers */}
                <defs>
                  <linearGradient id="gradient-thermal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  
                  <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  <linearGradient id="gradient-substation" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>

                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Connection / Electron lines */}
                {/* Line 1: Thermal Station to Substation */}
                <path d="M 100 60 Q 180 50 280 110" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" />
                <path d="M 100 60 Q 180 50 280 110" stroke={particleColor} strokeWidth="1.5" strokeDasharray="12,120" strokeLinecap="round" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="300;0" dur={speedSec} repeatCount="indefinite" />
                </path>

                {/* Line 2: Renewable Station to Substation */}
                <path d="M 100 160 Q 180 170 280 110" stroke="#334155" strokeWidth="2.5" strokeDasharray="6,4" />
                <path d="M 100 160 Q 180 170 280 110" stroke="#10b981" strokeWidth="1.5" strokeDasharray="12,120" strokeLinecap="round" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="300;0" dur="2s" repeatCount="indefinite" />
                </path>

                {/* Line 3: Substation to Consumers */}
                <path d="M 320 110 Q 400 110 480 110" stroke="#334155" strokeWidth="3" strokeDasharray="6,4" />
                <path d="M 320 110 Q 400 110 480 110" stroke={particleColor} strokeWidth="2" strokeDasharray="16,140" strokeLinecap="round" filter="url(#glow)">
                  <animate attributeName="stroke-dashoffset" values="400;0" dur={speedSec} repeatCount="indefinite" />
                </path>

                {/* Line 4-5: Substation branching to households */}
                <path d="M 480 110 Q 510 70 540 60" stroke="#334155" strokeWidth="2" />
                <path d="M 480 110 Q 510 150 540 160" stroke="#334155" strokeWidth="2" />

                {/* Electron flashes at branch */}
                <circle cx="540" cy="60" r="1.5" fill={particleColor} />
                <circle cx="540" cy="160" r="1.5" fill={particleColor} />

                {/* NODE 1: Thermal Coal Plant (Ahmedabad / Singrauli) */}
                <g transform="translate(100, 60)" cursor="help">
                  <title>Thermal Coal Plants ({activeZone.thermal_share_percent}% Share)</title>
                  <circle cx="0" cy="0" r="28" fill="url(#gradient-thermal)" opacity="0.15" className="animate-pulse" />
                  <circle cx="0" cy="0" r="20" fill="url(#gradient-thermal)" shadow-lg="true" />
                  <Server className="w-5 h-5 text-white" x="-10" y="-10" />
                  <text x="0" y="32" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Thermal MW</text>
                  <text x="0" y="-24" fill="#f87171" fontSize="9" fontWeight="black" textAnchor="middle" fontFamily="monospace">COAL / GAS</text>
                </g>

                {/* NODE 2: Renewable Hydro/Wind/Solar Farm (Gujarat Hybrid) */}
                <g transform="translate(100, 160)" cursor="help">
                  <title>Renewable Generation ({activeZone.renewable_share_percent}% Share)</title>
                  <circle cx="0" cy="0" r="28" fill="url(#gradient-green)" opacity="0.15" />
                  <circle cx="0" cy="0" r="20" fill="url(#gradient-green)" />
                  <Compass className="w-5 h-5 text-white animate-spin-slow" x="-10" y="-10" />
                  <text x="0" y="32" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">RENEWABLE</text>
                  <text x="0" y="-24" fill="#34d399" fontSize="9" fontWeight="black" textAnchor="middle" fontFamily="monospace">SOLAR & WIND</text>
                </g>

                {/* NODE 3: Regional Load Despatch Substation Hub */}
                <g transform="translate(300, 110)">
                  <circle cx="0" cy="0" r="28" fill="url(#gradient-substation)" opacity="0.15" />
                  <circle cx="0" cy="0" r="22" fill="url(#gradient-substation)" />
                  <Activity className="w-5 h-5 text-white" x="-10" y="-10" />
                  <text x="0" y="34" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">RLDC NODAL SUB</text>
                </g>

                {/* NODE 4: Household consumers (The grid load destination) */}
                <g transform="translate(500, 110)">
                  <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  <circle cx="0" cy="0" r="16" fill={activeZone.load_percentage >= 80 ? "#fea3a3" : "#ddffdd"} opacity="0.1" className="animate-ping" />
                  <circle cx="0" cy="0" r="14" fill="#1e293b" />
                  <text x="0" y="28" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CONSUMERS</text>
                  <text x="0" y="4" fill={particleColor} fontSize="11" fontWeight="extrabold" textAnchor="middle" fontFamily="monospace">{Math.round(activeZone.load_percentage)}%</text>
                </g>

              </svg>
              
              <div className="grid grid-cols-2 text-[10px] text-slate-500 font-mono mt-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
                <div>• Flow velocity represents real load amperage</div>
                <div className="text-right">• Green lines indicate stable zero-emissions payload</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Simulation Control panel & Appliance scheduler (4 spans) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Simulation Slider Control Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Simulator Sandbox</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulationMode(!simulationMode)}
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    simulationMode ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {simulationMode ? "Manual Override" : "Live Scraper"}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-slate-400 font-bold uppercase font-mono">Simulate Grid Strain</span>
                  <span className="text-sm font-extrabold font-mono text-slate-800">{Math.round(sliderVal)}%</span>
                </div>
                
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="1"
                  value={sliderVal}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Lite Load (40%)</span>
                  <span>Grid Peak (100%)</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-sans leading-relaxed flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Adjusting grid load directly calculates custom simulated subcritical heat margins. Set load &gt;80% to generate AI coaching alerts!</span>
              </div>
            </div>

            {/* Smart Appliance Advisor */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Appliance Postponer</h4>
              </div>

              {/* Appliance option circles */}
              <div className="grid grid-cols-2 gap-2">
                {APPLIANCE_PROFILES.map((app) => {
                  const isSelected = selectedApplianceId === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApplianceId(app.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#1a442e] text-white border-transparent shadow" 
                          : "bg-slate-50 border-slate-100 text-slate-700 hover:border-slate-200"
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{app.icon}</span>
                      <span className="text-[10px] font-bold block truncate">{app.name}</span>
                      <span className="text-[8px] opacity-80 block font-mono">{(app.power_w / 1000).toFixed(1)} kW</span>
                    </button>
                  );
                })}
              </div>

              {/* Advisory Card Area */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative overflow-hidden space-y-3 min-h-[140px] flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                    <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span>Gemini AI Grid Advisor</span>
                  </div>
                  
                  {advisoryLoading ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                      <span className="text-[10px] text-slate-400 font-mono">Running pipeline calculations...</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium italic">
                      "{customAdvisory || 'Select an appliance and region above to retrieve automated environmental advice.'}"
                    </p>
                  )}
                </div>

                {/* Potential instant savings calculation */}
                {!advisoryLoading && (
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">EMISSION IMPACT:</span>
                    <span className="font-bold text-emerald-600 uppercase">
                      -{Number((APPLIANCE_PROFILES.find(a => a.id === selectedApplianceId)?.base_saving_g || 150) / 1000 * (activeZone.load_percentage >= 80 ? 1.4 : 1.0)).toFixed(2)} kg CO₂ Saved
                    </span>
                  </div>
                )}
              </div>

              {/* Action COMMIT Button to safe-schedule and log carbon credit */}
              <button
                type="button"
                onClick={commitPostponement}
                disabled={isSubmittingAdvisory || advisoryLoading}
                className="w-full py-3 bg-[#1a442e] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-md hover:shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Commit to Delay Appliance</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-sans font-semibold">
                <Award className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Gain +50 Green Points & complete climate action log!</span>
              </div>
            </div>

          </div>

        </div>
      )}

            {/* Map representation selection bar */}
            <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm self-start items-center gap-1">
              <button
                type="button"
                onClick={() => setMapViewMode("geographic")}
                className={`flex-1 text-center py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapViewMode === "geographic"
                    ? "bg-slate-900 text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Geographic Hotspot Map
              </button>
              <button
                type="button"
                onClick={() => setMapViewMode("cartogram")}
                className={`flex-1 text-center py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapViewMode === "cartogram"
                    ? "bg-slate-900 text-white shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Choropleth Matrix
              </button>
            </div>

            {/* Interactive India Emission & Intensities Map */}
            {mapViewMode === "geographic" ? (
              <IndiaEmissionMap emissionData={emissionData} />
            ) : (
              <IndiaGridMap 
                zones={zones} 
                selectedRegion={selectedRegion} 
                onSelectRegion={setSelectedRegion}
                onSyncSlider={setSliderVal}
              />
            )}

      {/* Historical Sent/Committed Grid Alerts Log Board */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">Historical Grid Alerts & Actions Log</h3>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Persistent log of load mitigation actions synchronized with the cloud <span className="font-semibold font-mono text-emerald-600">grid_alerts_sent</span> table.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isDbSynced 
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDbSynced ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
              <span>{isDbSynced ? "Supabase Live Connection" : "Local Sandbox Sync"}</span>
            </span>
            
            <button
              type="button"
              onClick={fetchAlertsHistory}
              disabled={loadingAlerts}
              className="p-1.5 hover:bg-slate-100 border border-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-800"
              title="Reload ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAlerts ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {loadingAlerts ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Querying historical ledger...</span>
          </div>
        ) : alertsHistory.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-100 text-slate-400 space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold font-sans">No grid load reduction actions registered yet.</p>
            <p className="text-[10px] font-medium max-w-sm mx-auto text-slate-400 font-sans">
              Use the sandbox simulator to set load above 80%, retrieve custom AI advice, and commit appliance postponement to write persistent events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 font-sans">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Dispatch Node</th>
                  <th className="p-4">Appliance</th>
                  <th className="p-4 text-center">Load State</th>
                  <th className="p-4 text-right">Saving Intensity</th>
                  <th className="p-4">Advisory Insight Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-mono text-[11px]">
                {alertsHistory.map((alert, idx) => {
                  const dateStr = alert.timestamp ? new Date(alert.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  }) : "Pending";

                  const isHigh = alert.load_percentage >= 80;
                  const isCritical = alert.load_percentage >= 90;
                  const badgeColor = isCritical 
                    ? "bg-rose-50 text-rose-600 border border-rose-100" 
                    : isHigh 
                    ? "bg-amber-50 text-amber-600 border border-amber-100" 
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100";

                  return (
                    <motion.tr 
                      key={alert.id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-4 whitespace-nowrap text-slate-400 flex items-center gap-1.5 font-sans font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {dateStr}
                      </td>
                      <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{alert.region_code}</td>
                      <td className="p-4 whitespace-nowrap text-slate-700 font-sans font-medium">
                        <span className="inline-block mr-1">
                          {APPLIANCE_PROFILES.find(a => a.id === alert.appliance_id || a.name === alert.appliance_name)?.icon || "⚡"}
                        </span>
                        {alert.appliance_name || alert.appliance_id}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${badgeColor}`}>
                          {alert.load_percentage}% Block
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-600 whitespace-nowrap font-sans">
                        -{alert.savings_percentage}% Intensity
                      </td>
                      <td className="p-4 min-w-[280px] max-w-[400px] text-[10px] text-slate-500 font-sans italic relative pr-8 leading-relaxed">
                        <span>{alert.advisory_text}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(alert.advisory_text || "");
                            triggerToast("Advisory snippet copied to clipboard!", "success");
                          }}
                          className="absolute right-2 top-11/2 -translate-y-11/2 p-1 bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Copy Advisory Text"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
