'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, PlayCircle, Sparkles, Timer, Video } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '@/lib/api';
import { track } from '@/lib/tracking';

const tools = ['Gemini', 'Midjourney', 'Sora', 'DALL-E', 'Leonardo', 'Google Flow', 'HeyGen', 'InVideo', 'Claude AI', 'GPT'];
const courses = [
  ['ChatGPT Mastery Course', '62 recorded videos', 'from-emerald-400 via-cyan to-blue-500'],
  ['Prompt Engineering Course', '33 recorded videos', 'from-yellow-300 via-orange-400 to-pink-500'],
  ['SaaS ChatGPT Course', '33 recorded videos', 'from-violet-400 via-fuchsia-500 to-cyan'],
  ['ChatGPT Power Course', '25 recorded videos', 'from-blue-400 via-indigo-500 to-neon']
];
const testimonials = ['Rahul Sharma', 'Priya Mehta', 'Arjun Verma', 'Neha Kapoor'];
const showcaseVideos = [
  { title: 'Cinematic Product Reel', tag: 'Gemini Video Prompt', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'AI Avatar Promo', tag: 'HeyGen + GPT Script', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Faceless Shorts Pack', tag: 'Sora/Reel Format', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Business Ad Reel', tag: 'InVideo Prompt', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Viral Hook Video', tag: 'Creator Script Prompt', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Offer Promo Reel', tag: 'Sales Video Prompt', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
];
const courseVideos = [
  { title: 'ChatGPT Mastery', tag: '62 Videos', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Prompt Engineering', tag: '33 Videos', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'SaaS ChatGPT Course', tag: '33 Videos', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
];
const imageCards = [
  'Google Gemini Image Prompts',
  'Video Creation Prompts',
  'Reels & Shorts Hooks',
  'Product Ad Creatives',
  'YouTube Thumbnail Prompts',
  'Business Poster Prompts',
  'AI Avatar Script Prompts',
  'Automation Templates'
];

type PublicCard = {
  _id: string;
  sectionKey: string;
  cardType: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  mediaId?: { url?: string; alt?: string };
};
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

function useCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const slide = (direction: 'left' | 'right') => {
    ref.current?.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
  };
  return { ref, slide };
}

function CarouselControls({ onLeft, onRight }: { onLeft: () => void; onRight: () => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onLeft} aria-label="Previous cards" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-cyan hover:bg-cyan/15 hover:text-cyan">
        <ChevronLeft size={20} />
      </button>
      <button type="button" onClick={onRight} aria-label="Next cards" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-cyan hover:bg-cyan/15 hover:text-cyan">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export function LandingPage() {
  const primaryVideos = useCarousel();
  const courseVideoCarousel = useCarousel();
  const imageCarousel = useCarousel();
  const [cmsCards, setCmsCards] = useState<PublicCard[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/public/landing`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (Array.isArray(data?.cards)) setCmsCards(data.cards);
      })
      .catch(() => undefined);
  }, []);

  const dynamicShowcaseVideos = useMemo(() => {
    const cards = cmsCards.filter((card) => card.sectionKey === 'showcase_videos' && card.videoUrl);
    return cards.length ? cards.map((card) => ({ title: card.title || 'Video Card', tag: card.description || 'AI video prompt', url: card.videoUrl || '' })) : showcaseVideos;
  }, [cmsCards]);

  const dynamicCourseVideos = useMemo(() => {
    const cards = cmsCards.filter((card) => card.sectionKey === 'course_videos' && card.videoUrl);
    return cards.length ? cards.map((card) => ({ title: card.title || 'Course Video', tag: card.description || 'Recorded class', url: card.videoUrl || '' })) : courseVideos;
  }, [cmsCards]);

  const dynamicImageCards = useMemo(() => {
    const cards = cmsCards.filter((card) => card.sectionKey === 'image_cards' && card.mediaId?.url);
    return cards.length ? cards.map((card) => ({ title: card.title || 'Image Card', url: card.mediaId?.url || '/cineforge-ai-bundle.png', alt: card.mediaId?.alt || card.title || 'CineForge image card' })) : [];
  }, [cmsCards]);

  return (
    <main className="premium-bg min-h-screen overflow-hidden pb-28">
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
            Everything You Need to Start with AI
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-4xl text-5xl font-black leading-[0.95] md:text-7xl">
            <span className="text-shine">10K+ Prompts +</span><br />
            <span className="inline-block animate-[heroPulse_3.2s_ease-in-out_infinite] bg-gradient-to-r from-neon via-cyan to-magenta bg-clip-text text-transparent">
              AI Agent Course
            </span><br />
            <span className="text-white">+ Creation Bundle</span>
          </motion.h1>
          <p className="mt-6 max-w-2xl text-xl font-black leading-8 text-neon">
            No Experience Needed
          </p>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/74">
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

      <section id="videos" className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan">Video prompt showcase</p>
            <h2 className="mt-2 text-4xl font-black">Reel format video cards</h2>
            <p className="mt-3 max-w-2xl text-white/62">Short-form examples for product ads, avatar promos, faceless content and viral offer videos.</p>
          </div>
          <CarouselControls onLeft={() => primaryVideos.slide('left')} onRight={() => primaryVideos.slide('right')} />
        </div>
        <div ref={primaryVideos.ref} className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dynamicShowcaseVideos.map((video) => (
            <article key={video.title} className="min-w-[210px] snap-start overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-[0_18px_55px_rgba(0,0,0,.24)] sm:min-w-[250px]">
              <div className="relative aspect-[9/16] bg-black">
                <iframe src={video.url} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full" />
                <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-black/65 p-3 backdrop-blur">
                  <p className="text-sm font-black text-white">{video.title}</p>
                  <p className="mt-1 text-xs font-bold text-neon">{video.tag}</p>
                </div>
              </div>
            </article>
          ))}
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
        <div className="overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,.08),rgba(34,211,238,.06),rgba(250,204,21,.05))] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] md:p-8">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan">
                <Video size={17} /> Recorded Classes
              </p>
              <h2 className="mt-4 text-3xl font-black md:text-5xl">AI learning stack included</h2>
              <p className="mt-3 max-w-2xl text-white/62">Prompt bundle ke saath practical recorded classes, templates aur AI tools list bhi milegi.</p>
            </div>
            <div className="rounded-2xl border border-neon/30 bg-black/35 px-5 py-4 text-center">
              <p className="text-3xl font-black text-neon">153+</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">Recorded videos</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {courses.map(([name, count, gradient], index) => (
              <article key={name} className="group overflow-hidden rounded-2xl border border-white/10 bg-black/28 shadow-[0_18px_48px_rgba(0,0,0,.22)]">
                <div className={`relative aspect-video bg-gradient-to-br ${gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.44),transparent_24%),linear-gradient(180deg,transparent,rgba(0,0,0,.38))]" />
                  <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-black text-white backdrop-blur">Module {index + 1}</div>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-ink shadow-glow transition group-hover:scale-110">
                      <PlayCircle size={30} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-black leading-snug">{name}</p>
                  <p className="mt-2 text-sm font-black text-neon">{count}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 text-sm font-bold text-white/86 md:grid-cols-3">
            {['2500 Digital Product Ideas', '365+ Automation Templates', '1500+ AI Tools'].map((bonus, index) => (
              <p key={bonus} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan/12 text-cyan ring-1 ring-cyan/25">
                  <CheckCircle2 size={18} />
                </span>
                <span>{bonus}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan">Recorded classes preview</p>
            <h2 className="mt-2 text-4xl font-black">Course video cards</h2>
          </div>
          <CarouselControls onLeft={() => courseVideoCarousel.slide('left')} onRight={() => courseVideoCarousel.slide('right')} />
        </div>
        <div ref={courseVideoCarousel.ref} className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dynamicCourseVideos.map((video) => (
            <article key={video.title} className="min-w-[215px] snap-start overflow-hidden rounded-2xl border border-white/12 bg-white/8 sm:min-w-[260px]">
              <div className="relative aspect-[9/16] bg-gradient-to-br from-cyan/25 via-black to-magenta/20">
                <iframe src={video.url} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full" />
                <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-black/70 p-3 backdrop-blur">
                  <p className="text-sm font-black text-white">{video.title}</p>
                  <p className="mt-1 text-xs font-bold text-cyan">{video.tag}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-5 flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan">Prompt bundle images</p>
            <h2 className="mt-2 text-4xl font-black">8 image cards</h2>
          </div>
          <CarouselControls onLeft={() => imageCarousel.slide('left')} onRight={() => imageCarousel.slide('right')} />
        </div>
        <div ref={imageCarousel.ref} className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(dynamicImageCards.length ? dynamicImageCards : imageCards.map((title, index) => ({ title, url: index % 2 === 0 ? '/cineforge-ai-bundle.png' : '/digital-products.png', alt: title }))).map((card) => (
            <article key={card.title} className="min-w-[260px] snap-start overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-[0_18px_55px_rgba(0,0,0,.22)] sm:min-w-[310px]">
              <div className="relative aspect-[4/5]">
                <Image src={card.url} alt={card.alt} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/10 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4">
                  <p className="inline-flex items-center gap-2 rounded-full bg-neon px-3 py-1 text-xs font-black text-ink"><PlayCircle size={14} /> Prompt Set</p>
                  <h3 className="mt-3 text-xl font-black leading-tight text-white">{card.title}</h3>
                </div>
              </div>
            </article>
          ))}
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
