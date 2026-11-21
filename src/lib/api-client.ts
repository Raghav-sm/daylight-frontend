'use client';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

const WRITE_METHODS: HttpMethod[] = ['POST', 'PATCH', 'PUT', 'DELETE'];

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const isLocalBrowser =
    typeof window !== 'undefined'
    && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (process.env.NODE_ENV === 'production' && !isLocalBrowser) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured for production.');
  }

  return 'http://localhost:8000';
}

function buildHeaders(method: HttpMethod, path: string, hasBody: boolean): Headers {
  const headers = new Headers();

  if (hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  const isAuthEntry = path.startsWith('/auth/login') || path.startsWith('/auth/register');
  if (WRITE_METHODS.includes(method) && !isAuthEntry) {
    if (!csrfToken) {
      throw new ApiError('Session not ready. Please refresh and try again.', 403);
    }
    headers.set('X-CSRF-Token', csrfToken);
  }

  return headers;
}

function getErrorMessage(body: { detail?: unknown } | null): string {
  const detail = body?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'object' && item !== null && 'msg' in item ? item.msg : String(item)))
      .join(', ');
  }

  return 'The request could not be completed.';
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const hasBody = options.body !== undefined;
  const headers = buildHeaders(method, path, hasBody);

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/') && typeof window !== 'undefined') {
      setCsrfToken(null);
      window.dispatchEvent(new Event('daylight:unauthorized'));
    }

    throw new ApiError(getErrorMessage(body), response.status);
  }

  return body as T;
}
