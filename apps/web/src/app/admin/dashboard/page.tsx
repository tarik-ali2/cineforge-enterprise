const modules = [
  ['Landing CMS', 'Hero, headline, CTA, prompt cards, video cards, course cards and testimonials.'],
  ['Media Library', 'Image/video uploads with admin name, target slot, recommended width and height.'],
  ['SEO Engine', 'Meta title, description, schema, canonical, robots, sitemap and content score.'],
  ['Tracking Hub', 'GTM, GA4, Meta Pixel, remarketing snippets, body/footer scripts and DataLayer events.'],
  ['Live Analytics', 'Visitors, sessions, traffic source, page views, CTA clicks and checkout funnel.'],
  ['Security Center', 'RBAC, JWT sessions, rate limits, audit logs, upload validation and secure headers.']
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#070816] px-5 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Admin panel</p>
            <h1 className="mt-2 text-4xl font-black text-shine">CineForge Control Room</h1>
          </div>
          <a href="/" className="rounded-full border border-white/15 px-5 py-3 font-bold">View Website</a>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {modules.map(([title, desc]) => (
            <article key={title} className="rounded-2xl border border-white/12 bg-white/8 p-5">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/62">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
