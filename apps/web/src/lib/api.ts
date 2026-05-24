export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function apiGet<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
    });
    if (!response.ok) return fallback;
    return response.json();
  } catch {
    return fallback;
  }
}

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
    fetch(`${API_URL}/api/marketing/track`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      eventName: event,
      pageUrl: window.location.href,
      referrer: document.referrer,
      metadata: payload,
      sessionId: localStorage.getItem('cf_session') ?? crypto.randomUUID()
      })
    }).catch(() => undefined);
  }
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
