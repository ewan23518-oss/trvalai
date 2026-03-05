from math import asin, cos, radians, sin, sqrt

from app.schemas.schemas import (
    RouteOptimizeActivityOut,
    RouteOptimizeRequest,
    RouteOptimizeResponse,
    RoutePointIn,
)

SPEED_KMPH = {
    "walk": 4.5,
    "subway": 30.0,
    "taxi": 24.0,
}

OBJECTIVE_TEXT = {
    "shortest_path": "最短路径优先",
    "least_time": "最少时间优先",
    "least_transfer": "最少换乘优先（偏向连续线路）",
}


def haversine_km(p1: RoutePointIn, p2: RoutePointIn) -> float:
    r = 6371.0
    dlat = radians(p2.latitude - p1.latitude)
    dlng = radians(p2.longitude - p1.longitude)
    a = sin(dlat / 2) ** 2 + cos(radians(p1.latitude)) * cos(radians(p2.latitude)) * sin(dlng / 2) ** 2
    return 2 * r * asin(sqrt(a))


def _travel_minutes(distance_km: float, transport_mode: str) -> int:
    speed = SPEED_KMPH.get(transport_mode, 4.5)
    base = max(1, distance_km / speed * 60)
    if transport_mode == "subway":
        return int(base + 6)
    if transport_mode == "taxi":
        return int(base + 4)
    return int(base)


def optimize_route(payload: RouteOptimizeRequest) -> RouteOptimizeResponse:
    points = payload.attractions[:]
    if not points:
        return RouteOptimizeResponse(
            day=payload.day,
            optimized_route=[],
            total_distance_km=0,
            estimated_total_minutes=0,
            strategy="无景点输入，无法优化",
        )

    current = payload.start_point or points.pop(0)
    ordered: list[RouteOptimizeActivityOut] = []
    total_distance = 0.0
    total_minutes = 0

    while points:
        next_point = min(points, key=lambda p: haversine_km(current, p))
        distance = round(haversine_km(current, next_point), 2)
        minutes = _travel_minutes(distance, payload.transport_mode)

        total_distance += distance
        total_minutes += minutes
        ordered.append(
            RouteOptimizeActivityOut(
                name=next_point.name,
                latitude=next_point.latitude,
                longitude=next_point.longitude,
                distance_from_previous_km=distance,
                estimated_travel_minutes=minutes,
            )
        )
        current = next_point
        points.remove(next_point)

    if payload.start_point is None and ordered:
        ordered[0].distance_from_previous_km = 0
        ordered[0].estimated_travel_minutes = 0

    strategy = (
        f"{OBJECTIVE_TEXT.get(payload.objective, '最短路径优先')} + "
        f"交通方式：{payload.transport_mode}，使用近邻TSP启发式"
    )

    return RouteOptimizeResponse(
        day=payload.day,
        optimized_route=ordered,
        total_distance_km=round(total_distance, 2),
        estimated_total_minutes=total_minutes,
        strategy=strategy,
    )
