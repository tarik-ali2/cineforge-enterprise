type TrackingPayload = Record<string, unknown>;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const metaEventMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  initiate_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase'
};

export function getStoredUtm() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  const current: Record<string, string> = {};
  keys.forEach((key) => {
    const value = params.get(key);
    if (value) current[key] = value;
  });
  if (Object.keys(current).length) {
    localStorage.setItem('cf_utm', JSON.stringify(current));
    sessionStorage.setItem('cf_utm', JSON.stringify(current));
    return current;
  }
  try {
    return JSON.parse(localStorage.getItem('cf_utm') ?? '{}');
  } catch {
    return {};
  }
}

export function initMarketing() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  getStoredUtm();

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (pixelId && !window.fbq) {
    const fbq = function (...args: unknown[]) {
      window.fbq?.callMethod ? window.fbq.callMethod(...args) : window.fbq?.queue?.push(args);
    } as NonNullable<Window['fbq']>;
    window.fbq = fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    window.fbq('init', pixelId);
  }

  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (gtmId && !document.querySelector(`script[data-gtm="${gtmId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.dataset.gtm = gtmId;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);
  }
}

export function getSessionId() {
  if (typeof window === 'undefined') return '';
  const id = localStorage.getItem('cf_session') ?? crypto.randomUUID();
  localStorage.setItem('cf_session', id);
  return id;
}

export function track(event: string, payload: TrackingPayload = {}) {
  if (typeof window === 'undefined') return;
  const utm = getStoredUtm();
  const sessionId = getSessionId();
  const enriched = { ...payload, utm, sessionId };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...enriched });

  const metaEvent = metaEventMap[event];
  if (metaEvent && window.fbq) {
    const eventId = typeof payload.eventId === 'string' ? payload.eventId : undefined;
    const metaPayload = {
      value: payload.value,
      currency: payload.currency ?? 'INR',
      content_name: payload.productName,
      content_ids: payload.contentIds,
      num_items: payload.numItems
    };
    if (eventId) window.fbq('track', metaEvent, metaPayload, { eventID: eventId });
    else window.fbq('track', metaEvent, metaPayload);
  }

  fetch(`${API_URL}/api/marketing/track`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: event,
      pageUrl: window.location.href,
      referrer: document.referrer,
      metadata: enriched,
      sessionId
    })
  }).catch(() => undefined);
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
    };
  }
}
