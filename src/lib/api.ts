const BASE_URL = (import.meta.env.VITE_PHOTO_API_URL ?? '').replace(/\/$/, '');

/** False when no backend URL was configured at build time. */
export const apiConfigured = BASE_URL !== '';

const TOKEN_KEY = 'memories.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** Fired when the server rejects the stored token (expired or logged out elsewhere). */
export const AUTH_EXPIRED_EVENT = 'memories:auth-expired';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type Body = FormData | Record<string, unknown> | unknown[];

export async function api<T>(path: string, { body, ...init }: Omit<RequestInit, 'body'> & { body?: Body } = {}) {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, { ...init, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection.');
  }

  if (res.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');
