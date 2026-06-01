const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const API_PREFIX = '/api';
const AUTH_REFRESH_PATH = '/api/auth/refresh';
const PUBLIC_AUTH_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/github/login',
]);

function getToken() {
  return localStorage.getItem('token') || '';
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken') || '';
}

function resolveApiUrl(url) {
  if (!BASE_URL || /^https?:\/\//i.test(url)) {
    return url;
  }
  return url.startsWith(API_PREFIX) ? `${BASE_URL}${url}` : url;
}

function getUrlPath(url) {
  try {
    const base = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    return new URL(url, base).pathname;
  } catch (_err) {
    return url;
  }
}

function isApiRequest(input) {
  const url = typeof input === 'string' ? input : input?.url;
  return typeof url === 'string' && getUrlPath(url).startsWith(API_PREFIX);
}

function makeApiInit(input, init = {}, token = getToken()) {
  const headers = new Headers(input instanceof Request ? input.headers : init.headers);
  const path = getUrlPath(typeof input === 'string' ? input : input?.url || '');

  if (token && !PUBLIC_AUTH_PATHS.has(path) && path !== AUTH_REFRESH_PATH) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return { ...init, headers };
}

async function refreshAccessToken(nativeFetch) {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return '';

  const response = await nativeFetch(resolveApiUrl(AUTH_REFRESH_PATH), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return '';
  }

  const json = await response.json();
  const payload = json.data || json;
  if (!payload.accessToken) return '';

  localStorage.setItem('token', payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem('refreshToken', payload.refreshToken);
  }

  return payload.accessToken;
}

export function installApiFetchInterceptor() {
  if (typeof window === 'undefined' || window.__apiFetchInterceptorInstalled) {
    return;
  }

  const nativeFetch = window.fetch.bind(window);
  window.__apiFetchInterceptorInstalled = true;

  window.fetch = async (input, init = {}) => {
    if (!isApiRequest(input)) {
      return nativeFetch(input, init);
    }

    const requestUrl = typeof input === 'string' ? input : input.url;
    const resolvedUrl = resolveApiUrl(requestUrl);
    const requestInit = makeApiInit(input, init);
    const path = getUrlPath(requestUrl);
    let response = await nativeFetch(resolvedUrl, requestInit);

    if (
      response.status !== 401 ||
      path === AUTH_REFRESH_PATH ||
      PUBLIC_AUTH_PATHS.has(path)
    ) {
      return response;
    }

    const nextToken = await refreshAccessToken(nativeFetch);
    if (!nextToken) {
      return response;
    }

    response = await nativeFetch(resolvedUrl, makeApiInit(input, init, nextToken));
    return response;
  };
}

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(resolveApiUrl(url), { ...options, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }

  return json.data !== undefined ? json.data : json;
}

export function apiGet(url) {
  return apiFetch(url);
}

export function apiPost(url, body) {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPut(url, body) {
  return apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function apiDelete(url) {
  return apiFetch(url, { method: 'DELETE' });
}

export function apiUpload(url, formData) {
  return apiFetch(url, {
    method: 'POST',
    body: formData,
  });
}
