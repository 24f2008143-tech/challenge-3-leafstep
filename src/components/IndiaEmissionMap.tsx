import React, { useState, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Leaf, Zap, Battery, Globe, Wind, Sun, Activity, Sparkles, Sliders, CheckCircle2, ShieldAlert } from "lucide-react";
import { STATE_DECARBONIZATION_GUIDE } from "../data/stateClimateAdvices";

interface MapRegionData {
  emission: number;
  load: number;
  status: string;
}

export interface IndiaEmissionMapProps {
  emissionData: Record<string, MapRegionData>;
}

const TOPO_URL = "https://cdn.jsdelivr.net/npm/datamaps@0.5.10/src/js/data/ind.topo.json";

const getStatusBadgeStyles = (status?: string) => {
  const s = status?.toUpperCase() || "NORMAL";
  if (s.includes("ELEVATED")) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  if (s.includes("HIGH")) return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  if (s.includes("CRITICAL")) return "text-rose-400 bg-rose-400/10 border-rose-400/20";
  return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
};

const renderActionableAlert = (status: string) => {
  const s = status.toUpperCase();
  if (s === "NORMAL") return null;
  
  return (
    <div className="bg-rose-950/20 border border-rose-900/50 p-3 rounded-2xl flex gap-3 text-[10px] text-rose-50 mb-4 animate-pulse">
       <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
       <div>
          <span className="font-extrabold uppercase">Urgent Alert ({s})</span>
          <p className="mt-1">
            {s.includes("CRITICAL") ? "Avoid all non-essential heavy appliance usage immediately. The grid is under extreme stress; minimize heavy loads to prevent further thermal generation ramp-up." : 
             s.includes("HIGH") ? "Heavy grid stress detected. Delay usage of high-power equipment like washers or AC to off-peak hours to lower emission intensity." :
             "Increased strain detected. Consider optimizing energy consumption now to prevent further peak load escalation."}
          </p>
       </div>
    </div>
  );
};

export default function IndiaEmissionMap({ emissionData }: IndiaEmissionMapProps) {
  const [topology, setTopology] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive selected or hovered state
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>("Maharashtra");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 450, height: 500 });

  // Handle Resize of the Map area exclusively
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let timeoutId: number;
    const observer = new ResizeObserver((entries) => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setDimensions({ width, height: Math.max(height, 500) }), 150);
      }
    });
    observer.observe(mapContainerRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(TOPO_URL);
      if (!res.ok) throw new Error("Failed to fetch topology data");
      const data = await res.json();
      setTopology(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const features = useMemo(() => {
    if (!topology || !topology.objects || !topology.objects.ind) return [];
    const geojson = topojson.feature(topology, topology.objects.ind);
    return (geojson as any).features;
  }, [topology]);

  const { pathGenerator } = useMemo(() => {
    const proj = d3.geoMercator();
    if (features.length > 0 && dimensions.width > 0 && dimensions.height > 0) {
      proj.fitSize([dimensions.width, dimensions.height - 40], { type: "FeatureCollection", features } as any);
    }
    return { pathGenerator: d3.geoPath().projection(proj) };
  }, [features, dimensions.width, dimensions.height]);

  const emissionValues = Object.values(emissionData).map(d => d.emission);
  const minVal = emissionValues.length > 0 ? Math.min(...emissionValues) : 0;
  const maxVal = emissionValues.length > 0 ? Math.max(...emissionValues) : 10000;

  const colorScale = useMemo(() => {
    return d3.scaleQuantize<string>()
      .domain([minVal, maxVal])
      .range([
        "#10b981", // Emerald Green (Low)
        "#84cc16", // Lime
        "#f59e0b", // Amber (Elevated)
        "#f97316", // Orange
        "#ef4444", // Red (High/Critical)
      ]);
  }, [minVal, maxVal]);

  // Determine active target state to display tips for (prioritize hovered, fallback to selected)
  const activeFocusState = hoveredState || selectedState || "Maharashtra";
  const activeFocusData = emissionData[activeFocusState];
  const activeRecommendation = STATE_DECARBONIZATION_GUIDE[activeFocusState] || {
    title: "Clean Grid Transition Pathways",
    potential: "Accelerate grid-solar or wind transitions",
    iconType: "leaf",
    strategies: [
      "Incentivize local prosumer rooftop solar panels with simple utility integration.",
      "Raise demand-response compliance parameters during evening load spikes.",
      "Replace sub-critical thermal turbine sets with grid-scale storage backups."
    ]
  };

  const getRecIcon = (type: string) => {
    switch (type) {
      case "sun":
        return <Sun className="w-5 h-5 text-amber-400" />;
      case "wind":
        return <Wind className="w-5 h-5 text-sky-400" />;
      case "battery":
        return <Battery className="w-5 h-5 text-teal-400" />;
      case "zap":
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case "activity":
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case "industrial":
        return <Sliders className="w-5 h-5 text-indigo-400" />;
      default:
        return <Leaf className="w-5 h-5 text-emerald-400" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[520px] flex items-center justify-center animate-pulse bg-slate-900/10 rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-slate-500 font-mono text-xs uppercase tracking-widest">Compiling Cartography</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[520px] flex items-center justify-center text-center bg-slate-900/10 rounded-3xl border border-slate-800">
        <div className="text-slate-400 space-y-4 p-6">
          <p className="font-mono text-sm text-rose-400">Failed to load topographic boundaries.</p>
          <button 
            onClick={fetchTopology}
            className="px-4 py-2 border border-slate-700 bg-slate-800 rounded-xl text-xs text-white hover:bg-slate-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      {/* Map Column (Occupies 2 Cols on large screens) */}
      <div 
        ref={mapContainerRef} 
        className="lg:col-span-2 relative bg-slate-950/60 rounded-3xl border border-slate-900 shadow-2xl p-4 flex flex-col justify-between overflow-hidden h-[540px]"
      >
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Geographic Emission Hotspots
          </h4>
          <p className="text-[10px] text-slate-500 italic">Click on any state to analyze customized CO₂ reduction programs</p>
        </div>

        {/* SVG Canvas - transparent background strictly required */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block bg-transparent cursor-pointer overflow-visible touch-none mt-6"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onMouseLeave={() => setHoveredState(null)}
        >
          <g>
            {features.map((feature: any, i: number) => {
               const stateName = feature.properties.name || "";
               const rawData = emissionData[stateName];
               const isHovered = hoveredState === stateName;
               const isSelected = selectedState === stateName;
               
               const fill = rawData ? colorScale(rawData.emission) : "#1e293b";
               const dStr = pathGenerator(feature as any) || "";
               
               if (!dStr) return null;

               return (
                 <path
                   key={`state-path-${i}`}
                   d={dStr}
                   fill={fill}
                   stroke={isSelected ? "#818cf8" : isHovered ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)"}
                   strokeWidth={isSelected ? 1.6 : isHovered ? 1.0 : 0.4}
                   className="transition-all duration-200 cursor-pointer"
                   style={{
                     filter: isSelected ? "brightness(1.15) drop-shadow(0px 3px 6px rgba(129, 140, 248, 0.25))" : isHovered ? "brightness(1.1) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" : "none"
                   }}
                   onMouseEnter={() => setHoveredState(stateName)}
                   onClick={() => setSelectedState(stateName)}
                 />
               );
            })}
          </g>
        </svg>

        {/* Tooltip Override */}
        {hoveredState && (
          <div 
            className="absolute z-50 bg-slate-950/95 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2 text-xs shadow-2xl pointer-events-none min-w-[220px] backdrop-blur-md"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15,
              transform: mousePos.x > dimensions.width - 240 ? "translateX(-110%)" : "none"
            }}
          >
            <div className="flex justify-between items-start border-b border-slate-900 pb-2">
              <span className="font-extrabold tracking-tight text-white">{hoveredState}</span>
              {emissionData[hoveredState] ? (
                <span className={`text-[8px] font-mono leading-none tracking-widest px-1.5 py-0.5 rounded border ${getStatusBadgeStyles(emissionData[hoveredState].status)}`}>
                  {emissionData[hoveredState].status || "NORMAL"}
                </span>
              ) : (
                <span className="text-[8px] font-mono leading-none border border-slate-700 bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  NO DATA
                </span>
              )}
            </div>
            
            {emissionData[hoveredState] ? (
              <div className="flex flex-col gap-1.5 font-mono text-[10px] pt-1">
                <div className="flex justify-between items-center bg-slate-920/40 p-1.5 rounded">
                  <span className="text-slate-500 font-bold uppercase tracking-wide">Emission</span>
                  <span className="text-emerald-400 font-black">{emissionData[hoveredState].emission.toLocaleString(undefined, {maximumFractionDigits: 1})} t CO₂/hr</span>
                </div>
                <div className="flex justify-between items-center bg-slate-920/40 p-1.5 rounded">
                  <span className="text-slate-500 font-bold uppercase tracking-wide">Grid Load</span>
                  <span className="text-indigo-300 font-black">{emissionData[hoveredState].load.toLocaleString()} MW</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 font-mono text-[9px] py-1 text-center italic">Awaiting telemetry synchronization</div>
            )}
          </div>
        )}

        {/* Embedded Color Legend Ramp */}
        <div className="absolute bottom-4 left-4 w-48 bg-slate-950/90 px-3 py-2.5 rounded-2xl border border-slate-900/60 backdrop-blur-md flex flex-col items-center">
          <div className="w-full flex justify-between text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-1.5">
            <span>{minVal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
            <span>CO₂ Output (t/hr)</span>
            <span>{maxVal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
          </div>
          <div className="w-full h-1.5 rounded overflow-hidden flex">
            {colorScale.range().map((c, i) => (
               <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Side panel (Occupies 1 Col) */}
      <div className="bg-slate-950/60 rounded-3xl border border-slate-900 shadow-2xl p-5 flex flex-col gap-4 backdrop-blur-md h-[540px] overflow-y-auto">
        <div className="border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-extrabold tracking-tight text-white text-sm">State Mitigation Guide</h3>
          </div>
          <p className="text-[10px] text-slate-400">Dynamic carbon abatement advice for active grids</p>
        </div>

        {/* State selector dropdown to change analysis focus */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider block">Select Target State</label>
          <select 
            value={selectedState || ""} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 py-1.5 px-3 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            {Object.keys(STATE_DECARBONIZATION_GUIDE)
              .filter(name => name !== "Orissa" && name !== "Jammu and Kashmir" && name !== "Uttaranchal") // filter duplicate mapped keys
              .sort()
              .map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))
            }
          </select>
        </div>

        {/* Active Analysis Core Details */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-black text-white">{activeFocusState}</h4>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{activeRecommendation.potential}</p>
            </div>
            
            {activeFocusData ? (
              <span className={`text-[8px] font-mono leading-none tracking-widest px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(activeFocusData.status)}`}>
                {activeFocusData.status}
              </span>
            ) : (
              <span className="text-[8px] font-mono leading-none border border-slate-800 bg-slate-900 text-slate-500 px-2 py-0.5 rounded-full">
                NO SECTOR TELEMETRY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-slate-400 pt-1 border-t border-slate-900/60">
            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900/40">
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Grid Load</span>
              <span className="text-indigo-400 font-black text-xs font-mono">
                {activeFocusData ? `${activeFocusData.load.toLocaleString()} MW` : "N/A"}
              </span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900/40">
              <span className="text-[8px] font-mono text-slate-500 uppercase block">Total Emission</span>
              <span className="text-emerald-400 font-black text-xs font-mono">
                {activeFocusData ? `${activeFocusData.emission.toLocaleString(undefined, {maximumFractionDigits: 0})} t/h` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Strategy Cards */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {activeFocusData && renderActionableAlert(activeFocusData.status)}

          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
            {getRecIcon(activeRecommendation.iconType)}
            <span>CO₂ Abatement Blueprints</span>
          </div>
          
          <div className="space-y-4">
            {activeRecommendation.strategies.map((strategy, index) => (
              <div 
                key={index} 
                className="flex gap-2.5 p-3 rounded-2xl bg-gradient-to-br from-slate-950/70 to-slate-900/40 border border-slate-900 hover:border-slate-800 transition duration-200"
              >
                <div className="flex-shrink-0 mt-0.5 text-indigo-400/80">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-[10px] leading-relaxed text-slate-300 font-sans">
                  {strategy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 pt-6 border-t border-slate-900">
            <h4 className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-wider">Individual Actionable Steps</h4>
            {activeRecommendation.individualActions?.map((action, index) => (
               <div key={index} className="flex gap-2 text-[10px] text-slate-300">
                 <span className="text-emerald-500">•</span>
                 <span>{action}</span>
               </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 pt-4 border-t border-slate-900/40">
            <h4 className="text-[9px] font-bold text-rose-500/70 font-mono uppercase tracking-wider">Important Warnings</h4>
            {activeRecommendation.warnings?.map((warning, index) => (
               <div key={index} className="flex gap-2 text-[10px] text-rose-300/80">
                 <span className="text-rose-500/50">!</span>
                 <span>{warning}</span>
               </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
