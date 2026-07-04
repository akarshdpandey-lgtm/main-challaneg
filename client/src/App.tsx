import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Dashboard from './pages/Dashboard';
import Share from './pages/Share';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-gray-100 overflow-x-hidden selection:bg-brand-gold selection:text-gray-950">
        
        {/* Navigation */}
        <Navbar />

        {/* Full Bleed Content Container */}
        <main className="flex-1 w-full relative z-10 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/share" element={<Share />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Floating Emergent Capsule Badge */}
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-slate-950/90 border border-white/10 text-[10px] font-sans font-semibold text-white shadow-xl backdrop-blur-md">
          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-slate-950 text-[8px] font-extrabold select-none">e</div>
          <span>Made with Emergent</span>
        </div>
      </div>
    </Router>
  );
}
