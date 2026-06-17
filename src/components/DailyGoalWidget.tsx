import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Flame, 
  Edit2, 
  Check, 
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";
import { AppState } from "../types";

interface Goal {
  id: string;
  title: string;
  desc: string;
  carbonSaved: number;
  icon: string;
}

const DEFAULT_GOALS: Goal[] = [
  { id: "meatless_lunch", title: "Meatless Lunch", desc: "Choose vegetarian options to reduce agricultural baseline impact.", carbonSaved: 1.5, icon: "🥗" },
  { id: "walk_commute", title: "Walk or Bike", desc: "Replace driving with physical transit for short trips.", carbonSaved: 2.4, icon: "🚲" },
  { id: "idle_power", title: "Turn Off Standby Power", desc: "Unplug idle electronics to prevent phantom energy load.", carbonSaved: 0.8, icon: "🔌" },
  { id: "cold_wash", title: "Cold Water Laundry", desc: "Wash clothes at 30°C or below to reduce heating demand.", carbonSaved: 1.1, icon: "💧" },
  { id: "reusable_mug", title: "Reusable Cup & Flask", desc: "Use a non-disposable mug today to eliminate paper/plastic waste.", carbonSaved: 0.5, icon: "🥤" },
  { id: "digital_cleanup", title: "Inbox & Cloud Cleanup", desc: "Purge 50 outdated emails to lower datacentre load metrics.", carbonSaved: 0.2, icon: "📧" },
];

interface DailyGoalWidgetProps {
  appState: AppState;
  onStateUpdate: (updated: AppState) => void;
  triggerToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function DailyGoalWidget({ appState, onStateUpdate, triggerToast }: DailyGoalWidgetProps) {
  const [activeGoal, setActiveGoal] = useState<Goal>(DEFAULT_GOALS[0]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [isChangingGoal, setIsChangingGoal] = useState(false);
  const [customGoalTitle, setCustomGoalTitle] = useState("");
  const [customGoalCO2, setCustomGoalCO2] = useState("1.0");

  // Format today's date local String 'YYYY-MM-DD'
  const getTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  const todayStr = getTodayStr();

  // Load from localStorage
  useEffect(() => {
    try {
      const storedGoal = localStorage.getItem("leafstep_daily_goal_v1");
      if (storedGoal) {
        setActiveGoal(JSON.parse(storedGoal));
      } else {
        localStorage.setItem("leafstep_daily_goal_v1", JSON.stringify(DEFAULT_GOALS[0]));
      }

      const storedDates = localStorage.getItem("leafstep_completed_dates_v1");
      if (storedDates) {
        setCompletedDates(JSON.parse(storedDates));
      }
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }
  }, []);

  const isCompletedToday = completedDates.includes(todayStr);

  const handleToggleToday = () => {
    let newDates = [...completedDates];
    const userPoints = appState.leaf_points ?? 350;

    if (isCompletedToday) {
      // Remove today
      newDates = newDates.filter(d => d !== todayStr);
      setCompletedDates(newDates);
      localStorage.setItem("leafstep_completed_dates_v1", JSON.stringify(newDates));

      // Subtract 15 Leaf Points
      const updatedState: AppState = {
        ...appState,
        leaf_points: Math.max(0, userPoints - 15),
      };
      onStateUpdate(updatedState);
      triggerToast(`Removed today's goal completion. Progress cleared.`, "info");
    } else {
      // Add today
      newDates.push(todayStr);
      setCompletedDates(newDates);
      localStorage.setItem("leafstep_completed_dates_v1", JSON.stringify(newDates));

      // Award 15 Leaf Points
      const updatedState: AppState = {
        ...appState,
        leaf_points: userPoints + 15,
      };
      onStateUpdate(updatedState);
      triggerToast(`⭐ Completed! Awarded +15 Leaf Points and saved ${activeGoal.carbonSaved}kg CO₂!`, "success");
    }
  };

  const selectGoal = (goal: Goal) => {
    setActiveGoal(goal);
    localStorage.setItem("leafstep_daily_goal_v1", JSON.stringify(goal));
    setIsChangingGoal(false);
    triggerToast(`Active daily goal set to: "${goal.title}"`, "success");
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalTitle.trim()) return;

    const co2 = parseFloat(customGoalCO2) || 1.0;
    const customGoal: Goal = {
      id: `custom_${Date.now()}`,
      title: customGoalTitle.trim().substring(0, 32),
      desc: "Custom personalized high-impact daily sustainability commitment.",
      carbonSaved: co2,
      icon: "🎯",
    };

    setActiveGoal(customGoal);
    localStorage.setItem("leafstep_daily_goal_v1", JSON.stringify(customGoal));
    setIsChangingGoal(false);
    setCustomGoalTitle("");
    triggerToast(`Custom active goal set: "${customGoal.title}"`, "success");
  };

  // Get past 7 days details to render a calendar grid representation
  const getPastSevenDays = () => {
    const list = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const mStr = d.toISOString().split("T")[0];
      const dayName = weekdays[d.getDay()];
      list.push({
        dateStr: mStr,
        label: dayName,
        isToday: mStr === todayStr,
      });
    }
    return list;
  };

  const pastSevenDays = getPastSevenDays();
  const currentWeekStreak = completedDates.length; // Approximate total days done

  return (
    <div id="sustainability_daily_goal" className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100/80 flex flex-col justify-between transition-all duration-300">
      
      {/* Upper header */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Daily Sustainability Goal</h2>
              <p className="text-[11px] text-slate-400">Lock in recurring habits every day</p>
            </div>
          </div>
          <button
            onClick={() => setIsChangingGoal(!isChangingGoal)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl transition"
          >
            <Edit2 className="w-3 h-3" />
            Change Goal
          </button>
        </div>

        {/* Dynamic transition for selection area vs display area */}
        <AnimatePresence mode="wait">
          {isChangingGoal ? (
            <motion.div
              key="picking-goals"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-4 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select a Goal</span>
                <button onClick={() => setIsChangingGoal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Default Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {DEFAULT_GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => selectGoal(g)}
                    className={`p-3 rounded-2xl flex items-center gap-3 border transition text-left ${
                      activeGoal.id === g.id
                        ? "border-emerald-500 bg-emerald-50/40"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{g.title}</h4>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">-{g.carbonSaved}kg CO₂ saved</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Goal Form */}
              <form onSubmit={handleCreateCustomGoal} className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400">Or write your own:</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customGoalTitle}
                    onChange={(e) => setCustomGoalTitle(e.target.value)}
                    placeholder="E.g. Pack reusable lunchbox"
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 font-medium"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10.0"
                        value={customGoalCO2}
                        onChange={(e) => setCustomGoalCO2(e.target.value)}
                        className="w-12 bg-transparent text-xs focus:outline-none text-center font-bold text-slate-700"
                      />
                      <span className="text-[9px] text-slate-400 pr-1">kg Saved</span>
                    </div>
                    <button
                      type="submit"
                      disabled={!customGoalTitle.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1 hover:scale-102"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="current-goal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Goal Overview Display */}
              <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex gap-4 items-start relative overflow-hidden group">
                <span className="text-4xl select-none leading-none pt-1">{activeGoal.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{activeGoal.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                      -{activeGoal.carbonSaved} kg CO₂ / day
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
                    {activeGoal.desc}
                  </p>
                </div>
              </div>

              {/* Main Toggle Completion Component */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Streak Stats</span>
                  <div className="flex items-center gap-1 text-slate-700 font-black text-sm mt-0.5">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span>Total completions: {completedDates.length} days</span>
                  </div>
                </div>

                <button
                  onClick={handleToggleToday}
                  className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 select-none active:scale-95 ${
                    isCompletedToday
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isCompletedToday ? (
                    <>
                      <Check className="w-4 h-4 text-white stroke-[3.5]" />
                      Done for Today!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      Complete Today
                    </>
                  )}
                </button>
              </div>

              {/* Mini Calendar History Bubble Row */}
              <div className="pt-2 border-t border-slate-100/60">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
                  Past 7 Days History
                </span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {pastSevenDays.map((v) => {
                    const doneStr = completedDates.includes(v.dateStr);
                    return (
                      <div key={v.dateStr} className="flex flex-col items-center gap-1.5">
                        <span className={`text-[9px] font-bold ${v.isToday ? "text-emerald-500 font-extrabold" : "text-slate-400"}`}>
                          {v.label}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            doneStr
                              ? "bg-emerald-500 text-white border border-emerald-500 shadow-md shadow-emerald-500/10"
                              : v.isToday
                              ? "border-2 border-emerald-400/50 bg-slate-50/50 border-dashed"
                              : "border border-slate-200/80 bg-slate-50/20"
                          }`}
                        >
                          {doneStr ? (
                            <CheckCircle2 className="w-4 h-4 text-white fill-emerald-500" />
                          ) : (
                            <span className="text-[8px] font-bold text-slate-300">
                              {v.isToday ? "•" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
