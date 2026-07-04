import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, MapPin, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState({ online: false, gemini: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiStatus({
          online: data.status === 'ok',
          gemini: data.geminiKeySet
        });
      })
      .catch(() => {
        setApiStatus({ online: false, gemini: false });
      });
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent py-6 px-6 md:px-12 flex justify-between items-center">
      {/* Brand logo in Serif font */}
      <Link to="/" className="flex items-center space-x-2.5 group">
        <Compass className="h-5.5 w-5.5 text-brand-gold group-hover:rotate-45 transition-transform duration-300" />
        <span className="text-xl font-serif font-semibold tracking-wide text-white">Voyager<span className="text-brand-gold">.</span></span>
      </Link>

      {/* Center Links matching the mockup */}
      <div className="hidden md:flex items-center space-x-10">
        <Link 
          to="/" 
          className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isActive('/') ? 'text-brand-gold' : 'text-gray-300 hover:text-white'}`}
        >
          Home
        </Link>
        <Link 
          to="/planner" 
          className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isActive('/planner') ? 'text-brand-gold' : 'text-gray-300 hover:text-white'}`}
        >
          Plan Journey
        </Link>
        <Link 
          to="/dashboard" 
          className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isActive('/dashboard') ? 'text-brand-gold' : 'text-gray-300 hover:text-white'}`}
        >
          About
        </Link>
      </div>

      {/* Right side CTA Button in Gold */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Connection status indicator */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/5 text-[10px] font-mono">
          <span className={`h-2 w-2 rounded-full ${apiStatus.online && apiStatus.gemini ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-gray-400">
            {apiStatus.online && apiStatus.gemini ? 'AI Sync Active' : 'Offline Mode'}
          </span>
        </div>

        <Link 
          to="/planner" 
          className="px-5 py-2.5 rounded-sm bg-brand-gold hover:bg-brand-gold-hover text-gray-950 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md"
        >
          Plan Journey
        </Link>
      </div>

      {/* Mobile Toggle */}
      <div className="flex md:hidden items-center space-x-3">
        <span className={`h-2 w-2 rounded-full ${apiStatus.online && apiStatus.gemini ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-gray-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-slate-950/95 border-b border-white/5 flex flex-col p-6 space-y-4 md:hidden backdrop-blur-md">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-xs font-bold uppercase tracking-wider ${isActive('/') ? 'text-brand-gold' : 'text-gray-300'}`}
          >
            Home
          </Link>
          <Link 
            to="/planner" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-xs font-bold uppercase tracking-wider ${isActive('/planner') ? 'text-brand-gold' : 'text-gray-300'}`}
          >
            Plan Journey
          </Link>
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className={`text-xs font-bold uppercase tracking-wider ${isActive('/dashboard') ? 'text-brand-gold' : 'text-gray-300'}`}
          >
            About
          </Link>
          <Link 
            to="/planner"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2.5 rounded-sm bg-brand-gold text-gray-950 text-xs font-bold uppercase tracking-wider"
          >
            Plan Journey
          </Link>
        </div>
      )}
    </nav>
  );
}
