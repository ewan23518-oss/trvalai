from math import sqrt

from app.schemas.schemas import InspirationDestination, InspirationRequest, InspirationResponse
from app.services.llm.gemini_client import generate_json_with_gemini

# MVP in-memory destination vectors (tag embeddings proxy)
DESTINATIONS = [
    {"name": "Bali", "tags": ["island", "beach", "relax", "couple"], "daily_budget": 180},
    {"name": "Okinawa", "tags": ["island", "beach", "family", "japan"], "daily_budget": 210},
    {"name": "Phuket", "tags": ["island", "beach", "food", "nightlife"], "daily_budget": 160},
    {"name": "Tokyo", "tags": ["city", "anime", "food", "shopping"], "daily_budget": 240},
    {"name": "Singapore", "tags": ["city", "family", "food", "clean"], "daily_budget": 260},
]


def _vectorize(tags: list[str], universe: list[str]) -> list[float]:
    tag_set = {t.lower() for t in tags}
    return [1.0 if t in tag_set else 0.0 for t in universe]


def _cosine(v1: list[float], v2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = sqrt(sum(a * a for a in v1))
    norm2 = sqrt(sum(b * b for b in v2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def _recommend_with_gemini(payload: InspirationRequest) -> InspirationResponse | None:
    prompt = f"""
你是旅行灵感推荐引擎。请只返回 JSON：
{{
  "recommendations": [
    {{"destination":"Bali","match_score":0.92,"tags":["island","beach"],"estimated_budget":4200,"reason":"..."}}
  ],
  "strategy": "embedding推荐 + 向量搜索 + 标签匹配"
}}

输入：
预算={payload.budget}
天数={payload.travel_days}
偏好={payload.preferences}
返回 {payload.top_k} 个结果。
""".strip()

    raw = generate_json_with_gemini(prompt)
    if not raw:
        return None

    try:
        return InspirationResponse.model_validate(raw)
    except Exception:
        return None


def _recommend_with_vector(payload: InspirationRequest) -> InspirationResponse:
    prefs = [p.lower() for p in payload.preferences]
    universe = sorted({tag for d in DESTINATIONS for tag in d["tags"]} | set(prefs))
    pref_vector = _vectorize(prefs, universe)

    scored: list[InspirationDestination] = []
    for d in DESTINATIONS:
        estimated_budget = round(d["daily_budget"] * payload.travel_days, 2)
        budget_score = max(0.0, 1 - abs(estimated_budget - payload.budget) / max(payload.budget, 1))
        semantic = _cosine(pref_vector, _vectorize(d["tags"], universe))
        score = round(0.7 * semantic + 0.3 * budget_score, 4)
        scored.append(
            InspirationDestination(
                destination=d["name"],
                match_score=score,
                tags=d["tags"],
                estimated_budget=estimated_budget,
                reason="Embedding相似度 + 标签匹配 + 预算贴合度",
            )
        )

    ranked = sorted(scored, key=lambda x: x.match_score, reverse=True)[: payload.top_k]
    return InspirationResponse(
        recommendations=ranked,
        strategy="embedding推荐 + 向量搜索 + 标签匹配",
    )


def recommend_destinations(payload: InspirationRequest) -> InspirationResponse:
    llm_result = _recommend_with_gemini(payload)
    if llm_result:
        return llm_result
    return _recommend_with_vector(payload)
