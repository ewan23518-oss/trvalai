from dataclasses import dataclass
from random import Random

from app.schemas.schemas import ActivityItem, DayPlan, ItineraryGenerateRequest, ItineraryGenerateResponse
from app.services.llm.gemini_client import generate_json_with_gemini


@dataclass
class LocationSeed:
    lat: float
    lng: float


BASE_LOCATION = {
    "tokyo": LocationSeed(35.6762, 139.6503),
    "paris": LocationSeed(48.8566, 2.3522),
    "london": LocationSeed(51.5072, -0.1276),
    "new york": LocationSeed(40.7128, -74.0060),
    "singapore": LocationSeed(1.3521, 103.8198),
    "东京": LocationSeed(35.6762, 139.6503),
    "巴黎": LocationSeed(48.8566, 2.3522),
    "伦敦": LocationSeed(51.5072, -0.1276),
    "纽约": LocationSeed(40.7128, -74.0060),
    "新加坡": LocationSeed(1.3521, 103.8198),
}


def map_link(lat: float, lng: float) -> str:
    return f"https://maps.google.com/?q={lat},{lng}"


def point_for(destination: str, index: int) -> tuple[float, float]:
    seed = BASE_LOCATION.get(destination.lower(), BASE_LOCATION.get(destination, LocationSeed(35.0, 135.0)))
    r = Random(f"{destination}-{index}")
    lat = round(seed.lat + r.uniform(-0.08, 0.08), 6)
    lng = round(seed.lng + r.uniform(-0.08, 0.08), 6)
    return lat, lng


def style_activities(style: str) -> list[str]:
    style_map = {
        "luxury": ["银座", "米其林餐厅", "东京塔夜景"],
        "backpacking": ["浅草寺", "上野公园", "街头美食"],
        "food": ["筑地市场", "拉面街", "居酒屋"],
        "family": ["上野动物园", "科学馆", "亲子餐厅"],
        "adventure": ["高尾山", "涉谷", "夜间探索"],
    }
    return style_map.get(style.lower(), ["城市中心", "文化地标", "本地晚餐"])


def style_label(style: str) -> str:
    label = {
        "luxury": "奢华",
        "backpacking": "背包",
        "food": "美食",
        "family": "亲子",
        "adventure": "冒险",
    }
    return label.get(style.lower(), style)


def _generate_with_gemini(req: ItineraryGenerateRequest) -> ItineraryGenerateResponse | None:
    prompt = f"""
你是旅行规划 AI。请严格只返回 JSON，结构：
{{
  "days": [
    {{
      "day": 1,
      "summary": "...",
      "estimated_cost": 1000,
      "activities": [
        {{
          "name": "浅草寺",
          "description": "...",
          "category": "attraction",
          "location": "东京浅草",
          "time": "09:00-11:00",
          "transport": "subway",
          "cost": 120
        }}
      ]
    }}
  ],
  "total_estimated_cost": 5000
}}

输入：
目的地={req.destination}
出发地={req.departure_city}
天数={req.travel_days}
预算={req.budget}
风格={req.travel_style}
人数={req.travelers}
""".strip()

    raw = generate_json_with_gemini(prompt)
    if not raw:
        return None

    try:
        return ItineraryGenerateResponse.model_validate(raw)
    except Exception:
        return None


def _generate_fallback(req: ItineraryGenerateRequest) -> ItineraryGenerateResponse:
    anchors = style_activities(req.travel_style)
    style_name = style_label(req.travel_style)
    daily_budget = round(req.budget / req.travel_days, 2)
    activity_cost = round(daily_budget / 4, 2)
    days: list[DayPlan] = []

    for i in range(1, req.travel_days + 1):
        activities = [
            ActivityItem(
                name=f"游览{anchors[0]}",
                description=f"上午抵达{anchors[0]}，打卡核心地标",
                category="attraction",
                location=anchors[0],
                time="09:00-11:30",
                transport="subway",
                cost=activity_cost,
            ),
            ActivityItem(
                name=f"{anchors[1]}附近午餐",
                description="选择口碑餐厅，适配当前预算",
                category="restaurant",
                location=anchors[1],
                time="12:00-13:30",
                transport="walk",
                cost=activity_cost,
            ),
            ActivityItem(
                name=f"下午前往{anchors[1]}",
                description="安排街区漫游和自由探索",
                category="attraction",
                location=anchors[1],
                time="14:00-17:00",
                transport="subway",
                cost=activity_cost,
            ),
            ActivityItem(
                name=f"晚间体验{anchors[2]}",
                description="夜间路线与餐饮结合",
                category="restaurant",
                location=anchors[2],
                time="18:30-21:00",
                transport="taxi",
                cost=activity_cost,
            ),
        ]
        days.append(
            DayPlan(
                day=i,
                summary=f"第{i}天：{req.destination}{style_name}路线",
                estimated_cost=daily_budget,
                activities=activities,
            )
        )

    return ItineraryGenerateResponse(days=days, total_estimated_cost=round(daily_budget * req.travel_days, 2))


def generate_itinerary(req: ItineraryGenerateRequest) -> ItineraryGenerateResponse:
    llm = _generate_with_gemini(req)
    if llm:
        return llm
    return _generate_fallback(req)
