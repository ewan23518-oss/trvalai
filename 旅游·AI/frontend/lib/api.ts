const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type TripPayload = {
  destination: string;
  departure_city: string;
  start_date: string;
  end_date: string;
  travel_days: number;
  budget: number;
  travel_style: string;
  travelers: number;
};

export type RoutePoint = {
  name: string;
  latitude: number;
  longitude: number;
};

export type RouteOptimizePayload = {
  destination: string;
  day: number;
  start_point?: RoutePoint;
  attractions: RoutePoint[];
  objective?: "shortest_path" | "least_time" | "least_transfer";
  transport_mode?: "walk" | "subway" | "taxi";
};

export type BudgetPayload = {
  destination: string;
  departure_city: string;
  travel_days: number;
  travelers: number;
  travel_style: string;
  total_budget?: number;
};

export type GuidePayload = {
  destination: string;
  departure_city: string;
  travel_days: number;
  travel_style: string;
  budget_per_person: number;
  highlights: string[];
};

export type InspirationPayload = {
  budget: number;
  travel_days: number;
  preferences: string[];
  top_k?: number;
};

export type AssistantContextPayload = {
  destination: string;
  travel_date: string;
  transport_mode?: "walk" | "subway" | "taxi";
  has_restaurant_booking?: boolean;
};

export type CommunityPostPayload = {
  user_name: string;
  title: string;
  content: string;
  route_summary: string;
};

async function parseOrThrow(res: Response, fallback: string) {
  if (!res.ok) {
    let detail = fallback;
    try {
      const data = await res.json();
      detail = data?.detail || fallback;
    } catch {
      // no-op
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function register(body: { email: string; password: string; full_name: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, "注册失败");
}

export async function login(body: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, "登录失败");
}

export async function createTrip(token: string, body: TripPayload) {
  const res = await fetch(`${API_BASE_URL}/trip/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return parseOrThrow(res, "创建行程失败");
}

export async function getTrip(token: string, tripId: number) {
  const res = await fetch(`${API_BASE_URL}/trip/${tripId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parseOrThrow(res, "读取行程失败");
}

export async function chatWithAI(token: string, payload: { trip_id: number; message: string }) {
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "聊天调用失败");
}

export async function getRecommendations(destination: string) {
  const qs = new URLSearchParams({ destination }).toString();
  const res = await fetch(`${API_BASE_URL}/recommendations?${qs}`, { cache: "no-store" });
  return parseOrThrow(res, "推荐加载失败");
}

export async function getInspiration(payload: InspirationPayload) {
  const res = await fetch(`${API_BASE_URL}/ai/inspiration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "灵感推荐失败");
}

export async function optimizeRoute(payload: RouteOptimizePayload) {
  const res = await fetch(`${API_BASE_URL}/ai/optimize-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "路线优化失败");
}

export async function calculateBudget(payload: BudgetPayload) {
  const res = await fetch(`${API_BASE_URL}/ai/calculate-budget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "预算计算失败");
}

export async function generateGuides(payload: GuidePayload) {
  const res = await fetch(`${API_BASE_URL}/ai/generate-guides`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "攻略生成失败");
}

export async function getAssistantContext(payload: AssistantContextPayload) {
  const res = await fetch(`${API_BASE_URL}/ai/assistant-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "旅行助手提醒生成失败");
}

export async function createCommunityPost(payload: CommunityPostPayload) {
  const res = await fetch(`${API_BASE_URL}/community/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow(res, "发布攻略失败");
}

export async function getCommunityPosts() {
  const res = await fetch(`${API_BASE_URL}/community/posts`, { cache: "no-store" });
  return parseOrThrow(res, "获取社区内容失败");
}

export async function likeCommunityPost(postId: number) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/like`, { method: "POST" });
  return parseOrThrow(res, "点赞失败");
}

export async function favoriteCommunityPost(postId: number) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/favorite`, { method: "POST" });
  return parseOrThrow(res, "收藏失败");
}

export async function copyCommunityRoute(postId: number) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/copy-route`, { method: "POST" });
  return parseOrThrow(res, "复制路线失败");
}

export async function commentCommunityPost(postId: number, comment: string) {
  const res = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  return parseOrThrow(res, "评论失败");
}
