const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Automatically attach auth token & active business ID
  const token = localStorage.getItem('smartstock_token');
  const businessId = localStorage.getItem('smartstock_biz_id') || 'biz_dhaka_grocery_01';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(businessId ? { 'x-business-id': businessId } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Transparent auto-renewal on 401 Unauthorized (unless this is already a login request or retry)
  if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login')) {
    try {
      const savedUser = localStorage.getItem('smartstock_user');
      const role = savedUser ? JSON.parse(savedUser).role || 'OWNER' : 'OWNER';
      const email =
        role === 'STAFF'
          ? 'staff@smartstock.local'
          : role === 'ACCOUNTANT'
          ? 'accountant@smartstock.local'
          : 'owner@smartstock.local';

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password: 'Password123!' }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem('smartstock_token', loginData.accessToken);
        localStorage.setItem('smartstock_biz_id', businessId);
        // Retry original request once with fresh token
        return apiRequest<T>(endpoint, options, true);
      }
    } catch {
      // Fall through to standard error handling
    }
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    const message =
      (errorData as { message?: string | string[] })?.message
        ? Array.isArray((errorData as { message: string | string[] }).message)
          ? ((errorData as { message: string[] }).message).join(', ')
          : (errorData as { message: string }).message
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, errorData);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
