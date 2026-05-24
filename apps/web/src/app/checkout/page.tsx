'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { track } from '@/lib/api';

const defaultOffers = [
  { id: 'bundle', name: '10 Lakh+ AI Prompt Bundle', price: 199, detail: 'Gemini image and video prompt categories with lifetime access.' },
  { id: 'chatgpt', name: '100,000 ChatGPT Prompts Bundle', price: 149, detail: 'Smart work prompt library for creators and hustlers.' },
  { id: 'course', name: 'AI and Machine Learning Course', price: 147, detail: 'Beginner-friendly recorded course with practical learning path.' }
];

export default function CheckoutPage() {
  const [selected, setSelected] = useState(() => new Set(defaultOffers.map((offer) => offer.id)));
  const total = useMemo(() => defaultOffers.filter((offer) => selected.has(offer.id)).reduce((sum, offer) => sum + offer.price, 0), [selected]);

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  return (
    <main className="premium-bg min-h-screen px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/12 bg-white/95 p-5 text-ink shadow-glow md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#1264ff]">Secure checkout</p>
        <h1 className="mt-2 text-4xl font-black">Choose your bundle</h1>
        <p className="mt-3 text-slate-600">Payment button can be connected to your UPI payment link. After verification, admin can mark order paid and send PDF/download access.</p>

        <div className="mt-6 space-y-4">
          {defaultOffers.map((offer, index) => (
            <label key={offer.id} className={`grid cursor-pointer grid-cols-[auto_1fr_auto] gap-4 rounded-2xl border-2 p-4 ${selected.has(offer.id) ? 'border-[#1264ff] bg-[#eef6ff]' : 'border-slate-200 bg-white'}`}>
              <input type="checkbox" checked={selected.has(offer.id)} onChange={() => toggle(offer.id)} className="mt-1 size-5 accent-[#1264ff]" />
              <span>
                <span className="inline-flex bg-yellow-300 px-3 py-1 text-lg font-black">Yes! I Want this!</span>
                <span className="mt-3 block font-black text-slate-950">LAST CHANCE ALERT:- <span className="text-red-600">{offer.name} For ₹{offer.price}/- only</span></span>
                <span className="mt-2 block text-sm font-bold text-slate-700">LIMITED OFFER: {offer.detail}</span>
              </span>
              <span className="self-center text-2xl font-black text-[#1264ff]">₹{offer.price}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white/70">Grand Total</span>
            <span className="text-4xl font-black text-neon">₹{total}</span>
          </div>
          <a
            href={process.env.NEXT_PUBLIC_UPI_PAYMENT_URL || '#'}
            onClick={() => track('initiate_checkout', { total })}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neon px-6 py-4 font-black text-ink"
          >
            Pay Now <CheckCircle2 size={18} />
          </a>
          <p className="mt-3 flex items-center gap-2 text-xs text-white/60"><ShieldCheck size={15} /> UPI payment link, manual verification and instant access flow ready.</p>
        </div>
      </section>
    </main>
  );
}
