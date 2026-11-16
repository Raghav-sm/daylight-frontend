const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (!response.ok) {
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
