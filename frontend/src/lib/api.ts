const TOKEN_KEY = "nj_token";

export type ApiUser = {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  rating: number;
  totalDeliveries: number;
  totalPosted: number;
  totalEarned: number;
};

export type ApiCommunity = {
  id: string;
  name: string;
  code: string;
  gateLocation: string;
  memberCount: number;
};

export type ApiMembership = {
  id: string;
  room: string;
  community: ApiCommunity;
};

export type ApiRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone?: string;
  requesterRating?: number;
  requesterRuns?: number;
  requesterRoom?: string;
  runnerId?: string;
  runnerName?: string;
  communityId: string;
  foodApp: "swiggy" | "zomato" | "instamart" | "other";
  restaurantName: string;
  orderDetails?: string;
  pickupLocation: string;
  dropLocation: string;
  rewardAmount: number;
  status: string;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const authApi = {
  signup: (body: { name: string; phone: string; password: string }) =>
    api<{ token: string; user: ApiUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { phone: string; password: string }) =>
    api<{ token: string; user: ApiUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api<{ user: ApiUser; memberships: ApiMembership[] }>("/api/auth/me"),
};

export const communityApi = {
  list: () => api<{ memberships: ApiMembership[] }>("/api/communities"),
  create: (body: { name: string; code?: string; gateLocation?: string; room?: string }) =>
    api<{ community: ApiCommunity }>("/api/communities", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  join: (body: { code: string; room?: string }) =>
    api<{ membership: ApiMembership }>("/api/communities/join", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const requestApi = {
  list: (communityId: string, scope = "all") =>
    api<{ requests: ApiRequest[] }>(
      `/api/requests?communityId=${encodeURIComponent(communityId)}&scope=${scope}`
    ),
  create: (body: {
    communityId: string;
    foodApp: ApiRequest["foodApp"];
    restaurantName: string;
    orderDetails?: string;
    pickupLocation: string;
    dropLocation: string;
    rewardAmount: number;
  }) =>
    api<{ request: ApiRequest }>("/api/requests", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  act: (id: string, action: "accept" | "picked_up" | "deliver" | "cancel") =>
    api<{ request: ApiRequest }>(`/api/requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
};
