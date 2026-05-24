'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';

const fields = [
  ['product', 'name', 'CineForge AI Prompt Bundle'],
  ['product', 'price', '199'],
  ['product', 'offer_bump_1_price', '149'],
  ['product', 'offer_bump_2_price', '147'],
  ['payment', 'provider', 'external'],
  ['payment', 'external_checkout_url', ''],
  ['payment', 'success_redirect_url', '/thank-you?paid=1'],
  ['tracking', 'meta_pixel_id', ''],
  ['tracking', 'gtm_id', ''],
  ['tracking', 'ga4_id', ''],
  ['thank_you', 'download_content', 'Your verified download link will appear here.']
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(([group, key, value]) => [`${group}.${key}`, value])));
  const [message, setMessage] = useState('');

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
    <main className="min-h-screen bg-[#070816] px-5 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Launch settings</p>
        <h1 className="mt-2 text-4xl font-black text-shine">Payment, Pixel and Product Controls</h1>
        <div className="mt-8 grid gap-4">
          {fields.map(([group, key]) => {
            const id = `${group}.${key}`;
            return (
              <div key={id} className="grid gap-3 rounded-2xl border border-white/12 bg-white/8 p-4 md:grid-cols-[180px_1fr_auto] md:items-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan">{group}</p>
                  <p className="font-bold">{key}</p>
                </div>
                <input value={values[id]} onChange={(event) => setValues({ ...values, [id]: event.target.value })} className="rounded-xl border border-white/12 bg-black/30 px-4 py-3 outline-none" />
                <button onClick={() => save(group, key)} className="rounded-full bg-neon px-5 py-3 font-black text-ink">Save</button>
              </div>
            );
          })}
        </div>
        {message ? <p className="mt-5 text-neon">{message}</p> : null}
      </section>
    </main>
  );
}
