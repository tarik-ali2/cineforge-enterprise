'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { DEFAULT_META_PIXEL_ID, TRACKING_DEBUG_KEY } from '@/lib/tracking';
import { AdminNav } from '@/components/AdminNav';

const fields = [
  ['product', 'name', 'CineForge AI Prompt Bundle', 'Product name shown in checkout/tracking.'],
  ['product', 'price', '199', 'Main product price in INR.'],
  ['product', 'offer_bump_1_price', '149', 'First order bump price.'],
  ['product', 'offer_bump_2_price', '147', 'Second order bump price.'],
  ['payment', 'provider', 'external', 'external, manual_upi, razorpay, instamojo or stripe.'],
  ['payment', 'external_checkout_url', '', 'Payment link with success redirect support.'],
  ['payment', 'success_redirect_url', '/thank-you?paid=1', 'Successful payment must return here.'],
  ['tracking', 'gtm_id', '', 'Google Tag Manager container ID, for example GTM-XXXXXXX.'],
  ['tracking', 'meta_pixel_id', DEFAULT_META_PIXEL_ID, 'Default Meta Pixel for direct browser tracking.'],
  ['tracking', 'meta_capi_access_token', '', 'Future server-side Meta Conversions API token.'],
  ['tracking', 'ga4_measurement_id', '', 'GA4 Measurement ID, for example G-XXXXXXX.'],
  ['tracking', 'google_ads_conversion_id', '', 'Google Ads conversion ID.'],
  ['tracking', 'google_ads_conversion_label', '', 'Google Ads conversion label.'],
  ['tracking', 'microsoft_clarity_id', '', 'Microsoft Clarity project ID.'],
  ['thank_you', 'download_content', 'Your verified download link will appear here.', 'Content shown after verified purchase.']
];

const trackedEvents = ['PageView', 'ViewContent', 'InitiateCheckout', 'Purchase'];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(([group, key, value]) => [`${group}.${key}`, value])));
  const [message, setMessage] = useState('');
  const [debug, setDebug] = useState<Record<string, { status?: string; firedAt?: string; path?: string }>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/admin/settings`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : [])
      .then((settings) => {
        if (!Array.isArray(settings)) return;
        setValues((current) => ({
          ...current,
          ...Object.fromEntries(settings.map((setting) => [`${setting.group}.${setting.key}`, String(setting.value ?? '')]))
        }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const readDebug = () => {
      try {
        setDebug(JSON.parse(localStorage.getItem(TRACKING_DEBUG_KEY) ?? '{}'));
      } catch {
        setDebug({});
      }
    };
    readDebug();
    window.addEventListener('cf_tracking_debug_updated', readDebug);
    return () => window.removeEventListener('cf_tracking_debug_updated', readDebug);
  }, []);

  async function save(group: string, key: string) {
    const response = await fetch(`${API_URL}/api/admin/settings/${group}/${key}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: values[`${group}.${key}`] })
    });
    setMessage(response.ok ? 'Saved' : 'Save failed. Login again or check permissions.');
  }

  return (
    <main className="min-h-screen bg-[#070816] text-white">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Launch settings</p>
        <h1 className="mt-2 text-4xl font-black text-shine">Payment, Pixel and Product Controls</h1>
        <div className="mt-6 rounded-2xl border border-cyan/20 bg-cyan/10 p-5">
          <p className="font-black text-cyan">Tracking architecture</p>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Frontend direct Meta Pixel, GTM, GA4, Purchase Tracking and Meta CAPI-ready settings are managed here. Purchase fires only on verified `/thank-you` success flow.
          </p>
        </div>
        <div className="mt-8 grid gap-4">
          {fields.map(([group, key, , help]) => {
            const id = `${group}.${key}`;
            return (
              <div key={id} className="grid gap-3 rounded-2xl border border-white/12 bg-white/8 p-4 md:grid-cols-[180px_1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{group}</p>
                  <p className="font-bold">{key}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{help}</p>
                </div>
                <input value={values[id]} onChange={(event) => setValues({ ...values, [id]: event.target.value })} className="rounded-xl border border-white/12 bg-black/30 px-4 py-3 outline-none" />
                <button onClick={() => save(group, key)} className="rounded-full bg-neon px-5 py-3 font-black text-ink">Save</button>
              </div>
            );
          })}
        </div>
        {message ? <p className="mt-5 text-neon">{message}</p> : null}
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <section className="rounded-2xl border border-white/12 bg-white/8 p-5">
            <h2 className="text-2xl font-black">Event Debug Panel</h2>
            <p className="mt-2 text-sm text-white/60">This browser ke latest tracking events yaha dikhte hain.</p>
            <div className="mt-5 grid gap-3">
              {trackedEvents.map((event) => {
                const status = debug[event];
                return (
                  <div key={event} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/24 p-4">
                    <div>
                      <p className="font-black">{event}</p>
                      <p className="mt-1 text-xs text-white/45">{status?.firedAt ? `${status.firedAt} - ${status.path}` : 'Not fired in this browser yet'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${status?.status === 'fired' ? 'bg-neon text-ink' : status?.status === 'skipped' ? 'bg-yellow-400 text-ink' : 'bg-white/10 text-white/55'}`}>
                      {status?.status ?? 'waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-white/12 bg-white/8 p-5">
            <h2 className="text-2xl font-black">Meta Pixel Helper Test</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/68">
              <p>1. Chrome me Meta Pixel Helper extension install karo.</p>
              <p>2. Landing page open karke Pixel ID `{values['tracking.meta_pixel_id'] || DEFAULT_META_PIXEL_ID}` check karo.</p>
              <p>3. Buy button click par `InitiateCheckout` verify karo.</p>
              <p>4. Successful payment ke baad `/thank-you?paid=1` par hi `Purchase` event verify karo.</p>
              <p>5. Meta Events Manager ke Test Events tab me same flow check karo.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
