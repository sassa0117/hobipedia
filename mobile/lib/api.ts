const API_BASE = __DEV__
  ? "http://10.0.2.2:3000" // Android emulator → localhost
  : "https://hobipedia.vercel.app";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API Error: ${res.status}`);
  }
  return res.json();
}

// Types
export interface ItemSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  character: string | null;
  maker: string | null;
  series: { name: string } | null;
  _count: { likes: number; collections: number; priceReports: number };
}

export interface ItemsResponse {
  items: ItemSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  image: string | null;
  _count: { followers: number; following: number; collections: number; createdItems: number };
}

export interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  actor: { name: string; username: string | null; image: string | null } | null;
  itemId: string | null;
}

// API functions
export function getItems(params?: { q?: string; category?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.category) sp.set("category", params.category);
  if (params?.page) sp.set("page", String(params.page));
  return apiFetch<ItemsResponse>(`/api/v1/items?${sp.toString()}`);
}

export function getItem(slug: string) {
  return apiFetch<Record<string, unknown>>(`/api/items/${slug}`);
}

export function getUser(username: string) {
  return apiFetch<UserProfile>(`/api/v1/users/${username}`);
}

export function getNotifications() {
  return apiFetch<{ notifications: Notification[]; unreadCount: number }>("/api/v1/notifications");
}
