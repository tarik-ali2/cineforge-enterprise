'use client';

import { useState } from 'react';
import { API_URL } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@cineforge.ai');
  const [password, setPassword] = useState('Happy0808');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setMessage(response.ok ? 'Login success. Open dashboard.' : 'Login failed. Check API and credentials.');
    if (response.ok) window.location.href = '/admin/dashboard';
  }

  return (
    <main className="premium-bg min-h-screen">
      <AdminNav />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/12 bg-white/10 p-7 shadow-glow">
        <h1 className="text-3xl font-black text-shine">CineForge Admin</h1>
        <p className="mt-2 text-sm text-white/65">Login to manage landing page, checkout, tracking and content.</p>
        <label className="mt-6 block text-sm font-bold text-white/70">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 outline-none" />
        <label className="mt-4 block text-sm font-bold text-white/70">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/12 bg-black/30 px-4 py-3 outline-none" />
        <button className="mt-6 w-full rounded-full bg-neon px-6 py-3 font-black text-ink">Login</button>
        {message ? <p className="mt-4 text-sm text-cyan">{message}</p> : null}
      </form>
      </section>
    </main>
  );
}
