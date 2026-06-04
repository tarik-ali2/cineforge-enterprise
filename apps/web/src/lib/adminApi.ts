import { API_URL } from './api';

const ACCESS_TOKEN_KEY = 'cf_admin_access_token';

export function setAdminAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

function getAdminAccessToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) return '';
  const data = await response.json();
  if (data?.accessToken) setAdminAccessToken(String(data.accessToken));
  return String(data?.accessToken ?? '');
}

async function getFreshTokenIfNeeded() {
  const token = getAdminAccessToken();
  if (token) return token;
  return refreshAccessToken();
}

export async function adminFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const token = await getFreshTokenIfNeeded();
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers
  });

  if (response.status === 401 && retry) {
    const nextToken = await refreshAccessToken();
    if (nextToken) return adminFetch(path, init, false);
    clearAdminAccessToken();
  }

  return response;
}
