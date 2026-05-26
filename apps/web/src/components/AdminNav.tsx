'use client';

import { ArrowLeft, ExternalLink, Gauge, Settings } from 'lucide-react';

export function AdminNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050711]/95 px-4 py-3 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <a href="/admin/dashboard" className="text-lg font-black text-shine">CineForge Admin</a>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 hover:border-neon hover:text-neon"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <a href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 hover:border-neon hover:text-neon">
            <Gauge size={16} /> Dashboard
          </a>
          <a href="/admin/settings" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/85 hover:border-neon hover:text-neon">
            <Settings size={16} /> Settings
          </a>
          <a href="/" className="inline-flex items-center gap-2 rounded-full bg-neon px-4 py-2 text-sm font-black text-ink">
            <ExternalLink size={16} /> View Website
          </a>
        </div>
      </nav>
    </header>
  );
}
