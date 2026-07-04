import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Heart, Shield, Landmark, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Home() {
  const [quickDest, setQuickDest] = useState('');
  const navigate = useNavigate();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickDest.trim()) {
      navigate(`/planner?destination=${encodeURIComponent(quickDest.trim())}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  return (
    <div className="w-full bg-[#0B0D12] text-gray-100 flex flex-col font-sans">
      
      {/* 1. Cinematic Hero Section */}
      <div 
        className="relative min-h-screen w-full flex items-center justify-start bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/hero-bg.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/35 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-0"></div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 flex flex-col items-start justify-center"
        >
          <div className="max-w-2xl text-left space-y-8">
            <div className="w-fit text-[11px] font-bold tracking-[0.2em] text-brand-gold border-b border-brand-gold/30 pb-2 uppercase">
              A Cultural Travel Curator, in your pocket
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-white font-normal leading-[1.1] tracking-tight">
              Discover destinations <br />
              <span className="italic text-brand-gold font-normal">as locals know them.</span>
            </h1>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl font-normal opacity-90">
              Voyager crafts AI-guided journeys weaving heritage, hidden gems, food, and living traditions into a single, beautifully composed itinerary — grounded in the cultures you're visiting.
            </p>

            <form 
              onSubmit={handleQuickSearch} 
              className="flex flex-col sm:flex-row items-center w-full max-w-2xl border-b border-white/20 pb-4 focus-within:border-brand-gold/60 transition-all duration-300 gap-4"
            >
              <input 
                type="text" 
                placeholder="Where to next? e.g. Kyoto, Japan" 
                value={quickDest}
                onChange={(e) => setQuickDest(e.target.value)}
                className="flex-1 w-full bg-transparent border-0 text-white text-base md:text-lg focus:outline-none placeholder-gray-500 py-2 font-normal"
                required
              />
              <button 
                type="submit"
                className="px-8 py-3.5 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2.5 transition-all duration-300 shrink-0 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25 cursor-pointer"
              >
                <span>Begin journey</span>
                <span className="text-sm">→</span>
              </button>
            </form>

            {/* Trending Destination Pills */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4 text-xs">
              <span className="font-bold tracking-widest uppercase text-brand-gold text-[10px] mr-1">Trending</span>
              {[
                "Kyoto, Japan", 
                "Marrakech, Morocco", 
                "Oaxaca, Mexico", 
                "Istanbul, Türkiye", 
                "Hoi An, Vietnam"
              ].map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => {
                    setQuickDest(dest);
                    setTimeout(() => {
                      navigate(`/planner?destination=${encodeURIComponent(dest)}`);
                    }, 150);
                  }}
                  className="px-4 py-2 rounded-full border border-white/10 bg-slate-900/35 hover:bg-white/5 hover:border-brand-gold/40 text-gray-200 hover:text-white transition-all text-xs font-medium cursor-pointer"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Why Voyager Section (Pillars) */}
      <section className="w-full bg-[#0B0D12] py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold font-mono tracking-widest text-brand-gold uppercase">Why Voyager</span>
            <h2 className="text-3xl md:text-5xl font-serif font-normal text-white leading-tight">
              An Elevated Paradigm <br />
              <span className="italic text-brand-gold">of Travel Planning</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed pt-2">
              Every detail is engineered to honor the heritage, support local artisans, and create custom connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard hoverable delay={0.1}>
              <div className="h-12 w-12 rounded-xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6">
                <Compass className="h-5 w-5 animate-spin-slow" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-3">AI Curation</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Google Gemini synthesizes real-time coordinate routes, day schedules, budget estimates, and accessibility tiers tailored specifically for you.
              </p>
            </GlassCard>

            <GlassCard hoverable delay={0.2}>
              <div className="h-12 w-12 rounded-xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-3">Lore Narrations</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Step into local history. Immersive voice-narration synthesizers read folklore, myths, and stories aloud inside our premium Story Mode console.
              </p>
            </GlassCard>

            <GlassCard hoverable delay={0.3}>
              <div className="h-12 w-12 rounded-xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-white mb-3">Ethical Conservation</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Connect directly with UNESCO monuments, local master workshops, market coordinates, and respect local traditions using etiquette guidelines.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. Luxury CTA Banner */}
      <section className="w-full bg-[#0B0D12] pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden border border-brand-gold/20 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 text-center space-y-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.1),transparent_50%)] pointer-events-none"></div>
            
            <span className="text-[10px] font-bold font-mono tracking-widest text-brand-gold uppercase">Exclusive Curation</span>
            <h2 className="text-3xl md:text-5xl font-serif font-normal text-white leading-tight">
              Begin your bespoke <span className="italic text-brand-gold">journey today</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed font-normal">
              Unlock a world of custom histories, dining specialties, and optimized coordinate paths customized for your preferences.
            </p>
            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => navigate('/planner')}
                className="px-8 py-3.5 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2.5 transition-all duration-300 shadow-lg shadow-brand-gold/20 cursor-pointer"
              >
                <span>Plan Journey</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Luxury Footer */}
      <footer className="w-full bg-[#07090d] py-16 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo description */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Compass className="h-5.5 w-5.5 text-brand-gold" />
              <span className="text-xl font-serif font-semibold tracking-wide text-white">Voyager<span className="text-brand-gold">.</span></span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              Synthesizing historical lore, local artisan recommendations, and coordinate optimization to deliver bespoke, culturally integrated travel itineraries.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white text-[10px] font-mono">Voyage Portal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => navigate('/')} className="hover:text-brand-gold transition-colors">Home Landing</button></li>
              <li><button onClick={() => navigate('/planner')} className="hover:text-brand-gold transition-colors">Curate Journey</button></li>
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-brand-gold transition-colors">Active Portal</button></li>
            </ul>
          </div>

          {/* Guidelines info */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-white text-[10px] font-mono">Conservation Ethos</h4>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Every curated itinerary respects local codes, targets UNESCO sites, and promotes direct trade with traditional craft workshops.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 gap-4">
          <span>&copy; {new Date().getFullYear()} Voyager Travel Architect. All rights reserved.</span>
          <span>Made for International Design Competition.</span>
        </div>
      </footer>

    </div>
  );
}
