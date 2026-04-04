const API_BASE = process.env.BACKEND_URL || 'http://localhost:8080/api';

export async function serverFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null as T;
  const json = await res.json();
  return json.data;
}
