const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(method)
    && !path.startsWith('/auth/login')
    && !path.startsWith('/auth/register')
    && csrfToken
  ) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers,
    cache: 'no-store',
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/') && typeof window !== 'undefined') {
      setCsrfToken(null);
      window.dispatchEvent(new Event('daylight:unauthorized'));
    }
    const detail = body?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => typeof item === 'object' && item !== null && 'msg' in item ? item.msg : String(item)).join(', ')
        : 'The request could not be completed.';
    throw new ApiError(message, response.status);
  }

  return body as T;
}
