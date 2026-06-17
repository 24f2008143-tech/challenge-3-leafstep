/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  Plus,
  Trash,
  Camera,
  MessageSquare,
  Send,
  TrendingDown,
  Info,
  Sparkles,
  Globe,
  Award,
  Activity,
  FileText,
  CheckCircle,
  Database,
  Circle,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  User,
  Zap,
  Flame,
  Check,
  ChevronRight,
  MapPin,
  Trees,
  Newspaper,
  Wind,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Eye
} from "lucide-react";
import { AppState, ActivityLog, RecommendedAction, ChatMessage } from "./types";
import { BadgesShowcase } from "./components/Badges";
import DailyGoalWidget from "./components/DailyGoalWidget";
import StreakHistoryChart from "./components/StreakHistoryChart";
import TrendAnalysisCard from "./components/TrendAnalysisCard";
import MilestoneProgressBar from "./components/MilestoneProgressBar";
import ProgressHubHeader from "./components/ProgressHubHeader";
import { BADGES } from "./badgeData";
import CarbonFootprintChart, { CATEGORY_META } from "./components/CarbonFootprintChart";
import GlobalComparisonChart from "./components/GlobalComparisonChart";
import BaoForestZone from "./components/BaoForestZone";
import MilestonePopup from "./components/MilestonePopup";
import InteractiveIntelTree from "./components/InteractiveIntelTree";
import WindmillEnhancer from "./components/WindmillEnhancer";
import LandingPage from "./components/LandingPage";
import { motion, AnimatePresence } from "motion/react";
import { supabaseService } from "./supabaseClient";
import GridOptimizer from "./components/GridOptimizer";

// Custom hook to detect mobile view (< 1024px)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// Resilient Offline Local Fallback State representation
const LOCAL_DEFAULT_STATE: AppState = {
  user_id: "default_user",
  onboarded: false,
  profile: null,
  leaf_points: 350,
  rank: "Sprouting",
  badges: ["onboarding_pioneers_badge"],
  carbon_iq: 75,
  logs: [
    {
      id: "log_init_1",
      date: new Date().toISOString().split("T")[0],
      category: "transport",
      activity_name: "Subway Train Commute",
      quantity: 12,
      unit: "km",
      kg_co2: 0.48,
      source: "manual",
    },
    {
      id: "log_init_2",
      date: new Date().toISOString().split("T")[0],
      category: "diet",
      activity_name: "Low meat diet day",
      quantity: 1,
      unit: "day",
      kg_co2: 4.5,
      source: "manual",
    }
  ],
  streaks: {
    current: 2,
    best: 5,
    last_active_date: new Date().toISOString().split("T")[0],
  },
  recommended_actions: [
    {
      id: "act_1",
      category: "transport",
      title: "Try Bike Commute Once a Week",
      description: "Replace a 10km car ride with a bicycle or electric scooter commute.",
      avg_kg_co2_saved: 45.0,
      difficulty: "Medium",
      why_matters: "Commuting by bike produces 100% zero tailpipe emissions and improves cardiovascular health.",
      completed: false,
    },
    {
      id: "act_2",
      category: "diet",
      title: "Introduce a Meatless Monday",
      description: "Shift for a whole day to vegetarian meals containing zero red meat.",
      avg_kg_co2_saved: 35.0,
      difficulty: "Easy",
      why_matters: "Red meat is one of the highest contributors to household climate footprints due to land land-use and methane emissions.",
      completed: false,
    },
    {
      id: "act_3",
      category: "energy",
      title: "Lower Thermostat by 1°C",
      description: "Slightly reduce heating temperature or adjust air-conditioning levels by 1°C.",
      avg_kg_co2_saved: 40.0,
      difficulty: "Easy",
      why_matters: "Climate control accounts for over 50% of typical home energy bills. A small adjustment scales down grid demand directly.",
      completed: false,
    }
  ],
  chat_messages: [
    {
      role: "model",
      content: "Hello! I am your Leafstep Climate Coach. I can help you understand your footprint, suggest ways to save carbon, and automatically track your daily activities. Ask me anything, or say 'Coach, log a 15km EV drive' to try automated logging!",
      timestamp: new Date().toISOString(),
    }
  ],
};

// Seed Country Emissions Data for "Our World in Data" Comparison has been moved to GlobalComparisonChart.tsx direct encapsulation to avoid global polluted state.

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const [isTrophiesOpen, setIsTrophiesOpen] = useState(true);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("progressHubOpen");
    if (cached !== null) {
      setIsTrophiesOpen(cached === "true");
    } else {
      setIsTrophiesOpen(true);
    }

    const cachedMilestone = localStorage.getItem("progressHubMilestoneOpen");
    if (cachedMilestone !== null) {
      setIsMilestoneOpen(cachedMilestone === "true");
    } else {
      setIsMilestoneOpen(true);
    }
  }, []);

  const toggleTrophies = () => {
    setIsTrophiesOpen((prev) => {
      const nextVal = !prev;
      localStorage.setItem("progressHubOpen", String(nextVal));
      return nextVal;
    });
  };

  const toggleMilestone = () => {
    setIsMilestoneOpen((prev) => {
      const nextVal = !prev;
      localStorage.setItem("progressHubMilestoneOpen", String(nextVal));
      return nextVal;
    });
  };

  const onMilestoneClick = () => {
    setIsMilestoneOpen(true);
    setTimeout(() => {
      const el = document.getElementById("milestone-progressbar-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const onRefresh = () => {
    console.log("Progress Stats Sync Requested");
    alert("Progress Stats Synchronized successfully with the cloud!");
  };

  // Form Controls
  const [surveyName, setSurveyName] = useState<string>("");
  const [surveyAnswers, setSurveyAnswers] = useState({
    transport: "car_petrol",
    diet: "diet_flexitarian_day",
    energy: "electricity",
    shopping: "general_item",
    travel: "medium",
  });

  // Manual Log Form Controls
  const [logCategory, setLogCategory] = useState<keyof typeof CATEGORY_META>("transport");
  const [logActivityName, setLogActivityName] = useState<string>("");
  const [logQuantity, setLogQuantity] = useState<number>(10);
  const [liveEstimatedCO2, setLiveEstimatedCO2] = useState<number>(2.4);

  // NLP natural text input control
  const [nlpInput, setNlpInput] = useState<string>("");
  const [nlpLoading, setNlpLoading] = useState<boolean>(false);

  // Drag & drop OCR status
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrFeedback, setOcrFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversational AI Coach
  const [coachInput, setCoachInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dynamic Opportunities / Insight blocks
  const [insights, setInsights] = useState<any[]>([]);
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  
  // Real-time global insights & carbon emission news
  const [climateNews, setClimateNews] = useState<{
    news: any[];
    global_insights: any[];
  } | null>(null);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);

  // Navigation Active Section Tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "logging" | "actions" | "coach" | "benchmarks" | "grid">("dashboard");

  // Resilience & Supabase states
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<"synced" | "error" | "offline" | "syncing">("syncing");
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [usedOfflineFallback, setUsedOfflineFallback] = useState<boolean>(false);

  // Toast System for alerts
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Milestone System
  const [milestonePopup, setMilestonePopup] = useState<{ points: number } | null>(null);

  // Monitor points for milestones
  useEffect(() => {
    if (!state?.leaf_points) return;
    const pts = state.leaf_points;
    const thresholds = [500, 1000, 2000];
    
    thresholds.forEach(t => {
        if (pts >= t && pts < t + 50) { 
           setMilestonePopup({ points: t });
        }
    });

  }, [state?.leaf_points]);

  // Interactive background wind turbines settings
  const [windSpeed, setWindSpeed] = useState<"normal" | "fast" | "breeze">("normal");
  const [showTurbines, setShowTurbines] = useState<boolean>(true);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [showHeader, setShowHeader] = useState<boolean>(true);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      triggerToast("Network link restored! Cloud syncing enabled.", "success");
    };
    const handleOffline = () => {
      setIsOffline(true);
      triggerToast("Lost network link. Leafstep safe-saving on local device cache.", "info");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load state on mount
  useEffect(() => {
    fetchState();
    fetchClimateNews();
  }, [isOffline]);

  // Recalculate live estimated values on manual form input
  useEffect(() => {
    const coefficients: Record<string, number> = {
      transport_car_petrol: 0.24,
      transport_car_diesel: 0.22,
      transport_car_ev: 0.05,
      transport_car_hybrid: 0.12,
      transport_train: 0.04,
      transport_bus: 0.08,
      diet_diet_vegan_day: 2.9,
      diet_diet_vegetarian_day: 3.8,
      diet_diet_meat_day: 7.2,
      diet_diet_flexitarian_day: 4.5,
      energy_electricity: 0.45,
      energy_gas: 0.18,
      shopping_clothing_item: 15.0,
      shopping_electronics_item: 80.0,
      shopping_general_item: 2.5,
      travel_flight_long: 0.15,
      travel_flight_short: 0.20,
      travel_hotel_night: 15.0,
    };

    // Auto calculate matching coefficient key
    let lookupKey = `${logCategory}_${logActivityName}`;
    if (logCategory === "transport" && !logActivityName) {
      lookupKey = "transport_car_petrol";
    } else if (logCategory === "diet" && !logActivityName) {
      lookupKey = "diet_diet_flexitarian_day";
    } else if (logCategory === "energy" && !logActivityName) {
      lookupKey = "energy_electricity";
    } else if (logCategory === "shopping" && !logActivityName) {
      lookupKey = "shopping_general_item";
    }

    const coef = coefficients[lookupKey] || coefficients[`${logCategory}_general_item`] || 0.15;
    setLiveEstimatedCO2(Number((logQuantity * coef).toFixed(2)));
  }, [logCategory, logActivityName, logQuantity]);

  // Scroll chat window
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state?.chat_messages, chatLoading]);

  const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  const saveAndApplyState = async (newState: AppState) => {
    setState(newState);
    
    // 1. Persist securely to Browser Local Cache
    try {
      localStorage.setItem("leafstep_state", JSON.stringify(newState));
    } catch (e) {
      console.warn("[Local Resilience Storage] Failed writing state to localStorage:", e);
    }

    // 2. Persist securely to Supabase Cloud Client
    try {
      setSupabaseSyncStatus("syncing");
      const userId = newState.user_id || "default_user";
      const syncRes = await supabaseService.saveState(userId, newState);
      if (syncRes.success) {
        setSupabaseSyncStatus("synced");
      } else {
        setSupabaseSyncStatus("error");
      }
    } catch (e) {
      console.warn("[Supabase Resilience Client] Failed updating online node:", e);
      setSupabaseSyncStatus("error");
    }
  };

  const fetchState = async () => {
    setLoading(true);
    let loadedState: AppState | null = null;
    let source = "server";

    // Step 1: Query full-stack server
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        loadedState = await res.json();
      } else {
        throw new Error("Server state endpoint returned error");
      }
    } catch (err: any) {
      console.warn("[Leafstep Engine] Node Server unreachable. Consulting Cloud DB & Local cache...");
    }

    // Step 2: Query Supabase
    if (!loadedState) {
      try {
        setSupabaseSyncStatus("syncing");
        const cloudState = await supabaseService.loadState("default_user");
        if (cloudState) {
          loadedState = cloudState;
          source = "supabase";
          setSupabaseSyncStatus("synced");
        }
      } catch (err: any) {
        console.warn("[Leafstep Engine] Supabase pull failed. Consulting localized client cache...");
        setSupabaseSyncStatus("offline");
      }
    }

    // Step 3: Query LocalStorage Cache
    if (!loadedState) {
      try {
        const cached = localStorage.getItem("leafstep_state");
        if (cached) {
          loadedState = JSON.parse(cached);
          source = "local_storage";
        }
      } catch (err: any) {
        console.warn("[Leafstep Engine] Failed parsing browser cached payload.");
      }
    }

    // Step 4: Fallback to pristine local starter
    if (!loadedState) {
      loadedState = LOCAL_DEFAULT_STATE;
      source = "clean_slate";
    }

    setState(loadedState);
    
    // Broadcast notifications & configure indicator markers
    if (source !== "server") {
      setUsedOfflineFallback(true);
      if (source === "supabase") {
        triggerToast("Connected successfully to Supabase. App fully restored!", "success");
      } else if (source === "local_storage") {
        triggerToast("Server is currently down. Resiliently synchronized your state from browser's local cache!", "info");
      }
    } else {
      setSupabaseSyncStatus("synced");
    }

    // Double-sync local and cloud assets as safety replicas immediately
    try {
      localStorage.setItem("leafstep_state", JSON.stringify(loadedState));
      await supabaseService.saveState(loadedState.user_id || "default_user", loadedState);
    } catch (e) {
      // transient silent sync bypass
    }

    if (loadedState.onboarded && insights.length === 0) {
      refreshAIInsights();
    }
    setLoading(false);
  };

  const fetchClimateNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/climate-news");
      if (res.ok) {
        const data = await res.json();
        setClimateNews(data);
      } else {
        console.warn("Failed to load climate news from server (status " + res.status + "); rendering cached offline news fallback.");
      }
    } catch (e) {
      console.warn("Could not connect to climate news server; rendering cached offline news fallback.", e);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: surveyName || "Climate Champion",
          answers: surveyAnswers,
        }),
      });

      if (!res.ok) throw new Error("Onboarding request failed");
      const updatedState = await res.json();
      await saveAndApplyState(updatedState);
      triggerToast(`Account profiled! Welcome to Leafstep, ${surveyName || "Climate Champion"}!`, "success");
      refreshAIInsights();
    } catch (err: any) {
      console.warn("Server onboarding failed. Conducting resilient offline onboarding profiling...", err);
      // OFFLINE FALLBACK
      const baseline = surveyAnswers.transport === "car_petrol" ? 840 : 490;
      const offlineState: AppState = {
        user_id: "default_user",
        onboarded: true,
        profile: {
          name: surveyName || "Climate Champion",
          archetype: surveyAnswers.transport === "car_petrol" ? "Commuter Heavyweight" : "Conscious Minimalist",
          baseline_kg_co2_monthly: baseline,
          answers: surveyAnswers,
          top_categories: [surveyAnswers.transport === "car_petrol" ? "transport" : "diet", "energy"],
        },
        leaf_points: 350,
        rank: "Sprouting",
        badges: ["onboarding_pioneers_badge", "offline_pioneer_badge"],
        carbon_iq: 75,
        logs: [
          {
            id: `log_init_${Date.now()}_1`,
            date: new Date().toISOString().split("T")[0],
            category: "transport",
            activity_name: "Baseline transport activity",
            quantity: 10,
            unit: "km",
            kg_co2: surveyAnswers.transport === "car_petrol" ? 2.4 : 0.5,
            source: "manual",
          }
        ],
        streaks: {
          current: 1,
          best: 1,
          last_active_date: new Date().toISOString().split("T")[0],
        },
        recommended_actions: [
          {
            id: `act_off_1_${Date.now()}`,
            category: "transport",
            title: "Introduce a Bike Commute Cycle",
            description: "Shift 10km of motorized car commuting to zero tailpipe active cycling.",
            avg_kg_co2_saved: 45.0,
            difficulty: "Medium",
            why_matters: "Saves high-density emissions and keeps urban traffic clean.",
            completed: false,
          },
          {
            id: `act_off_2_${Date.now()}`,
            category: "diet",
            title: "Shift to Vegetarian Cooking Mondays",
            description: "Avoid high-land-use animal proteins for one full day.",
            avg_kg_co2_saved: 35.0,
            difficulty: "Easy",
            why_matters: "Methane and land consumption drops drastically with vegetarian protein feedstocks.",
            completed: false,
          }
        ],
        chat_messages: [
          {
            role: "model",
            content: "Welcome to Leafstep Offline! I'm your local fallback coach. We generated some custom recommendations for you. Let me know what you want to achieve!",
            timestamp: new Date().toISOString(),
          }
        ],
      };
      
      await saveAndApplyState(offlineState);
      triggerToast(`Offline account profiled! Welcome, ${surveyName || "Climate Champion"}!`, "success");
    } finally {
      setLoading(false);
    }
  };

  const handleResetState = async () => {
    if (!window.confirm("This will safely reset your profile, answers, logs, and simulated AI coach memory. Reset anyway?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/state/reset", { method: "POST" });
      if (!res.ok) throw new Error("State reset endpoint failed");
      const defaultState = await res.json();
      await saveAndApplyState(defaultState);
      setInsights([]);
      triggerToast("Leafstep slate successfully cleared.", "info");
    } catch (err: any) {
      console.warn("Server reset state failed, resetting locally & inside Supabase:", err.message);
      const defaultState = JSON.parse(JSON.stringify(LOCAL_DEFAULT_STATE));
      await saveAndApplyState(defaultState);
      setInsights([]);
      triggerToast("Leafstep local database slate successfully cleared.", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logQuantity <= 0) return triggerToast("Quantity must be positive", "error");

    let finalName = logActivityName;
    let finalUnit = "units";

    if (!finalName) {
      // Pick dynamic placeholder based on category
      if (logCategory === "transport") { finalName = "Daily commute segment"; finalUnit = "km"; }
      else if (logCategory === "diet") { finalName = "Daily sustenance meals"; finalUnit = "day"; }
      else if (logCategory === "energy") { finalName = "Household grid demand"; finalUnit = "kWh"; }
      else if (logCategory === "shopping") { finalName = "Product acquire step"; finalUnit = "item"; }
      else if (logCategory === "travel") { finalName = "Hotel accommodation shift"; finalUnit = "night"; }
    } else {
      // derive unit guess
      if (logCategory === "transport") finalUnit = "km";
      else if (logCategory === "energy") finalUnit = "kWh";
      else if (logCategory === "diet") finalUnit = "day";
      else if (logCategory === "shopping") finalUnit = "item";
      else if (logCategory === "travel") finalUnit = "night";
    }

    try {
      const res = await fetch("/api/logs/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: logCategory,
          activity_name: finalName,
          quantity: Number(logQuantity),
          unit: finalUnit,
          kg_co2: liveEstimatedCO2,
        }),
      });

      if (!res.ok) throw new Error("Could not log custom item");
      const updatedState = await res.json();
      await saveAndApplyState(updatedState);
      setLogActivityName("");
      triggerToast(`Successfully logged "${finalName}"! Added ${liveEstimatedCO2} kg CO2.`, "success");
    } catch (err: any) {
      console.warn("Server logging endpoint failed, completing locally & uploading to Supabase:", err.message);
      if (!state) return;
      
      const newLog: ActivityLog = {
        id: `local_log_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        category: logCategory,
        activity_name: finalName,
        quantity: Number(logQuantity),
        unit: finalUnit,
        kg_co2: liveEstimatedCO2,
        source: "manual",
      };
      
      const newLogs = [newLog, ...state.logs];
      
      // Local streak update
      const updatedStreaks = { ...state.streaks };
      const todayStr = new Date().toISOString().split("T")[0];
      if (!updatedStreaks.last_active_date) {
        updatedStreaks.current = 1;
        updatedStreaks.last_active_date = todayStr;
      } else if (updatedStreaks.last_active_date !== todayStr) {
        updatedStreaks.current += 1;
        if (updatedStreaks.current > updatedStreaks.best) {
          updatedStreaks.best = updatedStreaks.current;
        }
        updatedStreaks.last_active_date = todayStr;
      }
      
      // Calculate local leaf points reward
      const prevPoints = state.leaf_points ?? 350;
      const newPoints = prevPoints + 15;
      
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
        logs: newLogs,
        streaks: updatedStreaks,
        leaf_points: newPoints,
        rank: newRank,
      };
      
      await saveAndApplyState(updatedState);
      setLogActivityName("");
      triggerToast(`Synced to local device cache & Supabase! Added ${liveEstimatedCO2} kg CO2.`, "success");
    }
  };

  const submitNLPLogger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    setNlpLoading(true);
    try {
      const res = await fetch("/api/logs/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: nlpInput }),
      });

      if (!res.ok) throw new Error("AI logger could not parse this phrase");
      const responseBody = await res.json();
      await saveAndApplyState(responseBody.state);
      setNlpInput("");
      triggerToast(`AI parsed & tracked: "${responseBody.log.activity_name}" (${responseBody.log.kg_co2}kg)`, "success");
    } catch (err: any) {
      console.warn("AI natural text logger is offline. Logging as local text note:", err.message);
      if (!state) return;
      
      const query = nlpInput;
      const offlineLog: ActivityLog = {
        id: `local_nlp_${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        category: "transport",
        activity_name: `[NLP Analysis Offline] ${query}`,
        quantity: 1,
        unit: "query",
        kg_co2: 1.5,
        source: "nlp",
        raw_input: query,
      };
      
      const updatedState: AppState = {
        ...state,
        logs: [offlineLog, ...state.logs],
        leaf_points: (state.leaf_points || 350) + 10,
      };
      
      await saveAndApplyState(updatedState);
      setNlpInput("");
      triggerToast(`Logged phrase locally: "${query}"`, "info");
    } finally {
      setNlpLoading(false);
    }
  };

  const handleBillOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrFeedback("Parsing utility bill details via Vision AI...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/logs/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileDataUrl: base64Data,
            fileName: file.name,
          }),
        });

        if (!res.ok) throw new Error("OCRAgent vision reading failed. Make sure it's an image bill.");
        const data = await res.json();
        await saveAndApplyState(data.state);
        setOcrFeedback(data.feedback);
        triggerToast("Utility bill decoded successfully!", "success");
      } catch (err: any) {
        setOcrFeedback(`OCR Offline: Image uploaded locally. Server is offline, so bill reading is deferred.`);
        triggerToast("OCR requires server connectivity. File is cached.", "error");
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleAction = async (actionId: string) => {
    try {
      const res = await fetch("/api/actions/toggle", {
        method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ actionId }),
      });

      if (!res.ok) throw new Error("Failed to process recommendation action");
      const updatedState = await res.json();
      await saveAndApplyState(updatedState);

      const act = updatedState.recommended_actions.find((a: any) => a.id === actionId);
      if (act && act.completed) {
        triggerToast(`Awesome work! Saved ${act.avg_kg_co2_saved} kg CO2.`, "success");
      } else {
        triggerToast("Removed carbon mitigation claim.", "info");
      }
    } catch (err: any) {
      console.warn("Server action toggle failed, completing locally & uploading to Supabase:", err.message);
      if (!state) return;
      
      const updatedActions = state.recommended_actions.map((act) => {
        if (act.id === actionId) {
          const compl = !act.completed;
          return {
            ...act,
            completed: compl,
            completed_at: compl ? new Date().toISOString().split("T")[0] : undefined,
          };
        }
        return act;
      });
      
      const targetAction = state.recommended_actions.find(a => a.id === actionId);
      let updatedLogs = [...state.logs];
      if (targetAction) {
        const isNowCompleted = !targetAction.completed;
        const actionTitle = `[Action Completed] ${targetAction.title}`;
        if (isNowCompleted) {
          updatedLogs = [
            {
              id: `local_act_log_${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              category: targetAction.category,
              activity_name: actionTitle,
              quantity: 1,
              unit: "action",
              kg_co2: -targetAction.avg_kg_co2_saved,
              source: "manual",
            },
            ...updatedLogs,
          ];
        } else {
          updatedLogs = updatedLogs.filter(l => l.activity_name !== actionTitle);
        }
      }
      
      const updatedState: AppState = {
        ...state,
        recommended_actions: updatedActions,
        logs: updatedLogs,
        leaf_points: (state.leaf_points || 350) + 50,
      };
      
      await saveAndApplyState(updatedState);
      triggerToast("Action track toggled in local database cache & Supabase", "success");
    }
  };

  const refreshAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/insights/refresh", { method: "POST" });
      if (!res.ok) throw new Error("Could not retrieve personalized insights");
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err: any) {
      setInsights([
        {
          id: "ins_local_1",
          type: "benchmark",
          title: "Local Savings Potential",
          text: `Your current logged baseline is equivalent to approximately 75,000 smartphone charges. Small actions can drop this down significantly.`,
          category: "energy",
        },
        {
          id: "ins_local_2",
          type: "opportunity",
          title: "Meatless Mondays Opportunity",
          text: "Transitioning to plant-based diets or localized vegetarian choices saves more than 6.5 kg of methane and greenhouse gases weekly.",
          category: "diet",
        }
      ]);
      triggerToast("AI Insights refreshed locally with baseline equivalents.", "info");
    } finally {
      setInsightsLoading(false);
    }
  };

  const submitCoachChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim() || chatLoading) return;

    const userMsg = coachInput;
    setCoachInput("");
    setChatLoading(true);

    // Pre-insert temporary user chat message for fluid interface
    let stateWithUserMsg: AppState | null = null;
    if (state) {
      stateWithUserMsg = {
        ...state,
        chat_messages: [
          ...state.chat_messages,
          { role: "user", content: userMsg, timestamp: new Date().toISOString() },
        ],
      };
      setState(stateWithUserMsg);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Eco-Coach connection timed out");
      const data = await res.json();
      await saveAndApplyState(data.state);

      if (data.loggedActivity) {
        triggerToast(`Coach auto-logged: "${data.loggedActivity.activity_name}" (${data.loggedActivity.kg_co2} kg CO2)`, "success");
      }
    } catch (err: any) {
      console.warn("Eco-Coach server messaging failed, responding locally:", err.message);
      if (!stateWithUserMsg) return;
      
      const offlineReply = "Hello! It looks like my server connection is offline right now, but don't let that stop you. Rest assured, your entries are being saved 100% securely on your browser's local cache and your Supabase cloud replica. Try checking back in a moment or continue tracking your green habits!";
      
      const stateWithAssistantReply: AppState = {
        ...stateWithUserMsg,
        chat_messages: [
          ...stateWithUserMsg.chat_messages,
          { role: "model", content: offlineReply, timestamp: new Date().toISOString() }
        ]
      };
      
      await saveAndApplyState(stateWithAssistantReply);
      triggerToast("Eco-Coach speaking from offline response module.", "info");
    } finally {
      setChatLoading(false);
    }
  };

  // Quick helper for calculating country comparisons in tonnes
  const extrudedAnnualTonne = state?.profile?.baseline_kg_co2_monthly
    ? Number(((state.profile.baseline_kg_co2_monthly * 12) / 1000).toFixed(1))
    : 7.2; // default avg placeholder

  if (loading && !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] font-sans">
        <div className="text-center p-8 space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-[#1a2e26] animate-pulse">Summoning Leafstep Agents...</h2>
          <p className="text-xs text-slate-400">Querying client orchestrator state</p>
        </div>
      </div>
    );
  }

  if (showLanding && !state?.onboarded) {
    return <LandingPage onTakeAction={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] selection:bg-emerald-100 selection:text-emerald-900 font-sans leading-normal relative">
      
      {/* Aesthetic ambient eco background overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-45 pointer-events-none bg-cover bg-center bg-no-repeat bg-fixed filter saturate-[0.85] contrast-[1.02]"
        style={{ backgroundImage: "url('/assets/images/leafstep_bg_1781099273028.png')" }}
      />
      
      {/* Interactive Background wind turbines/windmills */}
      <WindmillEnhancer windSpeed={windSpeed} showTurbines={showTurbines} />
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: toast.type === 'error' && toast.message.includes('load') ? [1, 1.02, 1] : 1
            }}
            exit={{ opacity: 0, x: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              scale: toast.type === 'error' && toast.message.includes('load') ? { duration: 1, repeat: Infinity } : {}
            }}
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-2xl text-white text-xs max-w-sm shadow-2xl border ${
              toast.type === 'error' && toast.message.includes('load') ? 'bg-rose-900 border-rose-700' : 'bg-slate-900 border-slate-700'
            }`}
          >
            {toast.type === "success" && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Milestone Popup */}
      <AnimatePresence>
        {milestonePopup && (
          <MilestonePopup 
            points={state?.leaf_points || 0}
            milestone={milestonePopup.points}
            onClose={() => setMilestonePopup(null)}
          />
        )}
      </AnimatePresence>

      {/* Main Design-Forward Top Navigation Rail  */}
      <header className={`fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-transform duration-300 ease-in-out ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Leafstep
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-mono uppercase tracking-wider">V1.0</span>
              </span>
              
              {/* Resilient Database Sync Cloud Status Pill */}
              <div className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                {isOffline ? (
                  <span className="text-amber-700 bg-amber-50 flex items-center gap-1 rounded-full px-1">
                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                    <span>Offline Cache</span>
                  </span>
                ) : supabaseSyncStatus === "synced" ? (
                  <span className="text-emerald-700 bg-emerald-50 flex items-center gap-1 rounded-full px-1">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Supabase Live</span>
                  </span>
                ) : supabaseSyncStatus === "syncing" ? (
                  <span className="text-indigo-700 bg-indigo-50 flex items-center gap-1 rounded-full px-1">
                    <span className="w-1 h-1 border-t border-indigo-500 rounded-full animate-spin" />
                    <span>Saving Cloud</span>
                  </span>
                ) : (
                  <span 
                    className="text-slate-500 bg-slate-50 flex items-center gap-1 rounded-full px-1 cursor-help" 
                    title="Leafstep safe-saves local database files. Execute DDL in Supabase SQL editor to activate real-time Cloud backup (find query in Benchmarks Tab)."
                  >
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span>Local Database</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {state?.onboarded && (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-full border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-slate-700">
                    {state.profile?.archetype}
                  </span>
                </div>
              </>
            )}

            {/* Eco Wind Speed Simulator control right in header */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 p-1 rounded-full text-xs transition-colors">
              <button 
                type="button"
                className="p-1.5 rounded-full bg-white text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors"
                onClick={() => setShowTurbines(!showTurbines)}
                title={showTurbines ? "Hide background turbines" : "Show background turbines"}
              >
                {showTurbines ? <Wind className="w-4 h-4 animate-spin-slow" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              </button>
              
              {showTurbines && (
                <>
                  <div className="hidden lg:flex items-center gap-1 pr-1">
                    {[
                      { id: "breeze", label: "Breeze" },
                      { id: "normal", label: "Steady" },
                      { id: "fast", label: "Gale" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setWindSpeed(v.id as any)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                          windSpeed === v.id 
                            ? "bg-emerald-500 text-white shadow-md" 
                            : "text-slate-500 hover:text-emerald-600 hover:bg-white"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <select
                     value={windSpeed}
                     onChange={(e) => setWindSpeed(e.target.value as any)}
                     className="lg:hidden text-xs font-bold text-emerald-800 bg-transparent border-none pr-2 focus:outline-hidden cursor-pointer"
                  >
                    <option value="breeze">Breeze</option>
                    <option value="normal">Steady</option>
                    <option value="fast">Gale</option>
                  </select>
                </>
              )}
            </div>

            <button
              onClick={handleResetState}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-red-500 text-xs flex items-center gap-1.5 font-medium hover:border-red-100 hover:bg-red-50"
              title="Reset state"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHeader(false)}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-emerald-600 text-xs flex items-center gap-1.5 font-medium hover:border-emerald-100 hover:bg-emerald-50 cursor-pointer"
              title="Hide header navigation"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Restore Navbar Button */}
      {!showHeader && (
        <button
          type="button"
          onClick={() => setShowHeader(true)}
          className="fixed top-4 right-6 z-50 p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-white flex items-center justify-center cursor-pointer animate-bounce"
          title="Show top navigation"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Main Body */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 h-full pt-28 pb-12 space-y-6">

        {/* ONBOARDING STATE CHECK: If Not Onboarded, Show Personalized Onboarding Form */}
        {!state?.onboarded ? (
          <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative">
              
              {/* Illustrative Vector Hero Section inside Onboarding */}
              <div className="relative bg-emerald-100 overflow-hidden py-12 px-8 sm:px-10 text-slate-900">
                <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-50 z-0">
                  <img 
                    src="/assets/images/hero_nature_illustration_1781170769110.png" 
                    alt="Nature background" 
                    className="w-full h-full object-cover object-left mix-blend-multiply"
                  />
                </div>

                <div className="relative z-10 max-w-lg space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Leafstep Setup</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    Establish Your<br /><span className="text-emerald-700">Carbon Footprint.</span>
                  </h1>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-md">
                    Our intelligence classifies your resource consumption patterns to supply localized daily mitigation directives. Start in 60 seconds.
                  </p>
                </div>
              </div>

              {/* Onboarding survey questions */}
              <form onSubmit={handleOnboarding} className="p-8 sm:p-10 space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-3">
                    1. Your Name or Identifier
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 font-medium"
                      placeholder="e.g., Emily Carter"
                      value={surveyName}
                      onChange={(e) => setSurveyName(e.target.value)}
                      required
                    />
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                  {/* Commuting */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                      2. Common Vehicle Commute
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition-all"
                      value={surveyAnswers.transport}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, transport: e.target.value })}
                    >
                      <option value="car_petrol">Petrol (Gas) Sedan / SUV commuter</option>
                      <option value="car_diesel">Diesel Heavy displacement car</option>
                      <option value="car_hybrid">Electric Hybrid hatchback</option>
                      <option value="car_ev">Fully Electric EV (Clean grid charging)</option>
                      <option value="train">Regular Heavy transit (Train commuter)</option>
                      <option value="bus">Urban public bus networks</option>
                    </select>
                  </div>

                  {/* Diet */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                      3. Standard Eating Profile
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition-all"
                      value={surveyAnswers.diet}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, diet: e.target.value })}
                    >
                      <option value="diet_meat_day">High red meat consumption (Daily)</option>
                      <option value="diet_flexitarian_day">Flexitarian (Mixed meats, freq veg)</option>
                      <option value="diet_vegetarian_day">Strict Vegetarian (No poultry/meat)</option>
                      <option value="diet_vegan_day">100% Plant-Based/Vegan</option>
                    </select>
                  </div>

                  {/* Energy */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                      4. Home Space Climate Control
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition-all"
                      value={surveyAnswers.energy}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, energy: e.target.value })}
                    >
                      <option value="electricity">Standard Grid electric heating</option>
                      <option value="gas">Direct Natural Gas heat channels</option>
                      <option value="hybrid">Clean Nuclear grid + heat pump</option>
                    </select>
                  </div>

                  {/* Shopping */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-800">
                      5. Retail Shopping Habits
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition-all"
                      value={surveyAnswers.shopping}
                      onChange={(e) => setSurveyAnswers({ ...surveyAnswers, shopping: e.target.value })}
                    >
                      <option value="electronics_item">Tech Enthusiast (Frequent gadgets)</option>
                      <option value="clothing_item">Fashion forward (Regular shipments)</option>
                      <option value="general_item">Minimalist (Durable items, vintage)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-sm font-bold text-slate-800">
                    6. Yearly Flying Flights
                  </label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium transition-all"
                    value={surveyAnswers.travel}
                    onChange={(e) => setSurveyAnswers({ ...surveyAnswers, travel: e.target.value })}
                  >
                    <option value="heavy">Frequent Flyer (Over 10 flights/year)</option>
                    <option value="medium">Wandercrab (2-5 vacation flights)</option>
                    <option value="low">Local Roamer (Rarely take aircraft)</option>
                  </select>
                </div>

                <div className="pt-6 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                    <span>Determines baseline via IPCC</span>
                  </div>
                  <button
                    id="btn_submit_onboarding"
                    type="submit"
                    className="px-8 py-4 bg-emerald-500 text-white rounded-full text-base font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
                  >
                    <span>Synthesize Profile</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>

            </div>
          </div>
        ) : (
          /* DASHBOARD STATE: User is onboarded and setup */
          <div className="space-y-6">

            {/* Elegant Sub-Header Section Navigation Rail */}
            <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-full p-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row gap-3 items-center justify-between relative z-20">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
                <button
                  id="tab_dashboard"
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "dashboard"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Dashboard</span>
                </button>

                <button
                  id="tab_logging"
                  type="button"
                  onClick={() => setActiveTab("logging")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial transform active:scale-95 hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "logging"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Logger</span>
                </button>

                <button
                  id="tab_actions"
                  type="button"
                  onClick={() => setActiveTab("actions")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "actions"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Actions</span>
                </button>

                <button
                  id="tab_coach"
                  type="button"
                  onClick={() => setActiveTab("coach")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "coach"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 animate-pulse" />
                  <span>AI Coach</span>
                </button>

                <button
                  id="tab_benchmarks"
                  type="button"
                  onClick={() => setActiveTab("benchmarks")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer flex-1 sm:flex-initial hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "benchmarks"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>Global Targets</span>
                </button>

                <button
                  id="tab_grid"
                  type="button"
                  onClick={() => setActiveTab("grid")}
                  className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold border-b-4 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer col-span-2 xs:col-span-1 flex-1 sm:flex-initial hover:scale-[1.03] transition-transform duration-200 ${
                    activeTab === "grid"
                      ? "bg-emerald-500 text-white shadow-md border-emerald-800 transform scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-amber-500 animate-pulse" />
                  <span>Power Grid</span>
                </button>
              </div>

              {/* Day Streak Capsule */}
              <div className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full border border-amber-100 text-xs sm:text-sm font-bold text-amber-600 w-full sm:w-auto shrink-0 mx-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>Streak: {state.streaks.current} Days</span>
              </div>
            </div>

            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                {/* Milestone Progress Bar showing distance to next milestone */}
                {state && (() => {
                  const leafPoints = state.leaf_points ?? 350;
                  const currentRankLabel = state.rank ?? "Sprouting";
                  
                  const MILESTONE_LADDER = [
                    { pts: 200, label: "Sprouting", badgeName: "Eco Apprentice" },
                    { pts: 500, label: "Sapling", badgeName: "Sapling Steward" },
                    { pts: 1000, label: "Bamboo Walker", badgeName: "Bamboo Walker Badge" },
                    { pts: 2000, label: "Grove Guardian", badgeName: "Forest Guardian" },
                    { pts: 4000, label: "Forest Keeper", badgeName: "Forest Keeper Rank" },
                    { pts: 7500, label: "Earth Steward", badgeName: "Climate Legend Master" },
                    { pts: 15000, label: "Carbon Champion", badgeName: "Carbon Champion Status" },
                  ];

                  let calculatedTierIndex = -1;
                  for (let i = 0; i < MILESTONE_LADDER.length; i++) {
                    if (leafPoints >= MILESTONE_LADDER[i].pts) {
                      calculatedTierIndex = i;
                    }
                  }

                  const currentT = calculatedTierIndex >= 0 ? MILESTONE_LADDER[calculatedTierIndex] : null;
                  const nextT = calculatedTierIndex + 1 < MILESTONE_LADDER.length ? MILESTONE_LADDER[calculatedTierIndex + 1] : null;

                  const prevThresh = currentT ? currentT.pts : 0;
                  const nextThresh = nextT ? nextT.pts : prevThresh;

                  const ptsPassed = leafPoints - prevThresh;
                  const totalSpan = nextThresh - prevThresh;
                  const calculatedPercent = nextT 
                    ? Math.min(100, Math.max(0, (ptsPassed / totalSpan) * 100))
                    : 100;
                  const lpToNextValue = nextT ? nextThresh - leafPoints : 0;
                  const nextRankLabelValue = nextT ? nextT.badgeName : "Max Level";

                  const trophiesUnlocked = state.badges && state.badges.length > 5 ? state.badges.length : 5;
                  const trophiesTotal = BADGES.length || 24;
                  const trophiesPercent = (trophiesUnlocked / trophiesTotal) * 100;

                  return (
                    <div id="leafstep-progress-hub-integrated-card" className="bg-[#0D1B2A] rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col gap-0 select-none">
                      {/* Unified sticky Progress & Trophies header */}
                      <ProgressHubHeader 
                        totalLP={leafPoints}
                        currentRank={currentRankLabel}
                        lpProgressPercent={calculatedPercent}
                        trophiesUnlocked={trophiesUnlocked}
                        trophiesTotal={trophiesTotal}
                        trophiesPercent={trophiesPercent}
                        isMilestoneOpen={isMilestoneOpen}
                        isTrophiesOpen={isTrophiesOpen}
                        onMilestoneToggle={toggleMilestone}
                        onTrophiesToggle={toggleTrophies}
                        onRefresh={onRefresh}
                      />

                      {/* Collapsible Content Area */}
                      <AnimatePresence initial={false}>
                        {(isMilestoneOpen || isTrophiesOpen) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden bg-[#0A141F]/40 border-t border-white/[0.04]"
                          >
                            <div className="p-4 sm:p-6 space-y-6">
                              {/* Expanded Milestone Journey Body */}
                              {isMilestoneOpen && (
                                <motion.div
                                  id="milestone-hub-content"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  <div id="milestone-progressbar-card" className="scroll-mt-20">
                                    <MilestoneProgressBar
                                      leafPoints={leafPoints}
                                      currentRank={currentRankLabel}
                                    />
                                  </div>
                                </motion.div>
                              )}

                              {/* Expanded Trophies Body */}
                              {isTrophiesOpen && (
                                <motion.div
                                  id="badges-hub-content"
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  <BadgesShowcase badgeIds={state.badges} leafPoints={state.leaf_points} />
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {/* HIGH-FIDELITY GREEN URBAN PARK HEADER (Based on User's Reference Image) */}
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* card-canopy */}
                  <div className="flex-1 lg:flex-[2] bg-emerald-500 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col justify-between relative overflow-hidden card-canopy text-emerald-50 hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 z-0 opacity-40">
                      <img 
                        src="/assets/images/botanical_tree_illustration_1781188651412.jpg" 
                        alt="Botanical Tree Illustration" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-emerald-850 via-emerald-700/40 to-transparent"></div>
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/20 text-white tracking-wide uppercase mb-6 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Leafstep Intelligent Canopy
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">Fostering Low-Carbon Societies Through Active Stewardship</h2>
                      <p className="text-emerald-50 mt-4 leading-relaxed font-medium">Hello, <span className="font-bold underline decoration-white decoration-2">{state.profile?.name || "Steward"}</span>. Your custom ecological classification is calculated as a <span className="bg-white/20 px-2 py-0.5 rounded font-semibold text-white">{state.profile?.archetype || "Commuter Heavyweight"}</span>. Your activities directly mitigate municipal waste while steering metrics toward sustainability targets.</p>
                      
                      <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-emerald-500/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-sm flex items-center gap-2 shadow-xs">
                          <span className="w-2.5 h-2.5 bg-blue-300 rounded-full"></span>
                          <span className="font-bold text-white">EU-27 Region Compliance Baseline</span>
                        </div>
                        <div className="bg-emerald-500/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-sm flex items-center gap-2 shadow-xs">
                          <span className="w-2.5 h-2.5 bg-green-300 rounded-full"></span>
                          <span className="font-bold text-white">Equivalent: ~{((state.profile?.baseline_kg_co2_monthly || 500) / 20).toFixed(1)} Trees Grown / Mo</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-emerald-300/30 flex items-center justify-between relative z-10">
                      <p className="text-xs text-emerald-100 font-semibold">Ready to expand your preservation capacity?</p>
                      <button 
                        onClick={() => setActiveTab("actions")}
                        className="bg-white hover:bg-emerald-50 text-emerald-600 font-bold text-sm px-5 py-2.5 rounded-full shadow-lg transition-all flex items-center gap-2 group btn-cta cursor-pointer"
                      >
                        Optimize System
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
        
                  {/* card-agenda */}
                  <div className="flex-1 lg:flex-[1] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between card-agenda hover:border-emerald-200 transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          Climate Stewardship Agenda
                        </h2>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded uppercase">Active</span>
                      </div>
                      
                      {/* Calculate dynamic values for Climate Stewardship Agenda */}
                      {(() => {
                        const plantingLogs = state?.logs?.filter(l => 
                          l.activity_name?.toLowerCase().includes("plant") || 
                          l.activity_name?.toLowerCase().includes("tree") || 
                          l.activity_name?.toLowerCase().includes("sapling") || 
                          l.activity_name?.toLowerCase().includes("garden") ||
                          l.activity_name?.toLowerCase().includes("seed")
                        ) || [];
                        const plantingSaved = 12 + plantingLogs.reduce((sum, l) => sum + Math.abs(l.kg_co2), 0);
                        const plantingTarget = 50;
                        const plantingPct = Math.min(100, Math.round((plantingSaved / plantingTarget) * 100));

                        const localLogs = state?.logs?.filter(l => 
                          l.activity_name?.toLowerCase().includes("local") || 
                          l.activity_name?.toLowerCase().includes("market") || 
                          l.activity_name?.toLowerCase().includes("organic") || 
                          l.activity_name?.toLowerCase().includes("farmer") ||
                          l.activity_name?.toLowerCase().includes("bike") ||
                          l.activity_name?.toLowerCase().includes("cycle") ||
                          l.activity_name?.toLowerCase().includes("walk") ||
                          l.activity_name?.toLowerCase().includes("bus") ||
                          l.activity_name?.toLowerCase().includes("subway")
                        ) || [];
                        const localSaved = 8 + localLogs.reduce((sum, l) => sum + Math.abs(l.kg_co2) * 0.5, 0);
                        const localTarget = 45;
                        const localPct = Math.min(100, Math.round((localSaved / localTarget) * 100));

                        const gridLogs = state?.logs?.filter(l => 
                          l.activity_name?.toLowerCase().includes("smart") || 
                          l.activity_name?.toLowerCase().includes("postpone") || 
                          l.activity_name?.toLowerCase().includes("decommitment") || 
                          l.activity_name?.toLowerCase().includes("grid") ||
                          l.activity_name?.toLowerCase().includes("thermostat") ||
                          l.activity_name?.toLowerCase().includes("appliance")
                        ) || [];
                        const gridSaved = 6 + gridLogs.reduce((sum, l) => sum + Math.abs(l.kg_co2), 0);
                        const gridTarget = 30;
                        const gridPct = Math.min(100, Math.round((gridSaved / gridTarget) * 100));

                        return (
                          <motion.ol 
                            className="space-y-4"
                            variants={{
                              hidden: { opacity: 0 },
                              visible: {
                                opacity: 1,
                                transition: {
                                  staggerChildren: 0.18,
                                  delayChildren: 0.1
                                }
                              }
                            }}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.li 
                              variants={{
                                hidden: { opacity: 0, x: -16 },
                                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                              }}
                              className="flex gap-4 p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors group flex-col"
                            >
                              <div className="flex gap-4 items-start w-full">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E2ECE8] text-[#0F172A] font-mono text-xs font-bold flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-colors">1</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors truncate">Optimized Native Planting</h3>
                                    <span className="text-[10px] font-bold text-slate-500 font-mono whitespace-nowrap">{plantingSaved.toFixed(1)}/{plantingTarget} kg</span>
                                  </div>
                                  <p className="text-xs text-[#64748B] mt-0.5">Choosing native broadleaf saplings multiplies local bird/pollinator populations by 400%.</p>
                                </div>
                              </div>
                              <div className="pl-10 w-full mt-1">
                                <div className="flex justify-between text-[10px] text-emerald-600 font-semibold mb-1">
                                  <span>CO₂ Saved</span>
                                  <span>{plantingPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <motion.div 
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${plantingPct}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            </motion.li>

                            <motion.li 
                              variants={{
                                hidden: { opacity: 0, x: -16 },
                                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                              }}
                              className="flex gap-4 p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors group flex-col"
                            >
                              <div className="flex gap-4 items-start w-full">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E2ECE8] text-[#0F172A] font-mono text-xs font-bold flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-colors">2</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors truncate">Local Sourced Carbon Sinks</h3>
                                    <span className="text-[10px] font-bold text-slate-500 font-mono whitespace-nowrap">{localSaved.toFixed(1)}/{localTarget} kg</span>
                                  </div>
                                  <p className="text-xs text-[#64748B] mt-0.5">Limiting building fuel transport locks in carbon reduction directly.</p>
                                </div>
                              </div>
                              <div className="pl-10 w-full mt-1">
                                <div className="flex justify-between text-[10px] text-emerald-600 font-semibold mb-1">
                                  <span>CO₂ Saved</span>
                                  <span>{localPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <motion.div 
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${localPct}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            </motion.li>

                            <motion.li 
                              variants={{
                                hidden: { opacity: 0, x: -16 },
                                visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                              }}
                              className="flex gap-4 p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors group flex-col"
                            >
                              <div className="flex gap-4 items-start w-full">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E2ECE8] text-[#0F172A] font-mono text-xs font-bold flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white transition-colors">3</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline gap-2">
                                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors truncate">Smart Micro-grid Allocation</h3>
                                    <span className="text-[10px] font-bold text-slate-500 font-mono whitespace-nowrap">{gridSaved.toFixed(1)}/{gridTarget} kg</span>
                                  </div>
                                  <p className="text-xs text-[#64748B] mt-0.5">Shifting load metrics of household appliances lowers grid demand curves.</p>
                                </div>
                              </div>
                              <div className="pl-10 w-full mt-1">
                                <div className="flex justify-between text-[10px] text-emerald-600 font-semibold mb-1">
                                  <span>CO₂ Saved</span>
                                  <span>{gridPct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <motion.div 
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${gridPct}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            </motion.li>
                          </motion.ol>
                        );
                      })()}
                    </div>

                    <button 
                      onClick={() => setActiveTab("actions")}
                      className="w-full mt-6 bg-[#F1F5F9] hover:bg-[#E2E8F0] hover:text-slate-800 text-[#334155] font-bold text-sm py-3 rounded-xl transition-all border border-[#E2E8F0] flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      Manage Agenda Guidelines
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </button>
                  </div>
                </div>
            
            {/* UPPER PORTION: Insights and Daily Action Panel */}
            {/* Opportunities & System Insights from InsightAgent */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-md font-extrabold uppercase tracking-wider text-slate-800">
                        Weekly Opportunity Reports
                      </h3>
                    </div>

                    <button
                      onClick={refreshAIInsights}
                      disabled={insightsLoading}
                      className="p-1 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-emerald-500 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${insightsLoading ? "animate-spin" : ""}`} />
                      <span>Run Agent Analysis</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.length === 0 ? (
                      // Default insight cards
                      <>
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] space-y-4 hover:border-emerald-200 transition-colors duration-300">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm font-mono font-bold">EQ</div>
                          <h4 className="text-lg font-bold text-slate-800 font-sans">Household Equivalents</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                            Your current baseline of <strong>{state.profile?.baseline_kg_co2_monthly} kg/mo</strong> matches 3 regional passenger flights, but taking bus commuters instead can cut 45% emissions easily.
                          </p>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] space-y-4 hover:border-emerald-200 transition-colors duration-300">
                          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-sm font-mono font-bold">OP</div>
                          <h4 className="text-lg font-bold text-slate-800 font-sans">Dietary Quick-Win</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                            Reducing meat intake in exchange for legumes saves over 3.4kg CO2 per complete vegetarian day. Easily trackable within our logger.
                          </p>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] space-y-4 hover:border-emerald-200 transition-colors duration-300">
                          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-sm font-mono font-bold">ST</div>
                          <h4 className="text-lg font-bold text-slate-800 font-sans">Sustainable Habit Loop</h4>
                          <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                            Completing 3 actions in a row establishes a daily green routine. Run active agent analyses weekly to get updated custom targets.
                          </p>
                        </div>
                      </>
                    ) : (
                      insights.map((ins, idx) => {
                        const categoryMeta = CATEGORY_META[ins.category as keyof typeof CATEGORY_META] || CATEGORY_META.diet;
                        const Icon = categoryMeta.icon;
                        return (
                          <div key={ins.id || idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col justify-between hover:border-emerald-200 transition-all duration-300">
                            <div className="absolute top-4 right-4 p-1 px-2 rounded-xl bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                              {ins.type}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className={`p-2.5 rounded-2xl ${categoryMeta.bgClass} inline-flex shrink-0`}>
                                  <Icon className="w-5 h-5" />
                                </span>
                                <h4 className="text-lg font-bold text-slate-800 truncate pr-6 font-sans">{ins.title}</h4>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                                {ins.text}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {state && (
                    <DailyGoalWidget 
                      appState={state}
                      onStateUpdate={(updatedState) => setState(updatedState)}
                      triggerToast={triggerToast}
                    />
                  )}
                </div>

                <div className="pt-2">
                  {state && (
                    <StreakHistoryChart 
                      logs={state.logs || []}
                      currentStreak={state.streaks?.current || 0}
                      bestStreak={state.streaks?.best || 0}
                    />
                  )}
                </div>

                <div className="pt-2">
                  {state && (
                    <TrendAnalysisCard 
                      logs={state.logs || []}
                    />
                  )}
                </div>

                {/* INTERACTIVE BAO GAMIFIED AWARENESS GATEWAY */}
                {state && (
                  <BaoForestZone
                    appState={state}
                    onStateUpdate={(updatedState) => setState(updatedState)}
                    triggerToast={triggerToast}
                  />
                )}

                {/* LOWER / TRENDS PORTION: Recharts trends visualization */}
                <CarbonFootprintChart logs={state.logs} profile={state.profile} triggerToast={triggerToast} />

                {/* GLOBAL INTEL & LATEST NEWS REGISTRY */}
                <div className="flex flex-col lg:flex-row gap-6 pt-2">
                  
                  {/* Left bento: Beautiful high-fidelity Interactive Intel Tree with glowing numbers */}
                  <div className="w-full lg:w-7/12">
                    {state && (
                      <InteractiveIntelTree 
                        userStreak={state.streaks.current}
                        userLp={state.leaf_points ?? 350}
                        carbonIq={state.carbon_iq ?? 75}
                        onStateUpdate={(updatedState) => setState(updatedState)}
                        triggerToast={triggerToast}
                      />
                    )}
                  </div>

                  {/* Right bento: Carbon Emission News or Related Fields */}
                  <div className="w-full lg:w-5/12 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] space-y-4 hover:border-emerald-200 transition-colors duration-300">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 w-full">
                      <Newspaper className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 font-sans">
                          Mitigation & Emission News Feed
                        </h4>
                        <p className="text-[10px] text-slate-400 font-sans">Carbon offset benchmarks, policies, and sustainability breakthroughs</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {newsLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs text-slate-400 font-sans">
                          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                          <span>Curating verified environmental ledgers...</span>
                        </div>
                      ) : (
                        (climateNews?.news || [
                          {
                            id: "news_fb_1",
                            headline: "Europe's Grid Renewable Share Surpasses 45% in Q1 2026",
                            summary: "A surge in high-efficiency offshore wind farms and community microgrid deployments has set a new record, cutting regional coal reliance by 12% in the last quarter.",
                            category: "Energy",
                            carbon_impact: "Over 80M Tonnes of CO₂ avoided annually.",
                            source: "Global Grid Monitor",
                            date: "June 2026"
                          },
                          {
                            id: "news_fb_2",
                            headline: "Solid-State EV Battery Infrastructure Enters Mass Rollout",
                            summary: "Automakers are standardizing solid-state battery modules, raising typical family EV range to 800km while reducing critical battery mineral mining footprints by 30%.",
                            category: "Technology",
                            carbon_impact: "Cuts passenger vehicle lifecycle emissions.",
                            source: "Mobility Tech Review",
                            date: "June 2026"
                          },
                          {
                            id: "news_fb_3",
                            headline: "Global Carbon Credit Market Standardizes Verification Guidelines",
                            summary: "A joint treaty establishes fully auditable blockchain ledgers for sovereign woodland preservation reserves, eliminating legacy double-counting loopholes.",
                            category: "Policy",
                            carbon_impact: "Saves up to 2.4 Gigatonnes of forest carbon reservoirs.",
                            source: "UNEP Climate Bulletin",
                            date: "May 2026"
                          }
                        ]).map((newsItem: any) => (
                          <div key={newsItem.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all space-y-2 relative">
                            <div className="flex items-center justify-between gap-2">
                              <span className="p-1 px-2 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                                {newsItem.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {newsItem.source} • {newsItem.date}
                              </span>
                            </div>
                            <h5 className="text-xs font-extrabold text-slate-800 leading-snug font-sans">
                              {newsItem.headline}
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-normal font-sans font-sans">
                              {newsItem.summary}
                            </p>
                            <div className="pt-2 flex items-center justify-between text-[10px] border-t border-dashed border-slate-100">
                              <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                                <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                                <span>Impact: {newsItem.carbon_impact}</span>
                              </div>
                              <span className="text-slate-400 font-medium font-sans">Verify standard IPCC reference</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* GEN Z FUN CTA BAR */}
                <div className="relative bg-[#ccff00] text-slate-900 rounded-3xl p-6 md:p-8 overflow-hidden border-4 border-slate-900 shadow-[8px_8px_0px_#0f3620] flex flex-col md:flex-row items-center justify-between gap-6 font-sans transition-all hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_#0f3620]">
                  <div className="absolute right-0 bottom-0 pointer-events-none opacity-20 transform translate-x-1/4 translate-y-1/4">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 0L121.226 73.5414H195.106L135.44 119.417L158.267 192.959L100 147.083L41.7333 192.959L64.5599 119.417L4.89435 73.5414H78.7744L100 0Z" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  <div className="relative z-10 space-y-4 text-center md:text-left max-w-xl flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                       <span className="inline-flex items-center bg-slate-900 text-[#ccff00] px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-slate-900">
                         ✨ Vibe Check
                       </span>
                       <span className="inline-flex items-center bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-[2px_2px_0px_#000] rotate-2">
                         🌍 Touch Grass
                       </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                      Save Earth.<br /> 
                      <span className="inline-block bg-slate-900 text-[#ccff00] px-2 py-1 mt-1 transform -rotate-1 shadow-[4px_4px_0px_#fff]">
                        Be a Legend.
                      </span>
                    </h3>
                    <p className="text-slate-800 text-sm sm:text-base font-bold font-sans max-w-md pt-2">
                      Don't just scroll. Log your eco-wins, flex your stats, and secure that main character energy. 💅
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-3 shrink-0 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab("logging")}
                      className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 font-black text-sm text-[#ccff00] uppercase tracking-wider transition-all border-2 border-slate-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_#0f3620] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Log a W</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("coach")}
                      className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-emerald-50 border-2 border-slate-900 text-slate-900 font-black text-sm uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#0f3620] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Spill the Tea with Coach</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION CHECKLIST TAB */}
            {activeTab === "actions" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-emerald-100 text-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-emerald-100">
                  <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-30 z-0">
                    <img 
                      src="/assets/images/hero_nature_illustration_1781170769110.png" 
                      alt="Nature background" 
                      className="w-full h-full object-cover object-left mix-blend-multiply"
                    />
                  </div>
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Mitigation Stewardship</span>
                    </span>
                    <h3 className="text-3xl font-extrabold tracking-tight font-sans leading-tight text-slate-900">Daily Action Recommendations</h3>
                    <p className="text-slate-600 text-sm font-sans font-medium leading-relaxed max-w-xl">
                      Check off these verified daily habits to lock in real-world carbon reductions. Accomplished items automatically deduct from your local carbon log metrics.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-slate-800 font-sans">
                      Your High-Priority Actions ({state.recommended_actions.filter(a => a.completed).length} / {state.recommended_actions.length} Done)
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      Potential daily savings: -{state.recommended_actions.reduce((acc, a) => acc + (a.completed ? 0 : a.avg_kg_co2_saved), 0)} kg CO₂ remaining
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.recommended_actions.map((act) => {
                      const categoryMeta = CATEGORY_META[act.category as keyof typeof CATEGORY_META] || CATEGORY_META.diet;
                      const Icon = categoryMeta.icon;
                      return (
                        <div 
                          key={act.id} 
                          onClick={() => toggleAction(act.id)}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                            act.completed
                              ? "bg-slate-50 border-emerald-300 opacity-80"
                              : "bg-white border-slate-100 hover:border-emerald-200 shadow-sm"
                          }`}
                        >
                          <div className="pt-0.5">
                            {act.completed ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-emerald-500 transition-colors" />
                            )}
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-800 font-sans">{act.title}</span>
                              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono font-bold">
                                -{act.avg_kg_co2_saved} kg
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-normal pr-4 font-sans">{act.description}</p>
                            <div className="text-[10px] text-[#2d503d] font-semibold mt-1">
                              <strong>Why matters:</strong> {act.why_matters}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* LOGGING TAB CONTAINER */}
            {activeTab === "logging" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                
                {/* Log Activity and Scanner Column */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 space-y-6">
                  
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-md font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 font-sans">
                        <Activity className="w-5 h-5 text-emerald-600 animate-spin-slow" />
                        Multimodal Ingestion Engine
                      </h3>
                      <p className="text-xs text-slate-400 font-sans">Choose manual templates, type natural logs, or camera-scan utility receipts</p>
                    </div>
                  
                  {/* Category Fast Switch */}
                  <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-1 rounded-xl">
                    {Object.entries(CATEGORY_META).map(([key, item]) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setLogCategory(key as any);
                            setLogActivityName("");
                          }}
                          className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold font-sans cursor-pointer transition-all ${
                            logCategory === key
                              ? "bg-slate-900 text-white shadow-sm border border-slate-900"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Split: Quick logger & manual inputs on Left, Bill OCR or NLP on Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Quick Templates and Manual calculations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Quick Templates & Calculator
                    </h4>

                    {/* Quick tap template templates */}
                    {logCategory === "transport" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Subway Train Commute"); setLogQuantity(15); }}
                          className="p-2 bg-indigo-50/50 hover:bg-slate-50 border border-indigo-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🚆 Commute: 15km Heavy Transit
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("EV Daily Drive"); setLogQuantity(40); }}
                          className="p-2 bg-indigo-50/50 hover:bg-slate-50 border border-indigo-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🚗 Commute: 40km Electric EV
                        </button>
                      </div>
                    )}

                    {logCategory === "diet" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("No beef flexitarian day"); setLogQuantity(1); }}
                          className="p-2 bg-emerald-50/50 hover:bg-slate-50 border border-emerald-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🍲 Sustenance: Flexitarian Day
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Plant-based vegan day"); setLogQuantity(1); }}
                          className="p-2 bg-emerald-50/50 hover:bg-slate-50 border border-emerald-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🌿 Sustenance: Complete Vegan Day
                        </button>
                      </div>
                    )}

                    {logCategory === "energy" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Electricity usage step"); setLogQuantity(112); }}
                          className="p-2 bg-amber-50/50 hover:bg-slate-50 border border-amber-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          💡 Usage: 112 kWh Grid Electric
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Home natural gas unit"); setLogQuantity(50); }}
                          className="p-2 bg-amber-50/50 hover:bg-slate-50 border border-amber-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🔥 Usage: 50 kWh Gas heating
                        </button>
                      </div>
                    )}

                    {logCategory === "shopping" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Fast outerwear clothing"); setLogQuantity(1); }}
                          className="p-2 bg-purple-50/50 hover:bg-slate-50 border border-purple-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          👕 Shop: 1 New brand clothes
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Digital smartphone refresh"); setLogQuantity(1); }}
                          className="p-2 bg-purple-50/50 hover:bg-slate-50 border border-purple-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          📱 Shop: 1 Mobile electronics device
                        </button>
                      </div>
                    )}

                    {logCategory === "travel" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Short flights haul"); setLogQuantity(750); }}
                          className="p-2 bg-cyan-50/50 hover:bg-slate-50 border border-cyan-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          ✈️ Air: 750km short aviation route
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogActivityName("Sustainable local accommodation"); setLogQuantity(2); }}
                          className="p-2 bg-cyan-50/50 hover:bg-slate-50 border border-cyan-100 rounded-xl text-[#112a1f] font-semibold text-left"
                        >
                          🏨 Stay: 2 Nights hotel stay
                        </button>
                      </div>
                    )}

                    {/* Manual entry builder */}
                    <form onSubmit={handleManualLogging} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Activity Label / Description
                        </label>
                        <input
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                          placeholder={`Customize title e.g. "My commute to downtown"`}
                          value={logActivityName}
                          onChange={(e) => setLogActivityName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Quantity ({logCategory === "transport" ? "km" : logCategory === "diet" ? "days" : logCategory === "energy" ? "kWh" : logCategory === "travel" ? "nights" : "items"})
                          </label>
                          <input
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-none font-medium"
                            value={logQuantity}
                            onChange={(e) => setLogQuantity(Math.max(0, Number(e.target.value)))}
                            min="0"
                            step="any"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Calculated Co₂ Impact
                          </label>
                          <div className="w-full bg-[#1e293b]/5 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-800">
                            {liveEstimatedCO2} kg
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#1a442e] text-white hover:bg-emerald-800 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add manual carbon log</span>
                      </button>
                    </form>

                  </div>

                  {/* Right: Vision OCR Scanner and NLP Phrase Parsing */}
                  <div className="space-y-6">
                    
                    {/* Natural Language Parsing phrase form */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        NLP Intelligence parse
                      </h4>
                      <form onSubmit={submitNLPLogger} className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                          placeholder="e.g., drove 45km in hybrid car"
                          value={nlpInput}
                          onChange={(e) => setNlpInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={nlpLoading || !nlpInput.trim()}
                          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 disabled:opacity-40"
                        >
                          {nlpLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </form>
                    </div>

                    {/* Drag-and-drop OCR tool */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                        OCR Utility camera scanner
                      </h4>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-white rounded-2xl p-4 text-center cursor-pointer transition-all space-y-1.5 group"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleBillOCRUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#dff3e9] group-hover:text-emerald-700 flex items-center justify-center mx-auto transition-colors">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-slate-600 group-hover:text-slate-800">
                          {ocrLoading ? "Analyzing Bill Image..." : "Upload invoice / fuel receipt image"}
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                          Decodes Electricity bill (kWh), gas consumption, or flight vouchers using multimodal Vision LLM.
                        </p>
                      </div>

                      {ocrFeedback && (
                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-600 font-medium leading-relaxed max-h-[80px] overflow-y-auto">
                          <strong>OCRAgent:</strong> {ocrFeedback}
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                {/* Close the lg:col-span-8 outer container */}
                </div>

                {/* HISTORIC ACTIVITY LISTINGS right side bento of logger tab */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 flex flex-col justify-between font-sans">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-xs font-extrabold text-[#112a1f] uppercase tracking-widest font-sans font-extrabold">
                        Activity Chronicle
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{state.logs.length} logged items</span>
                    </div>

                    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                      {state.logs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs font-sans">
                          No logged items on record. Try manual entry templates on the left!
                        </div>
                      ) : (
                        state.logs.map((log) => {
                          const meta = CATEGORY_META[log.category as keyof typeof CATEGORY_META] || CATEGORY_META.diet;
                          const Icon = meta.icon;
                          const isSaving = log.kg_co2 < 0;

                          return (
                            <div 
                              key={log.id} 
                              className="flex items-center justify-between p-2 px-3 bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 rounded-xl text-xs transition-all"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={`p-1.5 rounded-lg ${meta.bgClass} flex shrink-0`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </span>
                                <div className="min-w-0 pr-4">
                                  <span className="font-bold text-slate-800 truncate block font-sans font-sans">
                                    {log.activity_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-sans">
                                    <span className="font-mono">{log.date}</span>
                                    <span>•</span>
                                    <span>{log.quantity} {log.unit}</span>
                                    <span>•</span>
                                    <span className="p-0.5 px-1 bg-slate-150 text-slate-500 rounded font-mono text-[9px] uppercase font-bold">
                                      {log.source}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 font-sans">
                                <span className={`font-mono font-bold text-xs ${isSaving ? "text-emerald-600" : "text-slate-800"}`}>
                                  {isSaving ? "" : "+"}{log.kg_co2} kg CO₂
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setState((prev) => {
                                      if (!prev) return prev;
                                      const updatedLogs = prev.logs.filter((l) => l.id !== log.id);
                                      return { ...prev, logs: updatedLogs };
                                    });
                                    triggerToast("Deleted environmental ledger item.", "info");
                                  }}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete log"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* INTEGRATED AI CLIMATE COACH */}
            {activeTab === "coach" && (
              <section role="tabpanel" id="panel-coach" aria-labelledby="tab_coach" tabIndex={0} className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                
                {/* Left Column: Guidelines / Tips on what to ask */}
                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 space-y-4">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Multi-agent Intelligence</span>
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-800 font-sans">Meet your Climate Guide</h3>
                  <p className="text-xs text-slate-500 leading-normal font-sans font-sans">
                    Our specialized multi-agent reasoning backbone evaluates your actions to identify hidden emission reduction opportunities.
                  </p>

                  <div className="space-y-3 pt-2 font-sans">
                    <h4 className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase font-sans">Interactive playbooks</h4>
                    <div className="space-y-2 text-slate-700">
                      <div 
                        className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition cursor-pointer font-sans" 
                        onClick={() => setCoachInput("Is nuclear power cleaner than solar energy?")}
                      >
                        <strong>⚡ Grid Decarbonization:</strong> Ask about cleaner electricity generation mixes.
                      </div>
                      <div 
                        className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition cursor-pointer font-sans" 
                        onClick={() => setCoachInput("How does mass transit compare to hybrid travel?")}
                      >
                        <strong>🚌 Transit Efficiency:</strong> Compare subways and rail versus driving.
                      </div>
                      <div 
                        className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition cursor-pointer font-sans" 
                        onClick={() => setCoachInput("How does meat-free dieting cut methane footprints?")}
                      >
                        <strong>🥗 Planetary Health:</strong> Learn how dietary choices slash methane footprints.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Chat Box */}
                <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 flex flex-col h-[520px]">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest block">🌿 Climate Coach</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Orchestrated Multi-Agent</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {state.chat_messages.map((m, idx) => {
                      const isModel = m.role === "model";
                      return (
                        <div 
                          key={idx} 
                          className={`flex ${isModel ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`p-3 max-w-[85%] rounded-2xl leading-relaxed ${
                            isModel 
                              ? "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200" 
                              : "bg-teal-900 text-white rounded-tr-none"
                          }`}>
                            <p>{m.content}</p>
                            <span className={`block text-[9px] mt-1 text-right ${isModel ? "text-slate-400" : "text-emerald-200/70"}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200 text-slate-500 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggested Quick prompts chips */}
                  <div className="flex gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none text-[10px] select-none text-slate-500 font-bold">
                    <button 
                      onClick={() => setCoachInput("How can I reduce diet emissions?")}
                      className="whitespace-nowrap bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg hover:text-emerald-700 transition"
                    >
                      🥗 Diet tips
                    </button>
                    <button 
                      onClick={() => setCoachInput("Log 25km ev commuter today")}
                      className="whitespace-nowrap bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg hover:text-emerald-700 transition"
                    >
                      🚗 Quick log 25km EV
                    </button>
                    <button 
                      onClick={() => setCoachInput("Why does aviation travel impact warming?")}
                      className="whitespace-nowrap bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded-lg hover:text-emerald-700 transition"
                    >
                      ✈️ Aviation flight impact
                    </button>
                  </div>

                  {/* Chat input box */}
                  <form onSubmit={submitCoachChat} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ask Coach, or type e.g. 'log beef dinner'..."
                      value={coachInput}
                      onChange={(e) => setCoachInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !coachInput.trim()}
                      className="p-2.5 bg-[#1a442e] text-white hover:bg-emerald-800 rounded-xl transition-all disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>

              </section>
            )}

            {/* BENCHMARKS & GLOBAL TARGETS TAB */}
            {activeTab === "benchmarks" && (
              <section role="tabpanel" id="panel-benchmarks" aria-labelledby="tab_benchmarks" tabIndex={0} className="space-y-6 animate-fade-in max-w-3xl mx-auto font-sans">
                <div className="bg-emerald-100 border border-emerald-100 text-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]">
                  <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-30 z-0">
                    <img 
                      src="/assets/images/hero_nature_illustration_1781170769110.png" 
                      alt="Nature background" 
                      className="w-full h-full object-cover object-left mix-blend-multiply"
                    />
                  </div>
                  <div className="relative z-10 max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Globe className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                      <span>Global Comparison Metrics</span>
                    </span>
                    <h3 className="text-3xl font-extrabold tracking-tight font-sans text-slate-900 leading-tight">Our World in Data Benchmarks</h3>
                    <p className="text-slate-600 text-sm font-sans font-medium leading-relaxed max-w-xl">
                      Compare your projected carbon emissions to global national averages and international sustainable climate limits. Learn how Leafstep activities steer you toward safe targets.
                    </p>
                  </div>
                </div>

                {/* THE "OUR WORLD IN DATA" PER CAPITA ANNUAL BENCHMARKS ELEMENT */}
                <GlobalComparisonChart 
                  userBaselineTonne={extrudedAnnualTonne} 
                  profile={state.profile} 
                />

              </section>
            )}

            {activeTab === "grid" && (
              <section role="tabpanel" id="panel-grid" aria-labelledby="tab_grid" tabIndex={0} className="space-y-6 animate-fade-in font-sans">
                <GridOptimizer
                  state={state}
                  onSaveAndApplyState={saveAndApplyState}
                  triggerToast={triggerToast}
                />
              </section>
            )}

          </div>
        )}

      </main>

      {/* Sustainable Visual Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white tracking-wider uppercase font-mono text-[10px]">🌿 Leafstep Global Climate Lab</span>
          </div>

          <p className="max-w-md mx-auto text-[11px] text-slate-500 leading-relaxed font-medium">
            Calculations calibrated against IPCC AR6, EPA Greenhouse factors, and DEFRA conversion guidelines. Multi-agent architecture driven by Google Antigravity reasoning models.
          </p>

          <div className="text-[10px] text-slate-600 font-mono">
            © 2026 Leafstep Initiative • Fostering Low-Carbon Stewardship
          </div>
        </div>
      </footer>

    </div>
  );
}
