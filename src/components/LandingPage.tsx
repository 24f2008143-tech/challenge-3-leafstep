import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Zap, Trophy, Trees, ArrowRight, Sparkles, Send, Droplets, Sun, Wind } from 'lucide-react';

interface LandingPageProps {
  onTakeAction: () => void;
}

export default function LandingPage({ onTakeAction }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 selection:bg-emerald-950 selection:text-emerald-400">
      
      {/* 1. Header Navigation */}
      <header className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Leafstep</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#" className="text-emerald-400">Home</a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
          </nav>
          <button 
            onClick={onTakeAction}
            className="hidden md:block bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold px-5 py-2.5 rounded-full border border-emerald-500/20 transition-all text-xs uppercase tracking-wider"
          >
            Launch Dashboard
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-40 md:pt-40 md:pb-56 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 right-0 w-full md:w-1/2 ml-auto z-0 opacity-40 md:opacity-75">
          <img 
            src="/assets/images/hero_nature_illustration_1781170769110.png" 
            alt="Lush green forest" 
            className="w-full h-full object-cover object-left 2xl:object-center mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="w-full md:w-1/2 pt-10 md:pt-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Smart Carbon Tracking
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1]">
                Track Carbon.<br />
                <span className="text-emerald-400">Optimize Energy.</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Monitor live geographic grid telemetry, defer heavy appliance loads, and log daily carbon footprint entries to build a balanced, virtual green city.
              </p>
              <button 
                onClick={onTakeAction}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8 py-4 rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-wider"
              >
                Launch Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Overlapping Cards */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-24 md:-mt-32" id="features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 text-white shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <Zap className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-emerald-400">Grid Load Scheduling</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Check live regional grid statuses and shift heavy laundry or appliance cycles to off-peak hours to balance the utility system.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 text-white shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <Leaf className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-emerald-400">Carbon Footprint Ledger</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log daily commute distance, diet parameters, and electricity choices. Receive instant feedback and see your actual carbon savings compound.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 text-white shadow-xl transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <Trees className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-emerald-400">SkyforgeZero Builder</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Convert your sustainable habits into Aero-Credits to construct wind turbines, solar fields, and ecological bamboo domes in the virtual green city.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Process / "Few Numbers" Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-full scale-75 opacity-50 filter blur-3xl"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="flex flex-col gap-6">
                <div className="bg-slate-950 p-6 rounded-3xl shadow-xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400 border border-sky-500/20">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">12%</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Water Saved</div>
                  </div>
                </div>
                <div className="bg-slate-950 p-6 rounded-3xl shadow-xl border border-white/5 flex items-center gap-4 transform translate-x-8">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">450+</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Solar Hours</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6 transform -translate-y-8">
                <div className="bg-emerald-500 p-8 rounded-3xl shadow-xl text-slate-950 text-center min-w-[160px]">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-slate-950" />
                  </div>
                  <div className="text-4xl font-black mb-1">17%</div>
                  <div className="text-sm font-bold uppercase text-slate-900">Carbon Cut</div>
                </div>
                <div className="bg-slate-950 p-6 rounded-3xl shadow-xl border border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">820</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Aero Credits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-3 font-mono">Our Milestones</h4>
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Gamified Progress Towards Atmospheric Recovery.</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Track your contribution live on the milestone progress bar. Strive to unlock 24 high-fidelity badges from the Seed tier up to Legend status.
            </p>
            <button 
              onClick={onTakeAction}
              className="text-emerald-400 font-bold flex items-center gap-2 hover:text-emerald-300 transition-colors"
            >
              Start Earning LP <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. "Our Forest" Section */}
      <section className="py-24 bg-slate-950 border-y border-white/5 relative overflow-hidden" id="about">
         <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 z-10 relative">
              <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-3 font-mono">SkyforgeZero</h4>
              <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">Virtual Green City Simulation</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Build a virtual sanctuary where carbon-neutral habits translate into physical buildings. Strategize to optimize solar generation, active commuting networks, and urban forestry parameters.
              </p>
              <button 
                onClick={onTakeAction}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-8 py-3.5 rounded-full shadow-lg transition-all text-xs uppercase tracking-wider flex items-center gap-2"
              >
                Go to SkyforgeZero <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full lg:w-1/2">
              <img 
                src="/assets/images/jungle_toucan_illustration_1781170783166.png" 
                alt="Tropical jungle illustration" 
                className="w-full object-contain drop-shadow-2xl mix-blend-luminosity opacity-85" 
              />
            </div>
         </div>
      </section>

      {/* 6. How Leafstep Works (Replacing Donation Section) */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm font-mono">Action Guide</h4>
          <h2 className="text-4xl font-extrabold text-white leading-tight">How Leafstep Works</h2>
          <p className="text-slate-400">
            Follow a simple, rewarding daily workflow to help optimize resources and lower your carbon impact.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-slate-500 font-mono block mb-4">STEP 01</span>
              <h3 className="text-xl font-bold mb-3 text-white">Audit & Log Carbon</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log transportation choices, diet parameters, and home power usage. Receive live estimates on hourly and monthly carbon footprints.
              </p>
            </div>
          </div>
          
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-slate-500 font-mono block mb-4">STEP 02</span>
              <h3 className="text-xl font-bold mb-3 text-white">Shift Appliance Schedules</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Check regional grids for peak hour thermal overload. Schedule washers or heavy devices off-peak to optimize grid balance.
              </p>
            </div>
          </div>
          
          <div className="bg-[#132237] border border-white/5 rounded-3xl p-8 relative flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-slate-500 font-mono block mb-4">STEP 03</span>
              <h3 className="text-xl font-bold mb-3 text-white">Earn Rewards & Build</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Accumulate Leaf Points (LP) and Aero-Credits (AC). Unlock milestones, secure collectible badges, and construct virtual eco structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA & Banner */}
      <footer className="pt-24 pb-0 relative bg-slate-950 text-white flex flex-col items-center z-10 overflow-hidden border-t border-white/5">
        <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to start tracking?<br/><span className="text-emerald-400">Join Leafstep Today</span></h2>
          <button 
            onClick={onTakeAction}
            className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-10 py-5 rounded-full shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider text-sm"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
          
          <div className="flex gap-8 mt-16 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
        </div>
        
        <div className="w-full mt-16 relative z-10 block pointer-events-none">
          <img 
            src="/assets/images/floral_footer_overlay_1781170796295.png" 
            alt="Floral bottom border" 
            className="w-full h-40 object-cover object-bottom opacity-20 mix-blend-screen"
          />
        </div>
      </footer>
    </div>
  );
}
