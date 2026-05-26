'use client';

import { ArrowLeft, ExternalLink, Gauge, Settings } from 'lucide-react';

export function AdminNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 px-4 py-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a href="/admin/dashboard" className="text-xl font-black tracking-tight text-white">
          CineForge <span className="text-cyan">Admin</span>
        </a>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-white/85 transition hover:border-cyan hover:bg-cyan/10 hover:text-cyan"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <a href="/admin/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-white/85 transition hover:border-cyan hover:bg-cyan/10 hover:text-cyan">
            <Gauge size={16} /> Dashboard
          </a>
          <a href="/admin/settings" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-white/85 transition hover:border-cyan hover:bg-cyan/10 hover:text-cyan">
            <Settings size={16} /> Settings
          </a>
          <a href="/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-neon px-3 py-2 text-sm font-black text-ink shadow-glow transition hover:scale-[1.02]">
            <ExternalLink size={16} /> View Website
          </a>
        </div>
      </nav>
    </header>
  );
}
