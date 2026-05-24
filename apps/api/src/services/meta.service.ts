import crypto from 'node:crypto';
import { env } from '../config/env.js';

function hash(value?: string) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function sendMetaPurchaseEvent(input: {
  eventId: string;
  amount: number;
  currency: string;
  email?: string;
  phone?: string;
  pageUrl?: string;
  clientIp?: string;
  userAgent?: string;
}) {
  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    return { sent: false, reason: 'Meta Pixel ID or CAPI token not configured' };
  }

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: input.pageUrl ?? env.WEB_URL,
      user_data: {
        em: hash(input.email),
        ph: hash(input.phone),
        client_ip_address: input.clientIp,
        client_user_agent: input.userAgent
      },
      custom_data: {
        currency: input.currency,
        value: input.amount
      }
    }],
    test_event_code: env.META_TEST_EVENT_CODE || undefined
  };

  const response = await fetch(`https://graph.facebook.com/v20.0/${env.META_PIXEL_ID}/events?access_token=${env.META_CAPI_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta CAPI failed: ${errorText}`);
  }

  return { sent: true };
}
