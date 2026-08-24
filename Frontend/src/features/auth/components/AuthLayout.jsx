import React from 'react';
import { ArrowUpRight, RotateCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none">
      {/* Background scenic mountain photography */}
      <div className="snitch-scenic-bg" />
      
      {/* Cinematic dark vignette and atmospheric overlay */}
      <div className="snitch-vignette-overlay" />

      {/* Top Ambient Bar / Brand Indicator */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between pointer-events-auto">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-amber-400 group-hover:border-amber-400/50 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-heading font-black text-lg tracking-[0.25em] text-white uppercase group-hover:text-amber-400 transition-colors">
            SNITCH
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-300 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>EST. 2020 • LUXURY APPAREL</span>
        </div>
      </header>

      {/* Centered Main Glass Card Area */}
      <main className="relative z-20 w-full flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        {children}
      </main>

      {/* Bottom Floating Action Pill Badges (Exactly matching screenshot) */}
      <footer className="relative z-20 w-full px-6 py-5 flex items-center justify-between pointer-events-auto">
        {/* Bottom Left: Visit Site Button */}
        <Link
          to="/"
          className="snitch-glass-pill px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-semibold tracking-wide shadow-lg group cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span>Visit site</span>
        </Link>

        {/* Bottom Right: Quick Refresh / Interactive Tool */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          title="Refresh view"
          className="snitch-glass-pill p-2.5 rounded-2xl flex items-center justify-center text-zinc-300 hover:text-white shadow-lg cursor-pointer transition-transform active:rotate-180 duration-300"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
