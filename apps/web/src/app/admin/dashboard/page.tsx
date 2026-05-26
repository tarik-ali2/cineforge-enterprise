import { AdminNav } from '@/components/AdminNav';
import { BarChart3, FileText, Image, Lock, Megaphone, Search, Settings, ShoppingCart, Video } from 'lucide-react';

const modules = [
  { title: 'Landing CMS', desc: 'Hero text, CTA, prompt cards, testimonials and page sections.', icon: FileText, href: '/admin/settings' },
  { title: 'Media Library', desc: 'Upload images, video links, card names and recommended sizes.', icon: Image, href: '/admin/settings' },
  { title: 'Video Courses', desc: 'Recorded class cards, course bundles and carousel content.', icon: Video, href: '/admin/settings' },
  { title: 'Checkout', desc: 'Product price, offer bumps, payment link and thank-you content.', icon: ShoppingCart, href: '/admin/settings' },
  { title: 'SEO Engine', desc: 'Meta title, description, schema, sitemap and index controls.', icon: Search, href: '/admin/settings' },
  { title: 'Tracking Hub', desc: 'GTM, GA4, Meta Pixel, remarketing scripts and DataLayer events.', icon: Megaphone, href: '/admin/settings' },
  { title: 'Live Analytics', desc: 'Visitors, sessions, CTA clicks and checkout funnel reporting.', icon: BarChart3, href: '/admin/settings' },
  { title: 'Security Center', desc: 'Admin roles, sessions, rate limits, logs and secure headers.', icon: Lock, href: '/admin/settings' }
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan">Admin panel</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              CineForge Control Room
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              Landing page, checkout, tracking aur content ko ek jagah se manage karo.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a href="/admin/settings" className="rounded-xl bg-neon px-5 py-4 text-center font-black text-ink transition hover:scale-[1.01]">
              Edit Website Content
            </a>
            <a href="/checkout" className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 text-center font-bold text-white transition hover:border-cyan hover:text-cyan">
              Test Checkout
            </a>
            <a href="/" className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4 text-center font-bold text-white transition hover:border-neon hover:text-neon">
              Open Landing Page
            </a>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map(({ title, desc, icon: Icon, href }) => (
            <a key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-cyan/60 hover:bg-cyan/10 hover:shadow-[0_18px_55px_rgba(34,211,238,0.12)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-cyan/25 transition group-hover:bg-cyan group-hover:text-ink">
                <Icon size={21} />
              </div>
              <h2 className="mt-5 text-xl font-black tracking-tight text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/62">{desc}</p>
              <span className="mt-5 inline-flex text-sm font-black text-neon">Open</span>
            </a>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/62">
          Current setup: content controls, tracking settings, checkout settings and media slots are connected from this admin area.
        </div>
      </section>
    </main>
  );
}
