'use client';

import { useEffect } from 'react';

export default function AdminIndexPage() {
  useEffect(() => {
    window.location.replace('/admin/dashboard');
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/8 p-6 text-center">
        <p className="text-lg font-black text-neon">Opening CineForge Admin...</p>
        <a href="/admin/dashboard" className="mt-4 inline-flex rounded-full bg-neon px-5 py-3 font-black text-ink">
          Go to dashboard
        </a>
      </div>
    </main>
  );
}
