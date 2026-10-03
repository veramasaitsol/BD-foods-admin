export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number; unreadCount?: number };
  errors?: unknown;
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<ApiEnvelope<T>> {
  const { auth = true, headers, body, ...rest } = options;
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string> | undefined) };

  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders, body });
  const json = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (response.status === 401 && auth) {
    // Token was rejected by the server (expired/revoked/DB reset) — a stale
    // client-side session would otherwise keep retrying every protected
    // request forever. Clear it and bounce to login.
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  if (!response.ok || !json || json.success === false) {
    throw new Error(json?.message || `Request failed with status ${response.status}`);
  }

  return json;
}

function toBody(data: unknown): BodyInit | undefined {
  if (data === undefined) return undefined;
  return data instanceof FormData ? data : JSON.stringify(data);
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: 'POST', body: toBody(data) }),
  put: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: toBody(data) }),
  patch: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body: toBody(data) }),
  delete: <T>(path: string, options?: ApiOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};
