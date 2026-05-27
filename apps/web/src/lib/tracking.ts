type TrackingPayload = Record<string, unknown>;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
const DEFAULT_META_PIXEL_ID = '1697719404699807';
const TRACKING_DEBUG_KEY = 'cf_tracking_debug';

const metaEventMap: Record<string, string> = {
  page_view: 'PageView',
  view_content: 'ViewContent',
  initiate_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase'
};

type TrackingSettings = {
  gtmId: string;
  metaPixelId: string;
  additionalMetaPixelIds: string[];
  ga4MeasurementId: string;
  googleAdsConversionId: string;
  googleAdsConversionLabel: string;
  microsoftClarityId: string;
};

let settingsPromise: Promise<TrackingSettings> | null = null;

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function recordEventStatus(eventName: string, status: 'fired' | 'skipped' = 'fired') {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(localStorage.getItem(TRACKING_DEBUG_KEY) ?? '{}') as Record<string, unknown>;
    current[eventName] = { status, firedAt: new Date().toISOString(), path: window.location.pathname };
    localStorage.setItem(TRACKING_DEBUG_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('cf_tracking_debug_updated'));
  } catch {
    // Debug state should never block tracking.
  }
}

async function getTrackingSettings(): Promise<TrackingSettings> {
  if (settingsPromise) return settingsPromise;
  settingsPromise = fetch(`${API_URL}/api/public/landing`, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : null)
    .then((data) => {
      const settings = data?.settings ?? {};
      return {
        gtmId: clean(settings.gtm_id),
        metaPixelId: clean(settings.meta_pixel_id) || DEFAULT_META_PIXEL_ID,
        additionalMetaPixelIds: clean(settings.additional_meta_pixel_ids)
          .split(',')
          .map((pixelId) => pixelId.trim())
          .filter(Boolean),
        ga4MeasurementId: clean(settings.ga4_measurement_id) || clean(settings.ga4_id),
        googleAdsConversionId: clean(settings.google_ads_conversion_id),
        googleAdsConversionLabel: clean(settings.google_ads_conversion_label),
        microsoftClarityId: clean(settings.microsoft_clarity_id)
      };
    })
    .catch(() => ({
      gtmId: '',
      metaPixelId: DEFAULT_META_PIXEL_ID,
      additionalMetaPixelIds: [],
      ga4MeasurementId: '',
      googleAdsConversionId: '',
      googleAdsConversionLabel: '',
      microsoftClarityId: ''
    }));
  return settingsPromise;
}

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

function injectScript(id: string, src: string, attrs: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

export async function initMarketing() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  getStoredUtm();

  const settings = await getTrackingSettings();

  if (settings.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    injectScript(`cf-gtm-${settings.gtmId}`, `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(settings.gtmId)}`, { 'data-gtm': settings.gtmId });
  }

  if (settings.metaPixelId && !window.fbq) {
    const fbq = function (...args: unknown[]) {
      window.fbq?.callMethod ? window.fbq.callMethod(...args) : window.fbq?.queue?.push(args);
    } as NonNullable<Window['fbq']>;
    window.fbq = fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    injectScript('cf-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
    [settings.metaPixelId, ...settings.additionalMetaPixelIds].forEach((pixelId) => {
      window.fbq?.('init', pixelId);
    });
    window.fbq('track', 'PageView');
    window.__cfPageViewSent = true;
    recordEventStatus('PageView');
  }

  if (settings.ga4MeasurementId) {
    injectScript(`cf-ga4-${settings.ga4MeasurementId}`, `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4MeasurementId)}`);
    window.dataLayer.push({ event: 'ga4_config', measurement_id: settings.ga4MeasurementId });
  }

  if (settings.microsoftClarityId && !document.getElementById('cf-clarity')) {
    const script = document.createElement('script');
    script.id = 'cf-clarity';
    script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${settings.microsoftClarityId.replace(/[^a-zA-Z0-9_-]/g, '')}");`;
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
  window.dataLayer.push({
    event,
    ...enriched,
    product_name: payload.productName,
    order_id: payload.orderCode
  });

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
    if (metaEvent === 'PageView' && window.__cfPageViewSent) {
      recordEventStatus(metaEvent);
    } else {
      if (eventId) window.fbq('track', metaEvent, metaPayload, { eventID: eventId });
      else window.fbq('track', metaEvent, metaPayload);
      if (metaEvent === 'PageView') window.__cfPageViewSent = true;
      recordEventStatus(metaEvent);
    }
  }

  if (metaEvent && !window.fbq) recordEventStatus(metaEvent, 'skipped');

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
    __cfPageViewSent?: boolean;
  }
}

export { DEFAULT_META_PIXEL_ID, TRACKING_DEBUG_KEY };
