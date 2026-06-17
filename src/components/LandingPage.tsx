import React from 'react';
import { motion } from 'motion/react';
import { Leaf, HandHeart, Globe2, Recycle, ArrowRight, HeartPulse, Sparkles, Send, Droplets, Sun, Wind } from 'lucide-react';

interface LandingPageProps {
  onTakeAction: () => void;
}

export default function LandingPage({ onTakeAction }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-emerald-100">
      
      {/* 1. Header Navigation */}
      <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Leafstep</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="text-emerald-500">Home</a>
            <a href="#about" className="hover:text-emerald-500 transition-colors">About</a>
            <a href="#blog" className="hover:text-emerald-500 transition-colors">Blog</a>
            <a href="#contact" className="hover:text-emerald-500 transition-colors">Contact</a>
          </nav>
          <button className="md:hidden p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-24 pb-32 md:pt-32 md:pb-48 relative overflow-hidden bg-emerald-100">
        <div className="absolute inset-0 right-0 w-full md:w-1/2 ml-auto z-0">
          <img 
            src="/assets/images/hero_nature_illustration_1781170769110.png" 
            alt="Lush green forest" 
            className="w-full h-full object-cover object-left 2xl:object-center mix-blend-multiply"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 pt-10 md:pt-20 pb-10 md:py-20 md:pr-12">
            <div className="bg-white/70 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-6 md:p-0 rounded-3xl">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                Save Environment!<br />
                <span className="text-emerald-800">Save our Planet Earth.</span>
              </h1>
              <p className="text-slate-600 text-lg mb-8 max-w-md leading-relaxed font-medium">
                The natural environment is important to human health. It was foremost. Nature is very importance.
              </p>
              <button 
                onClick={onTakeAction}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 text-lg"
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Overlapping Cards */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-24 md:-mt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-emerald-400 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/10 transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <HandHeart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Save Our Forest</h3>
            <p className="text-emerald-50 text-sm leading-relaxed font-medium">
              Seamlessly disseminate top-line juice portals. Synergistically brand impactful solutions for premium intro.
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Globe2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Save Our World</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Quickly enhance an expanded array of core competencies before installed base methods of empowerment.
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 text-slate-800 shadow-xl shadow-slate-200/50 border border-slate-100 transform transition-transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Recycle className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Recycling</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Aggregate cross-unit e-services whereas backend methodologies. Competently deploy accurate information with.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Process / "Few Numbers" Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-emerald-50 rounded-full scale-75 opacity-50 filter blur-3xl"></div>
            <div className="flex items-center gap-8 relative z-10">
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-500">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">12%</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Save Water</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-4 transform translate-x-8">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                    <Sun className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">450</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Solar Panels</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-6 transform -translate-y-8">
                <div className="bg-emerald-500 p-8 rounded-3xl shadow-xl shadow-emerald-500/30 text-white text-center min-w-[160px]">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-black mb-1">17%</div>
                  <div className="text-sm font-bold uppercase text-emerald-100">More Trees</div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-500">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">820</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Wind Turbines</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <h4 className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-3">Few Numbers</h4>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Working Process Towards Ecology.</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Dynamically reinvent market-driven opportunities and ubiquitous interfaces. Energistically fabricate technically sound paradigm shifts.
            </p>
            <button className="text-emerald-500 font-bold flex items-center gap-2 hover:text-emerald-600 transition-colors">
              Learn More <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. "Our Work" Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden" id="about">
         <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
           <div className="w-full lg:w-1/2 z-10 relative">
             <h4 className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-3">Our Work</h4>
             <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Protect Wildlife & Ecosystems</h2>
             <p className="text-slate-600 leading-relaxed mb-8">
               Proactively envisioned multimedia based expertise and cross-media growth strategies. Seamlessly visualize quality intellectual capital without superior collaboration and idea-sharing.
             </p>
             <button 
                onClick={onTakeAction}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-sm flex items-center gap-2"
              >
               See All Work <ArrowRight className="w-4 h-4" />
             </button>
           </div>
           <div className="w-full lg:w-1/2">
              <img 
                src="/assets/images/jungle_toucan_illustration_1781170783166.png" 
                alt="Tropical jungle with toucan and monkeys" 
                className="w-full object-contain drop-shadow-2xl mix-blend-multiply" 
              />
           </div>
         </div>
      </section>

      {/* 6. Make Donation / Your Contribution Form */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="contact">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="w-full lg:w-5/12">
            <h4 className="text-emerald-500 font-bold uppercase tracking-wider text-sm mb-3">Your Contribution</h4>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">Make A Donation</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Collaboratively repurpose functional ROI without technically sound methods of action. Completely synthesize impactful resources.
            </p>
            <div className="flex gap-4">
               <button className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors">
                 <HeartPulse className="w-5 h-5" />
               </button>
               <button className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#emerald-500] hover:bg-emerald-500 hover:text-white transition-colors">
                 <Sparkles className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          <div className="w-full lg:w-7/12">
            <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 sm:p-10 relative">
               <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Make Donation</h3>
               <form className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <input type="text" placeholder="First Name *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800" />
                   <input type="text" placeholder="Last Name *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800" />
                 </div>
                 <input type="email" placeholder="Email Address *" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-800" />
                 
                 <div className="flex flex-wrap gap-3 py-2">
                    {['$10', '$50', '$100', 'Custom'].map((amt, i) => (
                      <button key={amt} type="button" className={`px-6 py-2.5 rounded-xl font-bold border transition-colors ${i === 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-500'}`}>
                        {amt}
                      </button>
                    ))}
                 </div>
                 
                 <button type="button" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 text-lg">
                   Donate Now <ArrowRight className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer CTA & Banner */}
      <footer className="pt-24 pb-0 relative bg-emerald-950 text-white flex flex-col items-center z-10 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,#052e16_0%,#022c22_100%)]" />
        <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Have Question in mind?<br/><span className="text-emerald-300">Let us help you</span></h2>
          <div className="w-full mt-8 relative">
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              className="w-full bg-white/10 border border-white/20 rounded-full px-8 py-5 text-white placeholder:text-emerald-200/50 focus:outline-none focus:bg-white/20 transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 rounded-full shadow-lg transition-all flex items-center gap-2">
              Send <Send className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="flex gap-8 mt-16 text-emerald-200/70 font-medium text-sm">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Success Stories</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="w-full mt-16 relative z-10 block pointer-events-none">
          <img 
            src="/assets/images/floral_footer_overlay_1781170796295.png" 
            alt="Floral bottom border" 
            className="w-full h-40 object-cover object-bottom opacity-90 saturate-150 contrast-125"
          />
        </div>
      </footer>
    </div>
  );
}
