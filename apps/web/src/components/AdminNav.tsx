'use client';

import { ArrowLeft, BarChart3, CreditCard, ExternalLink, Gauge, Images, LogOut, Megaphone, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: Gauge },
  { label: 'Cards & Media', href: '/admin/content', icon: Images },
  { label: 'Checkout Offers', href: '/admin/settings#checkout', icon: CreditCard },
  { label: 'GTM & Tracking', href: '/admin/settings#tracking', icon: Megaphone },
  { label: 'Orders', href: '/admin/settings#orders', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings }
];

export function AdminNav() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[250px] border-r border-white/10 bg-[#050611] px-4 py-5 text-white shadow-[18px_0_60px_rgba(0,0,0,0.22)] md:flex md:flex-col">
        <a href="/admin/dashboard" className="mb-5 rounded-xl bg-white/[0.04] px-3 py-4 text-xl font-black tracking-tight text-neon ring-1 ring-white/10">
          CineForge
          <span className="mt-1 block text-xs font-black uppercase tracking-[0.24em] text-cyan">Admin Panel</span>
        </a>
        <nav className="grid gap-2">
          {navItems.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} className="group inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-black text-white/68 transition hover:bg-white/[0.07] hover:text-white">
              <Icon size={18} className="text-cyan transition group-hover:text-neon" />
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto grid gap-2">
          <a href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-3 py-3 text-sm font-black text-ink shadow-glow transition hover:scale-[1.02]">
            <ExternalLink size={16} /> View Website
          </a>
          <a href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-bold text-white/65 transition hover:border-red-400/60 hover:text-white">
            <LogOut size={16} /> Logout
          </a>
        </div>
      </aside>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/95 px-4 py-3 text-white shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur md:hidden">
        <nav className="flex flex-col gap-3">
          <a href="/admin/dashboard" className="text-xl font-black tracking-tight text-white">
            CineForge <span className="text-cyan">Admin</span>
          </a>
          <div className="grid grid-cols-2 gap-2">
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
          <a href="/admin/content" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-white/85 transition hover:border-cyan hover:bg-cyan/10 hover:text-cyan">
            <Images size={16} /> Content
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
    </>
  );
}
