'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, Timer, Video } from 'lucide-react';
import Image from 'next/image';
import { track } from '@/lib/tracking';
import { TrackingBridge } from './TrackingBridge';

const tools = ['Gemini', 'Midjourney', 'Sora', 'DALL-E', 'Leonardo', 'Google Flow', 'HeyGen', 'InVideo', 'Claude AI', 'GPT'];
const courses = [
  ['ChatGPT Mastery Course', '62 recorded videos'],
  ['Prompt Engineering Course', '33 recorded videos'],
  ['SaaS ChatGPT Course', '33 recorded videos'],
  ['ChatGPT Power Course', '25 recorded videos']
];
const testimonials = ['Rahul Sharma', 'Priya Mehta', 'Arjun Verma', 'Neha Kapoor'];
const toolStyles = [
  'from-[#2563eb] via-[#7c3aed] to-[#facc15] text-white border-[#facc15]/60',
  'from-[#020617] via-[#334155] to-[#e0f2fe] text-white border-white/30',
  'from-[#020617] via-[#0f766e] to-[#99f6e4] text-white border-[#99f6e4]/60',
  'from-[#052e2b] via-[#14b8a6] to-[#ccfbf1] text-[#04211f] border-[#ccfbf1]/60',
  'from-[#312e81] via-[#2563eb] to-[#bae6fd] text-white border-[#bae6fd]/60',
  'from-[#4285f4] via-[#34a853] to-[#fbbc05] text-[#071018] border-[#fbbc05]/70',
  'from-[#4c1d95] via-[#2563eb] to-[#f0abfc] text-white border-[#f0abfc]/60',
  'from-[#075985] via-[#0ea5e9] to-[#cffafe] text-[#041827] border-[#cffafe]/60',
  'from-[#7c2d12] via-[#d97745] to-[#ffe0c2] text-[#241006] border-[#ffe0c2]/60',
  'from-[#073b31] via-[#10b981] to-[#c6fff2] text-[#041c16] border-[#c6fff2]/60'
];

export function LandingPage() {
  return (
    <main className="premium-bg min-h-screen overflow-hidden pb-28">
      <TrackingBridge />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <a href="/" className="text-2xl font-black tracking-wide text-shine">CineForge AI</a>
        <div className="hidden gap-7 text-sm text-white/70 md:flex">
          <a href="#vault">Vault</a>
          <a href="#courses">Courses</a>
          <a href="#reviews">Reviews</a>
        </div>
        <a onClick={() => track('initiate_checkout', { source: 'nav_buy', value: 199, currency: 'INR', productName: 'CineForge AI Prompt Bundle' })} href="/checkout" className="rounded-full bg-neon px-5 py-3 text-sm font-black text-ink shadow-glow">Buy Rs.199</a>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex rounded-full border border-cyan/40 bg-white/8 px-4 py-2 text-sm font-bold text-cyan">
            India's digital creator prompt vault
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-4xl text-5xl font-black leading-[0.95] md:text-7xl">
            <span className="text-shine">10 Hajar+ AI Prompts</span><br />
            Image & Video Creation Bundle + AI Course
          </motion.h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/74">
            Gemini, Midjourney, Sora, DALL-E, Leonardo aur almost har AI tool ke liye ready-to-copy prompt categories plus recorded AI course. Creators, agencies, freelancers aur business owners ke liye practical prompt system.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {tools.map((tool, index) => (
              <span key={tool} className={`rounded-full border bg-gradient-to-br px-5 py-2.5 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,.32),0_16px_38px_rgba(0,0,0,.32)] ${toolStyles[index]}`}>
                {tool}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a onClick={() => track('initiate_checkout', { source: 'hero_buy', value: 199, currency: 'INR', productName: 'CineForge AI Prompt Bundle' })} href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-full bg-neon px-7 py-4 font-black text-ink">
              Get Full Bundle <ArrowRight size={18} />
            </a>
            <a href="#vault" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 font-bold text-white">
              View Prompt Sets
            </a>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/15 bg-white/8 p-4 shadow-glow">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top,#2448ff,transparent_35%),linear-gradient(135deg,#0a102b,#201044)]">
            <Image src="/cineforge-ai-bundle.png" alt="CineForge AI 10 hajar prompt bundle and AI agent course" fill priority className="object-cover" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-neon/30 bg-black/68 p-4 backdrop-blur">
              <p className="text-2xl font-black text-neon">Rs.199 Only</p>
              <p className="text-sm font-bold text-white/75">10 Hajar+ prompts, AI course and bonuses</p>
            </div>
          </div>
        </div>
      </section>

      <section id="vault" className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan">Prompt Categories</p>
            <h2 className="mt-2 text-4xl font-black">Built for high-output creators</h2>
          </div>
          <p className="hidden max-w-md text-white/62 md:block">Horizontal cards keep the page compact while showing the scale of the product.</p>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-3">
          {['Viral reels', 'Product ads', 'Business creatives', 'Faceless videos', 'YouTube thumbnails', 'Cinematic scenes', 'Logo concepts', 'Instagram posts'].map((item) => (
            <article key={item} className="min-w-[260px] snap-start rounded-2xl border border-white/12 bg-white/8 p-5">
              <Sparkles className="mb-8 text-neon" />
              <h3 className="text-xl font-black">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">Copy-ready prompts with output direction, style cues and content angles.</p>
            </article>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-5 py-10">
        <div className="rounded-3xl border border-white/12 bg-white/8 p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Video className="text-cyan" />
            <h2 className="text-3xl font-black">Recorded AI Classes Included</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {courses.map(([name, count]) => (
              <div key={name} className="rounded-2xl bg-black/25 p-5">
                <p className="font-black">{name}</p>
                <p className="mt-2 text-neon">{count}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 text-sm font-bold text-white/80 md:grid-cols-3">
            {['2500 Digital Product Ideas', '365+ Automation Templates', '1500+ AI Tools'].map((bonus) => (
              <p key={bonus} className="flex items-center gap-2"><CheckCircle2 className="text-cyan" size={18} /> {bonus}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="overflow-hidden border-y border-white/10 bg-black/22 py-5">
          <div className="marquee gap-4">
            {[...tools, ...tools].map((tool, index) => (
              <span key={`${tool}-${index}`} className={`rounded-full border bg-gradient-to-br px-7 py-3 text-lg font-black shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_16px_36px_rgba(0,0,0,.28)] ${toolStyles[index % toolStyles.length]}`}>{tool}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-5 py-10">
        <h2 className="mb-6 text-4xl font-black">Creator feedback</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {testimonials.map((name) => (
            <article key={name} className="rounded-2xl border border-white/12 bg-white/8 p-5">
              <p className="text-neon">★★★★★</p>
              <p className="mt-4 text-sm leading-6 text-white/72">Clear categories, practical prompts and useful recorded lessons for daily content work.</p>
              <p className="mt-5 font-black">{name}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neon/30 bg-ink/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3 font-black">
            <Timer className="text-neon" />
            <span className="text-white/50 line-through">Rs.2999</span>
            <span className="text-2xl text-neon">Rs.199</span>
            <span className="rounded-full bg-magenta px-3 py-1 text-xs">10 min offer</span>
          </div>
          <a onClick={() => track('initiate_checkout', { source: 'sticky_buy', value: 199, currency: 'INR', productName: 'CineForge AI Prompt Bundle' })} href="/checkout" className="w-full rounded-full bg-neon px-6 py-3 text-center font-black text-ink sm:w-auto">Buy Now</a>
        </div>
      </div>
    </main>
  );
}
