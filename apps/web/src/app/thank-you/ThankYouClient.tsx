'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { track } from '@/lib/tracking';

export function ThankYouClient() {
  const searchParams = useSearchParams();
  const paid = searchParams.get('paid') === '1';
  const orderCode = searchParams.get('order') ?? '';
  const eventId = searchParams.get('event_id') ?? '';
  const [status, setStatus] = useState<'checking' | 'verified' | 'pending' | 'missing'>('checking');

  useEffect(() => {
    async function verify() {
      if (!paid || !orderCode) {
        setStatus('missing');
        return;
      }
      const response = await fetch(`${API_URL}/api/order-status/${orderCode}`);
      if (!response.ok) {
        setStatus('pending');
        return;
      }
      const order = await response.json();
      if (order.verified) {
        track('purchase', {
          value: order.amount,
          currency: order.currency ?? 'INR',
          eventId: order.eventId ?? eventId,
          orderCode,
          productName: 'CineForge AI Prompt Bundle'
        });
        setStatus('verified');
      } else {
        setStatus('pending');
      }
    }
    verify();
  }, [eventId, orderCode, paid]);

  return (
    <section className="max-w-xl rounded-3xl border border-white/12 bg-white/10 p-8 text-center shadow-glow">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan">Payment status</p>
      <h1 className="mt-3 text-4xl font-black text-shine">
        {status === 'verified' ? 'Payment verified' : 'Thank you for your order'}
      </h1>
      <p className="mt-4 text-white/70">
        {status === 'verified'
          ? 'Your purchase is verified. Download/email delivery can now be shown here.'
          : 'We are checking payment verification. Purchase tracking will fire only after confirmed success.'}
      </p>
      <a href="/" className="mt-6 inline-flex rounded-full bg-neon px-6 py-3 font-black text-ink">Back to Home</a>
    </section>
  );
}
