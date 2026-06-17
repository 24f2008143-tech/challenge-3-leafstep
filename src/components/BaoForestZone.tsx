import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  Plus, 
  Compass, 
  HelpCircle, 
  Flame, 
  Globe, 
  Trees, 
  Flame as BurnIcon, 
  Info,
  Droplet,
  Trash2,
  Smile,
  ShieldCheck,
  Smartphone,
  Star
} from "lucide-react";
import { AppState } from "../types";

interface InteractiveArcadeProps {
  appState: AppState & {
    leaf_points?: number;
    rank?: string;
    badges?: string[];
    carbon_iq?: number;
  };
  onStateUpdate: (updatedState: any) => void;
  triggerToast: (msg: string, type?: "success" | "info" | "error") => void;
}

interface SorterCard {
  id: string;
  title: string;
  scenario: string;
  correctChoice: "sus" | "goated";
  co2Impact: string;
  commentary: string; // Gen Z punchy joke
  technical: string;  // Solid carbon math
  emoji: string;
  pointsAward: number;
}

const SWIPER_CARD_POOL: SorterCard[] = [
  {
    id: "avocado_winter",
    title: "Organic Avocado Brunch in Winter",
    scenario: "Eating imported 'organic' avocados flown 8,000 miles in winter to keep your brunch aesthetic immaculate.",
    correctChoice: "sus",
    co2Impact: "High (Air Freighted)",
    commentary: "Bruh, total red flag 🚩 Air-freighted fruit has a jaw-dropping transport footprint. Winter organics aren't it.",
    technical: "Air cargo emits ~50x more CO₂ per kilometer than sea transport. Eating seasonal, local food is much more goated.",
    emoji: "🥑",
    pointsAward: 20
  },
  {
    id: "thrift_shop",
    title: "Vintage Denim Thrifting",
    scenario: "Snagging vintage secondhand jeans from a thrift shop instead of buying cheap brand-new fast fashion online.",
    correctChoice: "goated",
    co2Impact: "98% Reduced Footprint",
    commentary: "Pure main character energy! 👑 You just bypassed 7,000 liters of water and skipped the fast-fashion sweatshop emissions entirely.",
    technical: "Extending clothing usage by just 9 months via the circular economy slashes carbon and water waste footprints by nearly 30%.",
    emoji: "👖",
    pointsAward: 20
  },
  {
    id: "pc_idle_plants",
    title: "The Greenwashed Rig",
    scenario: "Leaving your RGB watercooled gaming PC running 24/7 on performance mode but putting 3 snake plants on top to 'clean the CO₂'.",
    correctChoice: "sus",
    co2Impact: "High Idle Electricity Drain",
    commentary: "Plants can't carry that much, bestie! 💀 Your desk flora cannot filter the 400 watts of fossil grid juice used by an idle high-end GPU.",
    technical: "An average high-spec PC left on performance mode idle emits ~350kg of CO₂ annually on a standard oil/coal grid; a houseplant absorbs only 5kg.",
    emoji: "🖥️",
    pointsAward: 25
  },
  {
    id: "oat_milk_swap",
    title: "The Oat Milk Upgrade",
    scenario: "Ditching cow-milk lattes in favor of oat milk for your daily triple-shot iced coffee runs.",
    correctChoice: "goated",
    co2Impact: "-80% GHG Emissions",
    commentary: "Absolutely bussin' choice! 🥛 Cow emissions are literally peak cringe. Oats require almost zero land and save massive amounts of methane.",
    technical: "Producing a glass of dairy milk creates 3x more greenhouse gases and uses 10x more land than compiling oat milk alternatives.",
    emoji: "🥛",
    pointsAward: 20
  },
  {
    id: "ev_mammoth",
    title: "The 4-Tonne Premium EV SUV",
    scenario: "Scrapping your perfectly working compact gas sedan for a giant, 4-tonne brand-new luxury EV SUV just to show off your green status.",
    correctChoice: "sus",
    co2Impact: "Overwhelming Manufacturing Carbon",
    commentary: "Maximum greenwashing trap! 🔋 The raw lithium mining and aluminum smelting for a giant 200kWh luxury battery creates a volcanic footprint.",
    technical: "Embodied manufacturing for large status EVs is ~15-20 tonnes of offset CO₂. Keeping an existing economy car is cleaner if your commute is micro.",
    emoji: "🛞",
    pointsAward: 30
  },
  {
    id: "electric_train",
    title: "High-Speed Rail Trip",
    scenario: "Choosing a comfortable 4-hour high-speed train for vacation instead of a 45-minute regional corridor plane jump.",
    correctChoice: "goated",
    co2Impact: "-92% emissions vs flying",
    commentary: "Highly based and train-pilled! 🚄 Rail runs on grid cables and bypasses the massive stratospheric kerosene injection of commercial flight.",
    technical: "A short-haul high-altitude flight burns highly polluting kerosene at takeoff, making it 15-20 times more carbon heavy than electric train travel per pass.",
    emoji: "🚄",
    pointsAward: 25
  },
  {
    id: "cold_laundry",
    title: "Cold Wash & Line Dry",
    scenario: "Washing all athletic wear in 20°C cold water and hanging them on a folding line instead of using the electric dryer.",
    correctChoice: "goated",
    co2Impact: "-90% Laundering Carbon",
    commentary: "The wind is literally free and your clothes will live twice as long. No notes, iconic behavior. 🌬️",
    technical: "Up to 90% of a washing machine's lifetime carbon footprint comes from heating the water, and electric tumble dryers use a massive ~3kWh per loop.",
    emoji: "👕",
    pointsAward: 20
  },
  {
    id: "avocado_local",
    title: "Replacing walk with 500m E-Scooter roll",
    scenario: "Renting a battery-powered dockless e-scooter to go to a boba shop situated exactly 3 blocks (450 meters) away instead of walking.",
    correctChoice: "sus",
    co2Impact: "Unnecessary Battery Lifecycle Load",
    commentary: "BFFR, just use your legs! 🚶 Dockless scooters require giant gas vans to collect and swap batteries constantly, cancelling the short green vibe.",
    technical: "When factoring in short dockless lifetimes (often under 9 months) and support fleet transit, short micro-scooter rides have a notable indirect footprint compared to pure walk.",
    emoji: "🛴",
    pointsAward: 25
  }
];

interface TycoonGadget {
  id: string;
  name: string;
  cost: number;
  reductionGg: number; // kg saved/year
  emoji: string;
  tagline: string;
  vibe: string;
  isUnlocked: boolean;
}

const INITIAL_TYCOON_ITEMS: TycoonGadget[] = [
  { id: "rave_solar", name: "Solar Hydroponic Rave Cave", cost: 100, reductionGg: 350, emoji: "🥬", tagline: "Grows electric veggies under purple rave LEDs.", vibe: "Peak Solarpunk 💜", isUnlocked: true },
  { id: "algae_bubble", name: "Cyberpunk Algae Bio-Column", cost: 250, reductionGg: 800, emoji: "🧪", tagline: "Bubbly neon tube eats green gas 40x faster than trees.", vibe: "Infinite Oxygen Glitch 🟢", isUnlocked: true },
  { id: "scoot_gang", name: "Electric Micro-Scoot Depot", cost: 400, reductionGg: 1100, emoji: "🛹", tagline: "Provides zero-emission skateboard grids.", vibe: "Fast & Solar-Powered ⚡", isUnlocked: false },
  { id: "fusion_core", name: "Micro-Fusion Garage Boiler", cost: 800, reductionGg: 2800, emoji: "⚡", tagline: "Super clean infinite power. Total backyard hack.", vibe: "Galaxy Brain Energy ⚛️", isUnlocked: false },
  { id: "vegan_fountain", name: "Oat-Milk Oasis Fountain", cost: 1500, reductionGg: 4500, emoji: "⛲", tagline: "Gushes legendary carbon-zero latte mix 24/7.", vibe: "Highly Vegan 🐮❌", isUnlocked: false },
  { id: "compost_club", name: "Compost Club Bio-Reactor", cost: 2500, reductionGg: 6500, emoji: "🪱", tagline: "Eats local garbage, stops methane landfill build-ups.", vibe: "Worm Core Activated 🪱", isUnlocked: false }
];

const CUSTOM_RANKS = [
  { name: "Carbon NPC 😐", minLp: 0, desc: "Default grid settings active. Currently taking zero macro actions.", tag: "Unranked Starter" },
  { name: "Touch Grass Rookie 🌱", minLp: 200, desc: "Bypassed standard carbon complacency. Starting to vibe with seasonal veggies.", tag: "Eco Apprentice" },
  { name: "Oat Milk Enjoyer 🥛", minLp: 500, desc: "Certified plant-based morning flow. Beef burger commercials make you cringe.", tag: "Mid-Tier Eco Guardian" },
  { name: "Grid Disruptor ⚡", minLp: 1200, desc: "Deploying solar micro-grids. Handing out clean electrons to the squad.", tag: "Elite Carbon Squeezer" },
  { name: "Sustainable Icon 👑", minLp: 3000, desc: "Eco-stats fully optimized. Carbon score is highly aesthetic to local grids.", tag: "Planetary Vibe Leader" },
  { name: "Giga-Steward (GOATED) 🌍", minLp: 7500, desc: "Operating on 100% renewable galaxy energy. The atmospheric baseline bows to you.", tag: "Climate Legend Master" },
];

export default function BaoForestZone({ appState, onStateUpdate, triggerToast }: InteractiveArcadeProps) {
  const currentLp = appState.leaf_points ?? 350;
  const currentRank = appState.rank ?? "Sprouting";
  const userBadges = appState.badges ?? ["onboarding_pioneers_badge"];
  const carbonIq = appState.carbon_iq ?? 75;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"vibe_check" | "tycoon" | "ranks">("vibe_check");

  // VIBE CHECK mini-game stats
  const [cardIndex, setCardIndex] = useState(0);
  const [shuffleCards, setShuffleCards] = useState<SorterCard[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<"sus" | "goated" | null>(null);
  const [answeredState, setAnsweredState] = useState<"correct" | "failed" | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [vibeStats, setVibeStats] = useState({ correct: 0, total: 0 });

  // TYCOON BIOME parameters (saved/restored locally to feel interactive)
  const [tycoonGadgets, setTycoonGadgets] = useState<TycoonGadget[]>([]);
  const [gridSlots, setGridSlots] = useState<(string | null)[]>(Array(9).fill(null));
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string | null>(null);

  // Initialize interactive swiper sequence
  const initSwiper = () => {
    const shuffled = [...SWIPER_CARD_POOL].sort(() => 0.5 - Math.random());
    setShuffleCards(shuffled);
    setCardIndex(0);
    setSelectedAnswer(null);
    setAnsweredState(null);
  };

  // Restore or set up Tycoon elements
  useEffect(() => {
    initSwiper();

    // Prepare grid states
    const savedGrid = localStorage.getItem("leafstep_tycoon_grid_2026");
    const savedGadgets = localStorage.getItem("leafstep_tycoon_items_2026");

    if (savedGrid && savedGadgets) {
      try {
        setGridSlots(JSON.parse(savedGrid));
        setTycoonGadgets(JSON.parse(savedGadgets));
      } catch {
        setGridSlots(["rave_solar", null, "algae_bubble", null, null, null, null, null, null]);
        setTycoonGadgets(INITIAL_TYCOON_ITEMS);
      }
    } else {
      // Default initial layout
      setGridSlots(["rave_solar", null, "algae_bubble", null, null, null, null, null, null]);
      setTycoonGadgets(INITIAL_TYCOON_ITEMS);
    }
  }, []);

  const handleVibeGuess = async (guess: "sus" | "goated") => {
    if (answeredState) return; // Prevent double answer submissions
    setSelectedAnswer(guess);
    const activeCard = shuffleCards[cardIndex];
    const isCorrect = activeCard.correctChoice === guess;
    
    setVibeStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      setAnsweredState("correct");
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);

      const points = activeCard.pointsAward;
      let badgeToUnlock = undefined;
      let triggeredMsg = `✨ Vibe Passed! GOATED choice. +${points} Leaf Points!`;

      // Master status if they reach a fast correct answer streak
      if (newStreak >= 4 && !userBadges.includes("carbon_sorter_genius")) {
        badgeToUnlock = "carbon_sorter_genius";
        triggeredMsg += " 🏆 UNLOCKED: 'Carbon Sorter Master' Badge!";
      }

      triggerToast(triggeredMsg, "success");

      // sync to backend
      try {
        const res = await fetch("/api/gamification/award", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points,
            badge: badgeToUnlock,
            carbon_iq: Math.min(100, carbonIq + 3),
            reason: `vibe_check_correct_${activeCard.id}`
          })
        });
        if (res.ok) {
          const data = await res.json();
          onStateUpdate(data.state);
        }
      } catch (err) {
        console.error("Failed to post swipe score", err);
      }

    } else {
      setAnsweredState("failed");
      setStreakCount(0);
      triggerToast("Oof, Screen failed! That is SUS! 💀 See details below.", "error");

      // Slight score adjustment
      try {
        await fetch("/api/gamification/award", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: 5, // Consolidation points
            carbon_iq: Math.max(50, carbonIq - 1),
            reason: `vibe_check_fail_${activeCard.id}`
          })
        });
      } catch {}
    }
  };

  const handleNextCard = () => {
    setSelectedAnswer(null);
    setAnsweredState(null);
    if (cardIndex < shuffleCards.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      initSwiper();
      triggerToast("🔄 Card deck refreshed! Loaded new climate scenarios.", "info");
    }
  };

  // Buy or Unlock gadget
  const handleUnlockGadget = (gadget: TycoonGadget) => {
    if (appState.leaf_points && appState.leaf_points < gadget.cost) {
      triggerToast(`Insufficient Leaf Points! You need ${gadget.cost} LP (Earn more via Logging and Swiping!)`, "error");
      return;
    }

    const updated = tycoonGadgets.map(g => {
      if (g.id === gadget.id) return { ...g, isUnlocked: true };
      return g;
    });

    setTycoonGadgets(updated);
    localStorage.setItem("leafstep_tycoon_items_2026", JSON.stringify(updated));

    // Deduct points backend
    deductPoints(gadget.cost, `unlocked_${gadget.id}`);
    triggerToast(`🔓 Unlocked ${gadget.name}! Now select a slot on the Tycoon Grid to deploy it.`, "success");
  };

  const deductPoints = async (amount: number, reason: string) => {
    try {
      const res = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: -amount,
          reason
        })
      });
      if (res.ok) {
        const data = await res.json();
        onStateUpdate(data.state);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Place upgrade on specified grid slot
  const placeGadgetOnSlot = (slotIdx: number) => {
    if (!selectedUpgradeId) {
      triggerToast("Select a unlocked facility from the menu below first!", "info");
      return;
    }

    // Check if truly unlocked
    const gadget = tycoonGadgets.find(g => g.id === selectedUpgradeId);
    if (!gadget || !gadget.isUnlocked) {
      triggerToast("Unlock this gadget first!", "error");
      return;
    }

    const newSlots = [...gridSlots];
    newSlots[slotIdx] = selectedUpgradeId;
    setGridSlots(newSlots);

    localStorage.setItem("leafstep_tycoon_grid_2026", JSON.stringify(newSlots));
    triggerToast(`🚀 Deployed ${gadget.name} to Reactor Slot #${slotIdx + 1}! Watch your simulated savings soar.`, "success");
    setSelectedUpgradeId(null);
  };

  // Clear slot
  const clearSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlots = [...gridSlots];
    newSlots[slotIdx] = null;
    setGridSlots(newSlots);
    localStorage.setItem("leafstep_tycoon_grid_2026", JSON.stringify(newSlots));
    triggerToast("🗑️ Uninstalled gadget from reactor core.", "info");
  };

  // Compute calculated metrics
  const totalTycoonCo2Savings = gridSlots.reduce((sum, itemId) => {
    if (!itemId) return sum;
    const gadget = tycoonGadgets.find(g => g.id === itemId);
    return sum + (gadget ? gadget.reductionGg : 0);
  }, 0);

  const activeVibeCard = shuffleCards[cardIndex] || SWIPER_CARD_POOL[0];

  // Battle Pass Progress Calculation
  const getProgressForRankTab = () => {
    // Find next rank limit
    const matched = [...CUSTOM_RANKS].reverse().find(r => currentLp >= r.minLp);
    const activeRankObj = matched || CUSTOM_RANKS[0];
    const activeIdx = CUSTOM_RANKS.indexOf(activeRankObj);
    const nextRankObj = activeIdx < CUSTOM_RANKS.length - 1 ? CUSTOM_RANKS[activeIdx + 1] : null;

    if (!nextRankObj) return { percent: 100, current: activeRankObj.name, next: "Max Tier attained" };

    const diffTotal = nextRankObj.minLp - activeRankObj.minLp;
    const offsetCurrent = currentLp - activeRankObj.minLp;
    return {
      percent: Math.min(100, Math.max(0, (offsetCurrent / diffTotal) * 100)),
      current: activeRankObj.name,
      next: nextRankObj.name,
      needed: nextRankObj.minLp
    };
  };

  const pbGroup = getProgressForRankTab();

  return (
    <div className="bg-[#1e1e1e] text-white rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden border-4 border-slate-900 shadow-[8px_8px_0px_#0f3620] hover:border-[#ccff00] transition-all duration-300">
      {/* Neo-brutalist pattern layer */}
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#000_2px,transparent_2px),linear-gradient(to_bottom,#000_2px,transparent_2px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Row */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-[#ccff00] text-slate-950 border-2 border-slate-900 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider rotate-[-1deg] shadow-[2px_2px_0px_#000]">
            <Gamepad2 className="w-4 h-4 animate-bounce" />
            <span>Gen-Z Climate Arcade</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans text-[#ccff00] uppercase italic">
            Eco-Check Vibe Station & Tycoon
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-medium">
            Test your real climate intuition with our <span className="text-white font-bold">Sus vs. Goated Swiper</span> and cultivate a futuristic, carbon-squeezing <span className="text-white font-bold">reactor grid</span> to maximize your stats!
          </p>

          {/* Quick status badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl px-3 py-1 flex items-center gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5 text-[#ccff00]" />
              <span className="text-slate-400 font-mono text-[10px]">RANK:</span>
              <span className="font-extrabold text-white">{currentRank}</span>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl px-3 py-1 flex items-center gap-1.5 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400 font-sans text-[10px]">POINTS:</span>
              <span className="font-extrabold text-[#ccff00]">{currentLp} LP</span>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl px-3 py-1 flex items-center gap-1.5 text-xs">
              <Star className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-mono text-[10px]">CARBON IQ:</span>
              <span className="font-extrabold text-white">{carbonIq}%</span>
            </div>
          </div>
        </div>

        {/* Enter Overlay button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              initSwiper();
            }}
            className="w-full md:w-auto bg-[#ccff00] hover:bg-[#b5e000] text-slate-950 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all border-4 border-slate-950 shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Play Arcade</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ARCADE MODAL DIALOG OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-4 overflow-hidden">
          <div className="bg-slate-900 md:border-4 border-slate-950 md:rounded-3xl w-full h-full md:max-w-6xl md:h-[92vh] overflow-hidden flex flex-col shadow-[12px_12px_0px_#ccff00] relative animate-scale-up">
            
            {/* Modal header banner */}
            <div className="p-5 sm:p-6 bg-slate-950 border-b-4 border-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-pulse">🕹️</div>
                <div>
                  <h4 className="text-lg sm:text-2xl font-black text-white font-sans uppercase tracking-tight flex items-center gap-2">
                    Leafstep Climate Arcade
                    <span className="text-xs bg-[#ccff00] text-slate-950 px-2 py-0.5 rounded-md font-mono font-black rotate-2">
                      VIBE GRID 2.0
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">Prove your ecological literacy, avoid greenwashing scams, and earn real Leaf Points!</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border-2 border-[#ccff00] hover:bg-[#ccff00] hover:text-slate-950 text-[#ccff00] rounded-xl font-bold transition-all text-xs cursor-pointer box-border uppercase"
              >
                Close Arcade
              </button>
            </div>

            {/* Selection Neo-Tabs */}
            <div className="flex border-b-4 border-slate-950 bg-slate-950/40 p-2 gap-2">
              {[
                { id: "vibe_check", label: "🔥 VIBE CHECK CARD DECK", style: "bg-purple-600 hover:bg-purple-500 text-white" },
                { id: "tycoon", label: "🏭 GREEN BIOME TYCOON", style: "bg-emerald-600 hover:bg-emerald-500 text-white" },
                { id: "ranks", label: "🏆 COMPETITIVE BATTLE PASS", style: "bg-amber-500 hover:bg-amber-400 text-slate-950" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 shadow-[2px_2px_0px_#000] cursor-pointer ${
                      active 
                        ? `${tab.id === 'ranks' ? 'bg-[#ccff00] text-slate-950 shadow-none' : 'bg-slate-100 text-slate-950 shadow-none'} translate-y-0.5` 
                        : `${tab.style}`
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Scroll Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* TAB 1: VIBE CHECK SWIPER */}
              {activeTab === "vibe_check" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Status HUD indicator */}
                  <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-[#ccff00] rounded-full animate-ping" />
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-300">
                        DECK PREPARED ({cardIndex + 1} / {shuffleCards.length || SWIPER_CARD_POOL.length})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-purple-400">STREAK: <strong className="font-mono text-[#ccff00]">{streakCount} 🔥</strong></span>
                      <span className="text-slate-400">VIBE STATUS: <strong className="font-mono text-white">{vibeStats.correct}/{vibeStats.total}</strong></span>
                    </div>
                  </div>

                  {/* Main Swipeable Card Design */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* The Interactive Display Card */}
                    <div className="md:col-span-7 flex flex-col justify-between bg-slate-950 rounded-2xl p-6 min-h-[300px] border-4 border-slate-950 shadow-[6px_6px_0px_#000] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-9xl opacity-10 font-sans pointer-events-none select-none">
                        {activeVibeCard.emoji}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl leading-none">{activeVibeCard.emoji}</span>
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Dilemma ID: #{activeVibeCard.id}</span>
                            <h5 className="text-sm font-black uppercase text-slate-200 tracking-tight font-sans">
                              {activeVibeCard.title}
                            </h5>
                          </div>
                        </div>

                        {/* Card Prompt Speech Bubble */}
                        <div className="bg-[#1e1e1e] border-2 border-slate-850 p-4 rounded-xl shadow-inner relative">
                          <p className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed font-sans italic pr-6">
                            "{activeVibeCard.scenario}"
                          </p>
                        </div>
                      </div>

                      {/* Display answer status overlays */}
                      <AnimatePresence>
                        {answeredState && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-4 rounded-xl border-2 flex items-center gap-3 mt-4 ${
                              answeredState === "correct" 
                                ? "bg-emerald-950/80 border-emerald-500 text-emerald-200" 
                                : "bg-red-950/80 border-red-800 text-red-200"
                            }`}
                          >
                            {answeredState === "correct" ? (
                              <CheckCircle2 className="w-8 h-8 text-[#ccff00] shrink-0" />
                            ) : (
                              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                            )}
                            <div className="space-y-0.5">
                              <span className="text-xs font-black uppercase tracking-wider block">
                                {answeredState === "correct" ? "✨ EXCELLENT VIBES (+Points)" : "💀 FAILED VIBE CHECK"}
                              </span>
                              <span className="text-[11px] leading-snug block">
                                CO₂ Status: <strong className="font-mono text-white text-[12px]">{activeVibeCard.co2Impact}</strong>
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Button Tray */}
                      <div className="flex gap-4 pt-6">
                        {!answeredState ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVibeGuess("sus")}
                              className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2 rotate-[-1deg]"
                            >
                              <span>🚨 SUS</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVibeGuess("goated")}
                              className="flex-1 py-4 bg-[#ccff00] hover:bg-[#b0dc00] text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2 rotate-[1deg]"
                            >
                              <span>🔥 GOATED</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={handleNextCard}
                            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-slate-950 shadow-[4px_4px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Next Scenario</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* The Explainer / Tutorial Panel on the Right */}
                    <div className="md:col-span-12 lg:col-span-5 bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                          <BurnIcon className="w-5 h-5 text-purple-400" />
                          <h6 className="text-xs font-black uppercase tracking-wider text-slate-300">
                            The Science & Slay Matrix
                          </h6>
                        </div>

                        {answeredState ? (
                          <div className="space-y-4 animate-fade-in text-xs leading-relaxed">
                            {/* Meme/Gen Z version */}
                            <div className="bg-[#ccff00]/10 border-2 border-[#ccff00]/30 p-3.5 rounded-xl">
                              <span className="text-[9px] font-black uppercase text-[#ccff00] tracking-wider block mb-1">📢 GEN Z TRANSLATOR SPEAKS:</span>
                              <p className="text-[#ccff00]/90 italic font-medium leading-relaxed font-sans">
                                "{activeVibeCard.commentary}"
                              </p>
                            </div>

                            {/* Scientific version */}
                            <div className="space-y-1 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">🔬 ATMOSPHERIC CARBON MATH:</span>
                              <p className="text-slate-300">
                                {activeVibeCard.technical}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                            <span className="text-4xl">💭</span>
                            <span className="text-xs text-slate-400 font-bold max-w-xs leading-normal">
                              Identify if the daily lifecycle scenario is a green washed gimmick (SUS!) or a legitimate ecological win (GOATED!) to unlock high-fidelity intelligence feedback loops.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom reminder banner */}
                      <div className="text-[9px] font-mono text-slate-500 pt-3 border-t border-slate-800 uppercase tracking-widest text-center">
                        Swipe/Decide to update your real-time Carbon IQ
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: GREEN REACTOR TYCOON ZONE */}
              {activeTab === "tycoon" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Top Stats Board */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-950 p-4 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#ccff00] flex flex-col justify-between">
                      <span className="text-[10px] font-black uppercase text-[#ccff00] tracking-wider block">Simulated Annual Savings</span>
                      <div className="text-3xl font-black font-mono text-white mt-2">
                        {totalTycoonCo2Savings} <span className="text-xs font-sans text-slate-400">kg CO₂e/yr</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-1 font-sans">
                        Equivalent to sequstering carbon from <strong className="text-emerald-400 font-bold">{(totalTycoonCo2Savings / 20).toFixed(0)} organic trees</strong> for a full season!
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_#ccff00] flex flex-col justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Gadget Selector</span>
                      
                      <div className="text-xs mt-2 space-y-1">
                        {selectedUpgradeId ? (
                          <div className="p-2 border-2 border-dashed border-[#ccff00] rounded-lg text-[#ccff00] flex items-center justify-between text-[11px] uppercase">
                            <span>Ready: {tycoonGadgets.find(g => g.id === selectedUpgradeId)?.name}</span>
                            <button onClick={() => setSelectedUpgradeId(null)} className="text-red-400 hover:text-red-500 font-bold">Cancel</button>
                          </div>
                        ) : (
                          <span className="italic text-slate-400 block py-1">
                            No gadget selected. Tap an unlocked green asset below, then click any grid circle slot to deploy it!
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-amber-300 font-bold mt-2 uppercase">Your Available LP for Upgrades: {currentLp} LP</span>
                    </div>

                  </div>

                  {/* TYCOON GRID SPLIT */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* The Interactive 3x3 Retro Grid */}
                    <div className="md:col-span-6 bg-slate-950 p-6 rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0px_#000] relative">
                      <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 select-none">
                        PLANETARY BIO-COOLING CORE
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 aspect-square max-w-[340px] mx-auto">
                        {gridSlots.map((itemId, idx) => {
                          const gadget = itemId ? tycoonGadgets.find(g => g.id === itemId) : null;
                          return (
                            <div
                              key={idx}
                              onClick={() => placeGadgetOnSlot(idx)}
                              className={`aspect-square rounded-2xl border-4 flex flex-col items-center justify-center relative cursor-pointer group transition-all duration-200 ${
                                gadget
                                  ? "bg-slate-900 border-emerald-500 hover:border-[#ccff00] shadow-md animate-scale-up"
                                  : "bg-slate-950 hover:bg-slate-900 border-slate-800 border-dashed hover:border-slate-500"
                              }`}
                              title={gadget ? `${gadget.name} - ${gadget.tagline}` : "Empty core slot. Click to place upgrade."}
                            >
                              <span className="text-[10px] absolute top-1 right-2 font-mono text-slate-600">#{idx + 1}</span>

                              {gadget ? (
                                <>
                                  <span className="text-3xl select-none group-hover:scale-125 transition-transform duration-300">
                                    {gadget.emoji}
                                  </span>
                                  <span className="text-[9px] text-emerald-400 font-black font-mono mt-1 text-center truncate px-1 max-w-full">
                                    -{gadget.reductionGg} kg
                                  </span>

                                  {/* Trash clear button overlay */}
                                  <button
                                    type="button"
                                    onClick={(e) => clearSlot(idx, e)}
                                    className="absolute -bottom-1 -right-1 p-1 bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-500 rounded-md text-slate-400 hover:text-red-400 cursor-pointer hidden group-hover:block transition-all shadow-md"
                                    title="Dismantle gadget"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <Plus className="w-5 h-5 text-slate-600 group-hover:text-[#ccff00] transition-colors" />
                                  <span className="text-[8px] font-bold text-slate-500 group-hover:text-slate-300">DEPLOY</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Simulated claim system */}
                      <div className="mt-4 pt-4 border-t border-slate-900 flex justify-between items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">DYNAMIC POWER LEVEL: STABLE</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (totalTycoonCo2Savings === 0) {
                              triggerToast("Deploy at least one bio-column upgrade in the grid to harvest rewards!", "info");
                              return;
                            }
                            deductPoints(-15, "harvest_tycoon");
                            triggerToast("🎉 Biome Core harvested! Received +15 Leaf Points from clean cyber production!", "success");
                          }}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_#000]"
                        >
                          Harvest Crop
                        </button>
                      </div>
                    </div>

                    {/* Left Inventory Deck of Gadgets */}
                    <div className="md:col-span-6 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Cyber-Gadget Arsenal Marketplace
                      </h5>

                      <div className="space-y-2">
                        {tycoonGadgets.map((gadget) => {
                          const activeSelect = selectedUpgradeId === gadget.id;
                          return (
                            <div
                              key={gadget.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                gadget.isUnlocked 
                                  ? activeSelect
                                    ? "bg-[#ccff00] border-slate-950 text-slate-950 shadow-md"
                                    : "bg-slate-950 border-slate-800 text-slate-100 hover:bg-slate-900"
                                  : "bg-slate-950/40 border-slate-900 opacity-60 text-slate-500"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl shrink-0 select-none">{gadget.emoji}</span>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h6 className="text-[11px] font-bold truncate">{gadget.name}</h6>
                                    <span className="text-[8px] font-sans font-black bg-slate-900 text-slate-300 px-1 py-0.2 rounded-md shrink-0 uppercase tracking-wide">
                                      {gadget.vibe}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 leading-none truncate">{gadget.tagline}</p>
                                  <p className="text-[8px] font-mono text-emerald-400">-{gadget.reductionGg} kg CO₂ / yr</p>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {gadget.isUnlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUpgradeId(gadget.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-[2px_2px_0px_#000] border cursor-pointer ${
                                      activeSelect 
                                        ? "bg-slate-950 hover:bg-slate-900 text-[#ccff00] border-slate-950" 
                                        : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                    }`}
                                  >
                                    {activeSelect ? "Active" : "Select"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockGadget(gadget)}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white border border-slate-950 rounded-lg text-[9px] font-black uppercase transition-all shadow-[2px_2px_0px_#000] cursor-pointer"
                                  >
                                    Unlock ({gadget.cost} LP)
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3: BATTLE PASS RANKS */}
              {activeTab === "ranks" && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Current milestone status bar */}
                  <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 space-y-3.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider font-mono">
                          Competitive Climate Level
                        </span>
                        <h5 className="text-md sm:text-xl font-bold text-white flex items-center gap-2 mt-1">
                          {pbGroup.current} <span className="text-xs font-mono font-normal text-[#ccff00]">({currentLp} LP achieved)</span>
                        </h5>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="block text-[10px] text-slate-500 font-mono">NEXT UNLOCK MILESTONE:</span>
                        <span className="text-xs font-black text-[#ccff00] uppercase tracking-wider font-mono">
                          {pbGroup.next} {pbGroup.needed ? `at ${pbGroup.needed} LP` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Neobrutalist segments progress bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 h-6 rounded-xl border-2 border-slate-950 p-1 overflow-hidden relative shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-emerald-500 to-[#ccff00] rounded-lg transition-all duration-500"
                          style={{ width: `${pbGroup.percent}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white font-mono uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {pbGroup.percent.toFixed(0)}% TO NEXT ECOLOGICAL STRIKE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete Battle Ranks Card Map */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-widest font-sans px-1">
                      Atmospheric Battle Pass Tiers
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CUSTOM_RANKS.map((tier, index) => {
                        const isUnlocked = currentLp >= tier.minLp;
                        const isCurrent = pbGroup.current === tier.name;

                        return (
                          <div
                            key={tier.name}
                            className={`p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                              isCurrent
                                ? "bg-slate-950 border-[#ccff00] shadow-[4px_4px_0px_#000]"
                                : isUnlocked
                                  ? "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700"
                                  : "bg-slate-950/20 border-slate-900 opacity-40 text-slate-600"
                            }`}
                          >
                            <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs shrink-0 select-none font-mono font-black text-[#ccff00]">
                              L{index + 1}
                            </span>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h6 className="text-xs font-black uppercase tracking-tight">{tier.name}</h6>
                                <span className="text-[8px] font-mono text-[#ccff00] font-bold bg-slate-900 px-1.5 py-0.2 rounded-md">
                                  {tier.minLp} LP
                                </span>
                                {isCurrent && (
                                  <span className="text-[8px] bg-[#ccff00] text-slate-950 font-black tracking-widest uppercase px-1.5 py-0.2 rounded-md font-mono rotate-1 inline-block">
                                    LIVE ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] leading-relaxed text-slate-400 font-sans font-medium">{tier.desc}</p>
                              <div className="text-[8px] text-purple-400 font-mono tracking-wider uppercase font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#ccff00]" />
                                <span>Tier Card: {tier.tag}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badge Shelf Row */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-black uppercase text-slate-400 tracking-widest font-sans px-1">
                      Steward Achievement Cabinet
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[
                        { id: "onboarding_pioneers_badge", name: "Assessment Pioneer", desc: "Completed the initial diagnostic quiz.", emoji: "🧭" },
                        { id: "carbon_sorter_genius", name: "Swipe Squeezer Master", desc: "Sorted all scenarios perfectly on streak.", emoji: "🧠" },
                        { id: "woodland_preserver", name: "Eco-Win Spree", desc: "Completed 3 or more logged footprint actions.", emoji: "🌲" },
                        { id: "meatless_hero", name: "Oat Elite Enjoyer", desc: "Logged low-carbon vegetable ingredients.", emoji: "🥦" },
                        { id: "ev_promoter", name: "Grid Pioneer Elite", desc: "Inquired about battery and turbine nodes.", emoji: "⚡" },
                      ].map((b) => {
                        const hasBadge = userBadges.includes(b.id);
                        return (
                          <div
                            key={b.id}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${
                              hasBadge
                                ? "bg-slate-950 border-emerald-500 text-white hover:scale-105 shadow-md"
                                : "bg-slate-950/20 border-slate-900 opacity-20 text-slate-600"
                            }`}
                          >
                            <div className="text-3xl py-1 transform group-hover:scale-125 transition-transform shrink-0 select-none">
                              {b.emoji}
                            </div>
                            <h6 className="text-[10px] font-black tracking-tight truncate font-sans text-slate-200 uppercase mt-1">
                              {b.name}
                            </h6>
                            <p className="text-[8px] text-slate-400 leading-snug font-sans mt-0.5 line-clamp-2 font-medium">
                              {b.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal status footer indicator */}
            <div className="p-4 bg-slate-950 border-t-4 border-slate-950 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-sans font-medium text-[10px]">
                <Smile className="w-4 h-4 text-[#ccff00]" />
                <span className="leading-none text-slate-300">Leafstep Climate Squeeze Arcade. Keeping it 100% sustainable. 🌱</span>
              </div>
              <span className="font-mono text-[9px] text-[#ccff00] font-black uppercase tracking-wider bg-slate-900 px-2 py-0.5 border border-[#ccff00]/10 rounded-md">
                SECURE PROFILE CLOUD SYNCED
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
