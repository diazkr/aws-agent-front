import { getToken, updateToken } from './keycloak';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not configured');
}

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = false, headers = {}, ...restOptions } = options;

  try {
    await updateToken(30);
  } catch {
    // Token update failed, continue with existing token
  }

  const token = getToken();

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Authentication required but no token available');
  }

  if (!API_BASE_URL && !endpoint.startsWith('http')) {
    throw new Error('API base URL is not configured');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: fetchHeaders,
  });

  if (response.status === 401) {
    throw new Error('Unauthorized - token may be expired');
  }

  return response;
}

export async function apiGet<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T = unknown, D = unknown>(
  endpoint: string,
  data?: D,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPut<T = unknown, D = unknown>(
  endpoint: string,
  data?: D,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    ...options,
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
