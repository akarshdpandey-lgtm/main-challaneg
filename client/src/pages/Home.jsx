import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const [quickDest, setQuickDest] = useState('');
  const navigate = useNavigate();

  const handleQuickSearch = (e) => {
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
    <div 
      className="relative min-h-screen w-full flex items-center justify-start bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/hero-bg.png')` }}
    >
      {/* Dark premium overlay gradient to guarantee accessibility contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-900/35 z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-0"></div>

      {/* Main content container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-20 flex flex-col items-start justify-center"
      >
        <div className="max-w-2xl text-left space-y-8">
          {/* Tagline Subheading with gold underline */}
          <div className="w-fit text-[11px] font-bold tracking-[0.2em] text-brand-gold border-b border-brand-gold/30 pb-2 uppercase">
            A Cultural Travel Curator, in your pocket
          </div>

          {/* Core Serif Headings */}
          <h1 className="text-5xl md:text-7xl font-serif text-white font-normal leading-[1.1] tracking-tight">
            Discover destinations <br />
            <span className="italic text-brand-gold font-normal">as locals know them.</span>
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-xl font-normal opacity-90">
            Voyager crafts AI-guided journeys weaving heritage, hidden gems, food, and living traditions into a single, beautifully composed itinerary — grounded in the cultures you're visiting.
          </p>

          {/* Large search input block */}
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
              className="px-8 py-3.5 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2.5 transition-all duration-300 shrink-0 shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25"
            >
              <span>Begin journey</span>
              <span className="text-sm">→</span>
            </button>
          </form>

          {/* Trending Pills */}
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
                  // Short timeout to let the input update visually before navigating
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
  );
}
