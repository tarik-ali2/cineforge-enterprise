'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, ExternalLink, Megaphone, RefreshCcw, Save, ShieldCheck } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { DEFAULT_META_PIXEL_ID, TRACKING_DEBUG_KEY } from '@/lib/tracking';
import { AdminNav } from '@/components/AdminNav';

type Field = {
  group: string;
  key: string;
  label: string;
  defaultValue: string;
  help: string;
  section: 'payment' | 'tracking' | 'thank_you';
};

const fields: Field[] = [
  { section: 'payment', group: 'product', key: 'name', label: 'Product Name', defaultValue: 'CineForge AI Prompt Bundle', help: 'Checkout aur tracking me product name.', },
  { section: 'payment', group: 'product', key: 'price', label: 'Main Price', defaultValue: '199', help: 'Main product price Rs.199.', },
  { section: 'payment', group: 'product', key: 'offer_bump_1_price', label: 'Bump 1 Price', defaultValue: '149', help: '100,000 ChatGPT prompts bump price.', },
  { section: 'payment', group: 'product', key: 'offer_bump_2_price', label: 'Bump 2 Price', defaultValue: '147', help: 'AI/Machine Learning course bump price.', },
  { section: 'payment', group: 'payment', key: 'provider', label: 'Payment Provider', defaultValue: 'external', help: 'External payment page use karne ke liye external rakho.', },
  { section: 'payment', group: 'payment', key: 'checkout_url_199', label: 'Rs.199 Payment Link', defaultValue: '', help: 'Sirf main bundle selected ho to ye link open hoga.', },
  { section: 'payment', group: 'payment', key: 'checkout_url_348', label: 'Rs.348 Payment Link', defaultValue: '', help: 'Main bundle + Bump 1 selected ho to ye link open hoga.', },
  { section: 'payment', group: 'payment', key: 'checkout_url_495', label: 'Rs.495 Payment Link', defaultValue: '', help: 'Main bundle + dono bumps selected ho to ye link open hoga.', },
  { section: 'payment', group: 'payment', key: 'external_checkout_url', label: 'Fallback Payment Link', defaultValue: '', help: 'Agar amount ka exact link empty ho to fallback link use hoga.', },
  { section: 'payment', group: 'payment', key: 'success_redirect_url', label: 'Success Redirect URL', defaultValue: '/thank-you?paid=1', help: 'Payment success ke baad customer yahan return hona chahiye.', },
  { section: 'tracking', group: 'tracking', key: 'gtm_id', label: 'GTM Container ID', defaultValue: '', help: 'Example: GTM-XXXXXXX.', },
  { section: 'tracking', group: 'tracking', key: 'meta_pixel_id', label: 'Meta Pixel ID', defaultValue: DEFAULT_META_PIXEL_ID, help: 'Primary Meta Pixel ID.', },
  { section: 'tracking', group: 'tracking', key: 'additional_meta_pixel_ids', label: 'Extra Meta Pixel IDs', defaultValue: '', help: 'Optional comma separated pixel IDs.', },
  { section: 'tracking', group: 'tracking', key: 'meta_capi_access_token', label: 'Meta CAPI Token', defaultValue: '', help: 'Future server-side purchase tracking token.', },
  { section: 'tracking', group: 'tracking', key: 'ga4_measurement_id', label: 'GA4 Measurement ID', defaultValue: '', help: 'Example: G-XXXXXXX.', },
  { section: 'tracking', group: 'tracking', key: 'google_ads_conversion_id', label: 'Google Ads Conversion ID', defaultValue: '', help: 'Google ads remarketing/conversion ID.', },
  { section: 'tracking', group: 'tracking', key: 'google_ads_conversion_label', label: 'Google Ads Label', defaultValue: '', help: 'Google Ads conversion label.', },
  { section: 'tracking', group: 'tracking', key: 'microsoft_clarity_id', label: 'Microsoft Clarity ID', defaultValue: '', help: 'Optional Clarity tracking ID.', },
  { section: 'thank_you', group: 'thank_you', key: 'download_content', label: 'Thank You Download Text', defaultValue: 'Your verified download link will appear here.', help: 'Paid customer ko thank-you page par dikhne wala text.', }
];

const trackedEvents = ['PageView', 'ViewContent', 'InitiateCheckout', 'Purchase'];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.key, field.defaultValue])));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<Record<string, { status?: string; firedAt?: string; path?: string }>>({});

  const sections = useMemo(() => ({
    payment: fields.filter((field) => field.section === 'payment'),
    tracking: fields.filter((field) => field.section === 'tracking'),
    thank_you: fields.filter((field) => field.section === 'thank_you')
  }), []);

  async function load() {
    setMessage('');
    const response = await fetch(`${API_URL}/api/admin/settings`, { credentials: 'include' });
    if (response.status === 401 || response.status === 403) {
      setMessage('Session expired. Please admin login dobara karo.');
      return;
    }
    if (!response.ok) {
      setMessage('Settings load nahi hui. API/env check karo.');
      return;
    }
    const settings = await response.json();
    if (!Array.isArray(settings)) return;
    setValues((current) => ({
      ...current,
      ...Object.fromEntries(settings.map((setting) => [String(setting.key), String(setting.value ?? '')]))
    }));
  }

  useEffect(() => {
    load().catch(() => setMessage('Settings load nahi hui. API/env check karo.'));
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

  async function saveField(field: Field) {
    setLoading(true);
    setMessage(`${field.label} save ho raha hai...`);
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [{
            group: field.group,
            key: field.key,
            value: values[field.key] ?? ''
          }]
        })
      });
      if (response.status === 401 || response.status === 403) throw new Error('Session expired. Please admin login dobara karo.');
      if (!response.ok) throw new Error('Save failed. Login ya permissions check karo.');
      setMessage(`${field.label} saved.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setLoading(false);
    }
  }

  async function saveSection(section: Field['section']) {
    const list = fields.filter((field) => field.section === section);
    setLoading(true);
    setMessage('Saving...');
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: list.map((field) => ({
            group: field.group,
            key: field.key,
            value: values[field.key] ?? ''
          }))
        })
      });
      if (response.status === 401 || response.status === 403) throw new Error('Session expired. Please admin login dobara karo.');
      if (!response.ok) throw new Error('Save failed. Login ya permissions check karo.');
      setMessage(section === 'payment' ? 'Payment links aur bumps saved.' : section === 'tracking' ? 'Tracking settings saved.' : 'Thank-you content saved.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    } finally {
      setLoading(false);
    }
  }

  function fieldInput(field: Field) {
    return (
      <div key={field.key} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[220px_1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">{field.group}</p>
          <p className="font-black text-slate-950">{field.label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{field.help}</p>
        </div>
        <input
          value={values[field.key] ?? ''}
          onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => saveField(field)}
          disabled={loading}
          className="rounded-full bg-[#ffe34d] px-5 py-3 font-black text-slate-950 disabled:opacity-60"
        >
          Save
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f6fb] text-slate-950 md:pl-[250px]" style={{ colorScheme: 'light' }}>
      <AdminNav />
      <section className="mx-auto max-w-7xl px-5 py-8">
        <header className="rounded-3xl bg-gradient-to-br from-[#07111f] via-[#10223b] to-[#0f766e] p-6 text-white shadow-sm">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-cyan">
            <CreditCard size={18} /> Launch Settings
          </p>
          <h1 className="mt-2 text-4xl font-black">Payment Links, Bumps and Tracking</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/70">
            Yahan 3 payment page links paste karo. Checkout customer ke selected total ke hisab se correct link open karega.
          </p>
        </header>

        {message ? (
          <div className="sticky top-3 z-20 mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 shadow-sm">
            {message}
            {message.includes('Session expired') ? <a href="/admin/login" className="ml-3 underline">Login</a> : null}
          </div>
        ) : null}

        <section id="checkout" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Payment Page Links</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Aapke SuperProfile/payment pages ke 3 links yahan paste honge.</p>
            </div>
            <button onClick={() => saveSection('payment')} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 font-black text-white disabled:opacity-60">
              <Save size={17} /> Save All Payment Settings
            </button>
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-slate-700">
            <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} />Rs.199 link: only main bundle.</p>
            <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} />Rs.348 link: main bundle + first bump.</p>
            <p><CheckCircle2 className="mr-2 inline text-emerald-500" size={17} />Rs.495 link: main bundle + both bumps, default checkout total.</p>
          </div>

          <div className="mt-5 grid gap-4">
            {sections.payment.map(fieldInput)}
          </div>
        </section>

        <section id="tracking" className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="inline-flex items-center gap-2 text-2xl font-black"><Megaphone size={24} /> Pixel and Tracking</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Meta Pixel, GTM, GA4 aur remarketing settings.</p>
            </div>
            <button onClick={() => saveSection('tracking')} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 font-black text-white disabled:opacity-60">
              <Save size={17} /> Save Tracking
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            {sections.tracking.map(fieldInput)}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="inline-flex items-center gap-2 text-2xl font-black"><ShieldCheck size={24} /> Thank You Page</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Payment success ke baad content/download message.</p>
            </div>
            <button onClick={() => saveSection('thank_you')} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-5 py-3 font-black text-white disabled:opacity-60">
              <Save size={17} /> Save Thank You
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            {sections.thank_you.map(fieldInput)}
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Event Debug Panel</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Is browser ke latest tracking events yaha dikhte hain.</p>
            <div className="mt-5 grid gap-3">
              {trackedEvents.map((event) => {
                const status = debug[event];
                return (
                  <div key={event} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="font-black">{event}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{status?.firedAt ? `${status.firedAt} - ${status.path}` : 'Not fired in this browser yet'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${status?.status === 'fired' ? 'bg-emerald-100 text-emerald-700' : status?.status === 'skipped' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-500'}`}>
                      {status?.status ?? 'waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Quick Actions</h2>
            <div className="mt-4 grid gap-3">
              <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-black text-slate-700 hover:bg-slate-50">
                <RefreshCcw size={17} /> Reload Saved Settings
              </button>
              <a href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-black text-white">
                <ExternalLink size={17} /> Test Checkout
              </a>
              <a href="/thank-you?paid=1" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 py-3 font-black text-white">
                <ExternalLink size={17} /> Test Thank You Page
              </a>
            </div>
            <div className="mt-5 space-y-3 text-sm font-semibold leading-6 text-slate-600">
              <p>Meta Pixel ID: <strong>{values.meta_pixel_id || DEFAULT_META_PIXEL_ID}</strong></p>
              <p>Purchase event sirf `/thank-you?paid=1` par fire hota hai.</p>
              <p>Payment link me provider success redirect support karta ho to `/thank-you?paid=1` set karo.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
