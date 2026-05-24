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

export { getStoredUtm, initMarketing, track } from './tracking';
