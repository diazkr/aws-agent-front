/**
 * API utilities with automatic authentication token injection
 */
import { getToken, updateToken } from './keycloak';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Enhanced fetch with automatic token management
 */
export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { requireAuth = false, headers = {}, ...restOptions } = options;

  // Update token if needed (refresh if expires in less than 30 seconds)
  try {
    await updateToken(30);
  } catch (error) {
    console.warn('Could not update token', error);
  }

  // Get current token
  const token = getToken();

  // Build headers
  const fetchHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if token exists
  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error('Authentication required but no token available');
  }

  // Make request
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers: fetchHeaders,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    console.error('Unauthorized request - token may be expired');
    // You could trigger a logout or token refresh here
  }

  return response;
}

/**
 * GET request with authentication
 */
export async function apiGet<T = any>(
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

  return response.json();
}

/**
 * POST request with authentication
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
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

  return response.json();
}

/**
 * PUT request with authentication
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
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

  return response.json();
}

/**
 * DELETE request with authentication
 */
export async function apiDelete<T = any>(
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

  return response.json();
}
