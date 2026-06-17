import React, { useState, useMemo } from "react";
import { 
  Flame, 
  Leaf, 
  Zap, 
  TrendingUp, 
  Gauge, 
  Info, 
  Compass,
  Sparkles,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GridZoneData } from "../utils/GridScraperOrchestrator";

interface IndiaGridMapProps {
  zones: Record<string, GridZoneData>;
  selectedRegion: string;
  onSelectRegion: (regionCode: string) => void;
  onSyncSlider: (percentage: number) => void;
}

interface GridStateInfo {
  code: string;
  name: string;
  col: number; // 1-indexed column position on our map grid (1-10)
  row: number; // 1-indexed row position on our map grid (1-9)
}

// Custom grid coordinates reflecting the true geometric silhouette of India
const STATE_COORDINATES: GridStateInfo[] = [
  // ROW 1: Far North
  { code: "JK", name: "Jammu & Kashmir", col: 4, row: 1 },
  
  // ROW 2: North
  { code: "HP", name: "Himachal Pradesh", col: 4, row: 2 },
  { code: "PB", name: "Punjab", col: 3, row: 2 },
  { code: "UK", name: "Uttarakhand", col: 5, row: 2 },
  
  // ROW 3: North Central
  { code: "HR", name: "Haryana", col: 3, row: 3 },
  { code: "DL", name: "Delhi", col: 4, row: 3 },
  { code: "UP", name: "Uttar Pradesh", col: 5, row: 3 },
  
  // ROW 4: West / Central / East
  { code: "RJ", name: "Rajasthan", col: 2, row: 4 },
  { code: "MP", name: "Madhya Pradesh", col: 3, row: 4 },
  { code: "BR", name: "Bihar", col: 5, row: 4 },
  { code: "SK", name: "Sikkim", col: 6, row: 4 },
  { code: "AR", name: "Arunachal Pradesh", col: 9, row: 4 },
  { code: "AS", name: "Assam", col: 8, row: 4 },
  
  // ROW 5: West / central-east / Northeast
  { code: "GJ", name: "Gujarat", col: 1, row: 5 },
  { code: "CG", name: "Chhattisgarh", col: 3, row: 5 },
  { code: "JH", name: "Jharkhand", col: 4, row: 5 },
  { code: "WB", name: "West Bengal", col: 5, row: 5 },
  { code: "ML", name: "Meghalaya", col: 8, row: 5 },
  { code: "NL", name: "Nagaland", col: 10, row: 5 },
  { code: "MN", name: "Manipur", col: 10, row: 6 }, // slightly offset
  
  // ROW 6: Mid-South / Bay of Bengal side
  { code: "MH", name: "Maharashtra", col: 2, row: 6 },
  { code: "OD", name: "Odisha", col: 4, row: 6 },
  { code: "TR", name: "Tripura", col: 7, row: 6 },
  { code: "MZ", name: "Mizoram", col: 9, row: 6 },

  // ROW 7: Peninsula Upper
  { code: "GA", name: "Goa", col: 1, row: 7 },
  { code: "TS", name: "Telangana", col: 3, row: 7 },
  
  // ROW 8: Peninsula Mid
  { code: "KA", name: "Karnataka", col: 2, row: 8 },
  { code: "AP", name: "Andhra Pradesh", col: 3, row: 8 },
  
  // ROW 9: Deep South
  { code: "KL", name: "Kerala", col: 2, row: 9 },
  { code: "TN", name: "Tamil Nadu", col: 3, row: 9 }
];

export default function IndiaGridMap({ 
  zones, 
  selectedRegion, 
  onSelectRegion,
  onSyncSlider
}: IndiaGridMapProps) {
  // Map visualization metric toggles
  const [metricMode, setMetricMode] = useState<"intensity" | "emissions">("emissions");
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Helper to compute emission metrics
  const stateEmissions = useMemo(() => {
    const results: Record<string, {
      intensity: number; // thermal_share_percent
      grossHourlyEmissions: number; // metric tons of CO2/hour
      renewableShare: number;
      actualLoadMw: number;
    }> = {};

    Object.keys(zones).forEach((code) => {
      const z = zones[code];
      const thermalFraction = z.thermal_share_percent / 100;
      // 0.95 kg CO2 per kWh of coal energy is equivalent to 0.95 metric tons of CO2 per MWh
      const grossHourlyEmissions = (z.current_load_mw * thermalFraction) * 0.95;

      results[code] = {
        intensity: z.thermal_share_percent,
        grossHourlyEmissions: Number(grossHourlyEmissions.toFixed(1)),
        renewableShare: z.renewable_share_percent,
        actualLoadMw: z.current_load_mw
      };
    });

    return results;
  }, [zones]);

  // Global aggregate statistics
  const aggregator = useMemo(() => {
    let totalEmissions = 0;
    let maxEmCO2State = { code: "", val: 0 };
    let cleanestState = { code: "", val: 0 }; // highest renewable share

    Object.keys(stateEmissions).forEach((code) => {
      const metrics = stateEmissions[code];
      totalEmissions += metrics.grossHourlyEmissions;

      if (metrics.grossHourlyEmissions > maxEmCO2State.val) {
        maxEmCO2State = { code, val: metrics.grossHourlyEmissions };
      }

      if (metrics.renewableShare > cleanestState.val) {
        cleanestState = { code, val: metrics.renewableShare };
      }
    });

    return {
      totalNationalEmissionsHourly: Number(totalEmissions.toFixed(1)),
      maxEmittingState: maxEmCO2State,
      cleanestState: cleanestState
    };
  }, [stateEmissions]);

  // Color mapper based on carbon metrics
  const getColorStyle = (code: string, isActive: boolean) => {
    const data = stateEmissions[code];
    if (!data) return "bg-slate-100 hover:bg-slate-200 text-slate-400 border-slate-200";

    const value = metricMode === "intensity" ? data.intensity : data.grossHourlyEmissions;

    if (metricMode === "intensity") {
      // Intensity 0 - 100 (Thermal Share %)
      if (value < 40) return isActive 
        ? "bg-emerald-500 border-emerald-600 text-white shadow-md ring-2 ring-emerald-400" 
        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800";
      if (value < 65) return isActive 
        ? "bg-amber-500 border-amber-600 text-white shadow-md ring-2 ring-amber-400" 
        : "bg-amber-50/70 hover:bg-amber-100/80 border-amber-200 text-amber-800";
      if (value < 80) return isActive 
        ? "bg-orange-500 border-orange-600 text-white shadow-md ring-2 ring-orange-400" 
        : "bg-orange-50/70 hover:bg-orange-100/80 border-orange-200 text-orange-800";
      return isActive 
        ? "bg-rose-600 border-rose-700 text-white shadow-md ring-2 ring-rose-500" 
        : "bg-rose-50/80 hover:bg-rose-100/90 border-rose-200 text-rose-800";
    } else {
      // Gross Hourly Emissions (Metric tons of CO2/hr)
      if (value < 100) return isActive 
        ? "bg-emerald-600 border-emerald-700 text-white shadow-md ring-2 ring-emerald-400" 
        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800";
      if (value < 1000) return isActive 
        ? "bg-teal-600 border-teal-700 text-white shadow-md ring-2 ring-teal-400" 
        : "bg-teal-50/80 hover:bg-teal-100 border-teal-200 text-teal-850";
      if (value < 5000) return isActive 
        ? "bg-amber-500 border-amber-600 text-white shadow-md ring-2 ring-amber-400" 
        : "bg-amber-50/70 hover:bg-amber-100 border-amber-200 text-amber-800";
      if (value < 12000) return isActive 
        ? "bg-orange-500 border-orange-600 text-white shadow-md ring-2 ring-orange-400" 
        : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800";
      return isActive 
        ? "bg-rose-600 border-rose-700 text-white shadow-md ring-2 ring-rose-500" 
        : "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800";
    }
  };

  const selectedStateData = zones[selectedRegion];
  const selectedStateEmissions = stateEmissions[selectedRegion];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase font-mono">
              Live Geographic Grid Telemetry
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500" />
            Indian State-Level Carbon Emissions Map
          </h3>
          <p className="text-xs text-slate-500 font-sans max-w-xl">
            Click on any geographic cell to switch the main dashboard control focus instantly. Real-time updates reflect local generation matrices.
          </p>
        </div>

        {/* METRIC MODE TOGGLES */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setMetricMode("emissions")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              metricMode === "emissions"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/30 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Gross Emissions
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("intensity")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              metricMode === "intensity"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/30 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Carbon Intensity
          </button>
        </div>
      </div>

      {/* DETAILED STATISTICAL SIDEBAR + MAP SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COMPACT LEDGER SIDEBAR: 4 cols */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Real-time Dashboard Summary Cards */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block font-mono">
                  National Hourly Rate
                </span>
                <span className="text-lg font-black font-mono text-slate-800">
                  {aggregator.totalNationalEmissionsHourly.toLocaleString()} t
                </span>
              </div>
              <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-105">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>

            <div className="p-3 bg-red-50/40 border border-red-100/50 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] text-red-500 uppercase font-black tracking-wider block font-mono">
                  Highest Carbon Load
                </span>
                <span className="text-sm font-black text-slate-800 font-sans block truncate">
                  {aggregator.maxEmittingState.code === "MH" ? "Maharashtra" : zones[aggregator.maxEmittingState.code]?.region_name || aggregator.maxEmittingState.code}
                </span>
                <span className="text-xs font-bold font-mono text-slate-500">
                  {aggregator.maxEmittingState.val.toLocaleString()} t CO₂/hr
                </span>
              </div>
              <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                <Flame className="w-4 h-4 text-red-500" />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] text-emerald-600 uppercase font-black tracking-wider block font-mono">
                  Cleanest Energy Share
                </span>
                <span className="text-sm font-black text-slate-800 font-sans block truncate">
                  {zones[aggregator.cleanestState.code]?.region_name || aggregator.cleanestState.code}
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600">
                  {aggregator.cleanestState.val}% Clean Source
                </span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* ACTIVE STATE OVERVIEW BLOCK */}
          <div className="p-4 bg-indigo-950 text-white rounded-2xl space-y-3 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[160px] shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
            
            <div className="relative z-10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-black text-indigo-300 uppercase tracking-widest bg-indigo-900/40 border border-indigo-800/30 px-2 py-0.5 rounded">
                  FOCUSED NODE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <h4 className="text-lg font-black tracking-tight font-sans">
                {selectedStateData?.region_name || selectedRegion} ({selectedRegion})
              </h4>
              <p className="text-[10px] text-indigo-200/90 leading-relaxed font-sans font-medium line-clamp-2">
                {selectedStateData?.demand_driver}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-indigo-900/60 relative z-10">
              <div>
                <span className="text-[8px] text-indigo-300 block uppercase font-mono font-bold">Hourly Footprint</span>
                <span className="text-sm font-black font-mono">
                  {selectedStateEmissions?.grossHourlyEmissions.toLocaleString() || "..."} tCO₂
                </span>
              </div>
              <div>
                <span className="text-[8px] text-indigo-300 block uppercase font-mono font-bold">Coal/Gas Share</span>
                <span className="text-sm font-black font-mono text-rose-300">
                  {selectedStateEmissions?.intensity || 0}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT INTERACTIVE GEOGRAPHIC CARTOGRAM MATRIX: 8 cols */}
        <div className="lg:col-span-8 flex flex-col justify-center bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden">
          
          {/* Map Grid Container with responsive scaling */}
          <div className="grid grid-cols-10 gap-1.5 max-w-lg mx-auto w-full aspect-[4/3] relative min-h-[340px]">
            {STATE_COORDINATES.map((st) => {
              const zoneData = zones[st.code];
              const emissionRates = stateEmissions[st.code];
              const isActive = selectedRegion === st.code;
              const isHovered = hoveredState === st.code;
              
              // Place according to X and Y values
              const style = {
                gridColumnStart: st.col,
                gridRowStart: st.row,
              };

              // Label content depending on filter
              const detailLabel = useMemo(() => {
                if (!emissionRates) return "—";
                return metricMode === "intensity" 
                  ? `${emissionRates.intensity}%` 
                  : `${emissionRates.grossHourlyEmissions >= 1000 ? (emissionRates.grossHourlyEmissions / 1000).toFixed(1) + 'kt' : Math.round(emissionRates.grossHourlyEmissions) + 't'}`;
              }, [emissionRates, metricMode]);

              return (
                <button
                  key={st.code}
                  type="button"
                  style={style}
                  onClick={() => {
                    onSelectRegion(st.code);
                    if (zoneData) {
                      onSyncSlider(zoneData.load_percentage);
                    }
                  }}
                  onMouseEnter={() => setHoveredState(st.code)}
                  onMouseLeave={() => setHoveredState(null)}
                  className={`relative flex flex-col justify-between p-1 rounded-lg border text-left cursor-pointer transition-all duration-200 select-none ${getColorStyle(st.code, isActive)} h-full w-full shadow-xs`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black tracking-wider leading-none font-mono">
                      {st.code}
                    </span>
                    {zoneData && zoneData.load_percentage >= 85 && (
                      <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping shrink-0" />
                    )}
                  </div>
                  
                  <span className="text-[7px] block font-black leading-none opacity-85 font-mono truncate text-right mt-1">
                    {detailLabel}
                  </span>

                  {/* MINI TOOLTIP POPUP */}
                  {isHovered && zoneData && emissionRates && (
                    <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-[110%] w-48 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-[10px] space-y-2 pointer-events-none">
                      <div className="font-extrabold border-b border-slate-800 pb-1 flex items-center justify-between">
                        <span className="text-xs text-white leading-tight font-sans block truncate max-w-[110px]">{st.name}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono text-[8px] tracking-wide">{st.code}</span>
                      </div>
                      
                      <div className="space-y-1 font-mono text-slate-300">
                        <div className="flex justify-between items-center">
                          <span>Hourly Emissions:</span>
                          <span className="font-bold text-white">{emissionRates.grossHourlyEmissions.toLocaleString()} tCO₂/hr</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Resource Load:</span>
                          <span className="font-bold text-white">{zoneData.current_load_mw.toLocaleString()} MW</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Thermal Share:</span>
                          <span className="font-bold text-rose-400">{zoneData.thermal_share_percent}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Renewable Share:</span>
                          <span className="font-bold text-emerald-400">{zoneData.renewable_share_percent}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* MAP LEGEND / KEY */}
          <div className="mt-4 pt-3 border-t border-slate-150 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] text-slate-500 font-mono">
            <span className="font-bold">Legend:</span>
            {metricMode === "intensity" ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200" />
                  &lt;40% (Clean Eco Grid)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" />
                  40%-65% (Heavy Mix)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-orange-50 border border-orange-200" />
                  65%-80% (High Carbon)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-50 border border-rose-200" />
                  &gt;80% (Critical Burn)
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-200" />
                  &lt;100 t (Minimal Load)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-200" />
                  100-1k t
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200" />
                  1k-5k t
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-orange-50 border border-orange-200" />
                  5k-12k t
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-50 border border-rose-200" />
                  &gt;12k t (Supreme Burn)
                </span>
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
