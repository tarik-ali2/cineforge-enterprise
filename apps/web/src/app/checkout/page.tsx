'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { getStoredUtm, track } from '@/lib/tracking';

const defaultOffers = [
  { id: 'bundle', name: '10 Hajar+ AI Prompt Bundle + AI Course', price: 199, detail: 'Gemini image and video prompt categories plus recorded AI course with lifetime access.' },
  { id: 'chatgpt', name: '100,000 ChatGPT Prompts Bundle', price: 149, detail: 'Smart work prompt library for creators and hustlers.' },
  { id: 'course', name: 'AI and Machine Learning Course', price: 147, detail: 'Beginner-friendly recorded course with practical learning path.' }
];

export default function CheckoutPage() {
  const [selected, setSelected] = useState(() => new Set(defaultOffers.map((offer) => offer.id)));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => defaultOffers.filter((offer) => selected.has(offer.id)).reduce((sum, offer) => sum + offer.price, 0), [selected]);

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  async function startPayment() {
    const items = defaultOffers.filter((offer) => selected.has(offer.id));
    if (!items.length) {
      setMessage('Select at least one offer.');
      return;
    }

    setLoading(true);
    setMessage('');
    track('initiate_checkout', {
      value: 199,
      currency: 'INR',
      productName: 'CineForge AI Prompt Bundle',
      contentIds: items.map((item) => item.id),
      numItems: items.length
    });

    try {
      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Payment Page Customer',
          email: `customer-${Date.now()}@cineforge.ai`,
          phone: '0000000000',
          items,
          amount: total,
          utm: getStoredUtm()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Order creation failed');
      track('add_payment_info', {
        value: data.amount,
        currency: data.currency,
        eventId: data.eventId,
        orderCode: data.orderCode,
        productName: 'CineForge AI Prompt Bundle'
      });
      if (data.payment?.checkoutUrl) {
        window.location.href = data.payment.checkoutUrl;
        return;
      }
      setMessage(`Order ${data.orderCode} created. Add payment checkout URL/webhook before launch.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment could not start.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="premium-bg min-h-screen px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/12 bg-white/95 p-5 text-ink shadow-glow md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#1264ff]">Secure checkout</p>
        <h1 className="mt-2 text-4xl font-black">Confirm your bundle</h1>
        <p className="mt-3 text-slate-600">Select your offer. Name, email and phone will be collected on the payment page.</p>

        <div className="mt-6 space-y-4">
          {defaultOffers.map((offer) => (
            <label key={offer.id} className={`grid cursor-pointer grid-cols-[auto_1fr_auto] gap-4 rounded-2xl border-2 p-4 ${selected.has(offer.id) ? 'border-[#1264ff] bg-[#eef6ff]' : 'border-slate-200 bg-white'}`}>
              <input type="checkbox" checked={selected.has(offer.id)} onChange={() => toggle(offer.id)} className="mt-1 size-5 accent-[#1264ff]" />
              <span>
                <span className="inline-flex bg-yellow-300 px-3 py-1 text-lg font-black">Yes! I Want this!</span>
                <span className="mt-3 block font-black text-slate-950">LAST CHANCE ALERT:- <span className="text-red-600">{offer.name} For Rs.{offer.price}/- only</span></span>
                <span className="mt-2 block text-sm font-bold text-slate-700">LIMITED OFFER: {offer.detail}</span>
              </span>
              <span className="self-center text-2xl font-black text-[#1264ff]">Rs.{offer.price}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white/70">Grand Total</span>
            <span className="text-4xl font-black text-neon">Rs.{total}</span>
          </div>
          <button type="button" onClick={startPayment} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-neon px-6 py-4 font-black text-ink disabled:opacity-70">
            {loading ? 'Creating secure order...' : 'Pay Now'} <CheckCircle2 size={18} />
          </button>
          {message ? <p className="mt-3 text-sm font-bold text-neon">{message}</p> : null}
          <p className="mt-3 flex items-center gap-2 text-xs text-white/60"><ShieldCheck size={15} /> Success redirect: /thank-you?paid=1. Purchase fires only after payment verification.</p>
        </div>
      </section>
    </main>
  );
}
