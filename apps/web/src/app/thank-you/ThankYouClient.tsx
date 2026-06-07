'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Download, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { initMarketing } from '@/lib/tracking';

const DEFAULT_PRODUCT = 'cineforge-bundle';
const WHATSAPP_SUPPORT_URL = 'https://wa.me/?text=Hi%20CineForge%20Team%2C%20I%20completed%20my%20payment%20and%20need%20product%20access.';

function normalizeAmount(value: string | null) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 199;
}

function readableProduct(product: string) {
  return product
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function ThankYouClient() {
  const searchParams = useSearchParams();
  const amount = normalizeAmount(searchParams.get('amount'));
  const product = searchParams.get('product') || DEFAULT_PRODUCT;
  const productName = useMemo(() => readableProduct(product), [product]);

  useEffect(() => {
    async function firePurchaseOnce() {
      await initMarketing();

      const purchaseKey = `cineforge_purchase_tracked_${amount}_${product}`;
      if (
        typeof window.fbq === 'function' &&
        !localStorage.getItem(purchaseKey)
      ) {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: 'INR',
          content_name: product
        });

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          value: amount,
          currency: 'INR',
          product_name: product
        });

        localStorage.setItem(purchaseKey, 'true');
      }
    }

    firePurchaseOnce();
  }, [amount, product]);

  return (
    <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/14 bg-white/[0.075] p-5 text-white shadow-[0_30px_120px_rgba(14,165,233,0.20)] backdrop-blur-2xl md:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
      <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/15 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div>
          <div className="success-checkmark mx-auto flex size-24 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-400/15 text-emerald-200 shadow-[0_0_70px_rgba(52,211,153,0.35)] lg:mx-0">
            <Check size={48} strokeWidth={3.2} />
          </div>

          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan">
            <Sparkles size={16} /> CineForge access confirmed
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-shine md:text-6xl">
            Payment Successful 🎉
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/74 md:text-lg">
            Aapka CineForge digital product access ready hai. Details payment email aur access page par confirm ho jayengi.
          </p>

          <div id="product-access" className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/46">Amount Paid</p>
              <p className="mt-2 text-3xl font-black text-neon">Rs.{amount}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/46">Product</p>
              <p className="mt-2 text-xl font-black text-white">{productName}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#product-access"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neon px-6 py-4 font-black text-ink shadow-glow transition hover:-translate-y-0.5 hover:shadow-[0_0_70px_rgba(250,204,21,0.30)]"
            >
              <Download size={18} /> Access Your Product <ArrowRight size={18} />
            </a>
            <a
              href={WHATSAPP_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/10 px-6 py-4 font-black text-white transition hover:border-cyan hover:bg-cyan/10"
            >
              <MessageCircle size={18} /> Join WhatsApp Support
            </a>
          </div>
        </div>

        <div className="relative rounded-[1.6rem] border border-white/14 bg-[#07111f]/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-emerald-100">
              <ShieldCheck size={18} /> Purchase tracked securely
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/64">
              Meta Purchase event isi page par once-only fire hota hai. Refresh karne par duplicate Purchase fire nahi hoga.
            </p>
          </div>

          <div className="mt-5 grid gap-3 text-sm font-semibold text-white/70">
            {[
              'Payment confirmation email check karo.',
              'Product access/payment provider page par available rahega.',
              'Issue aaye to WhatsApp support button use karo.'
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan/15 text-cyan">
                  <Check size={14} />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
