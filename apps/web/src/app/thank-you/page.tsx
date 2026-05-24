export default function ThankYouPage() {
  return (
    <main className="premium-bg grid min-h-screen place-items-center px-5">
      <section className="max-w-xl rounded-3xl border border-white/12 bg-white/10 p-8 text-center shadow-glow">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Payment received</p>
        <h1 className="mt-3 text-4xl font-black text-shine">Thank you for buying CineForge AI</h1>
        <p className="mt-4 text-white/70">Your download link and email delivery can be triggered after admin payment verification.</p>
        <a href="/" className="mt-6 inline-flex rounded-full bg-neon px-6 py-3 font-black text-ink">Back to Home</a>
      </section>
    </main>
  );
}
