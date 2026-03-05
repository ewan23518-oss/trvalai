const ENV_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PROD_FALLBACK_API = "https://ai-travel-planner-api.onrender.com";

function getApiBaseUrl(): string {
  if (ENV_API_BASE_URL) return ENV_API_BASE_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8000";
  }
  return PROD_FALLBACK_API;
}

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

async function fetchJson(path: string, init: RequestInit, fallback: string) {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, init);
    return parseOrThrow(res, fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) {
      throw err;
    }
    throw new Error(`无法连接后端服务：${base}。请检查 NEXT_PUBLIC_API_BASE_URL 或后端是否在线。`);
  }
}

export async function register(body: { email: string; password: string; full_name: string }) {
  return fetchJson(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "注册失败",
  );
}

export async function login(body: { email: string; password: string }) {
  return fetchJson(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "登录失败",
  );
}

export async function createTrip(token: string, body: TripPayload) {
  return fetchJson(
    "/trip/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
    "创建行程失败",
  );
}

export async function getTrip(token: string, tripId: number) {
  return fetchJson(
    `/trip/${tripId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
    "读取行程失败",
  );
}

export async function chatWithAI(token: string, payload: { trip_id: number; message: string }) {
  return fetchJson(
    "/ai/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    "聊天调用失败",
  );
}

export async function getRecommendations(destination: string) {
  const qs = new URLSearchParams({ destination }).toString();
  return fetchJson(`/recommendations?${qs}`, { cache: "no-store" }, "推荐加载失败");
}

export async function getInspiration(payload: InspirationPayload) {
  return fetchJson(
    "/ai/inspiration",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "灵感推荐失败",
  );
}

export async function optimizeRoute(payload: RouteOptimizePayload) {
  return fetchJson(
    "/ai/optimize-route",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "路线优化失败",
  );
}

export async function calculateBudget(payload: BudgetPayload) {
  return fetchJson(
    "/ai/calculate-budget",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "预算计算失败",
  );
}

export async function generateGuides(payload: GuidePayload) {
  return fetchJson(
    "/ai/generate-guides",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "攻略生成失败",
  );
}

export async function getAssistantContext(payload: AssistantContextPayload) {
  return fetchJson(
    "/ai/assistant-context",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "旅行助手提醒生成失败",
  );
}

export async function createCommunityPost(payload: CommunityPostPayload) {
  return fetchJson(
    "/community/posts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "发布攻略失败",
  );
}

export async function getCommunityPosts() {
  return fetchJson("/community/posts", { cache: "no-store" }, "获取社区内容失败");
}

export async function likeCommunityPost(postId: number) {
  return fetchJson(`/community/posts/${postId}/like`, { method: "POST" }, "点赞失败");
}

export async function favoriteCommunityPost(postId: number) {
  return fetchJson(`/community/posts/${postId}/favorite`, { method: "POST" }, "收藏失败");
}

export async function copyCommunityRoute(postId: number) {
  return fetchJson(`/community/posts/${postId}/copy-route`, { method: "POST" }, "复制路线失败");
}

export async function commentCommunityPost(postId: number, comment: string) {
  return fetchJson(
    `/community/posts/${postId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    },
    "评论失败",
  );
}
