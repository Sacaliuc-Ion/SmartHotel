const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5130/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data?.message || 'A network error occurred');
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('smarthotel_token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Dispatch a custom event to handled unauthenticated state gracefully.
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignored if non-json
    }
    throw new ApiError(response.status, errorData);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    dispatchNotificationsRefresh(endpoint, options.method);
    return {} as T;
  }

  const payload = JSON.parse(text);
  dispatchNotificationsRefresh(endpoint, options.method);
  return payload;
}

function dispatchNotificationsRefresh(endpoint: string, method?: string) {
  const normalizedMethod = (method || 'GET').toUpperCase();
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') {
    return;
  }

  if (endpoint.startsWith('/auth/notifications')) {
    return;
  }

  if (!localStorage.getItem('smarthotel_token')) {
    return;
  }

  window.dispatchEvent(new CustomEvent('notifications:refresh'));
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) => request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data?: any) => request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(endpoint: string, data?: any) => request<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
