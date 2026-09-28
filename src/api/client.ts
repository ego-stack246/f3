const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('fitsync_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Basic unauth handling (in a real app, attempt refresh token first)
    localStorage.removeItem('fitsync_token');
    localStorage.removeItem('fitsynch_user');
    window.location.href = '/login';
  }

  if (!response.ok) {
    let errorDetail = 'API Error';
    try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorData.error?.message || errorDetail;
    } catch(e) {}
    throw new Error(errorDetail);
  }

  // Some endpoints (like 204 No Content) don't return JSON
  if (response.status === 204) return null;
  
  return response.json();
}
