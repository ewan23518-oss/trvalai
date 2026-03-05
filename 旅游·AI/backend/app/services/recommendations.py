from random import Random

from app.schemas.schemas import RecommendationOut
from app.services.planner import map_link, point_for


def get_recommendations(destination: str, category: str = "all") -> list[RecommendationOut]:
    options = [
        ("老城步行线", "attraction", "沿街历史建筑和在地文化体验"),
        ("中央市集", "attraction", "热门本地市场，适合轻食和伴手礼"),
        ("河景小馆", "restaurant", "城市景观与本地菜结合"),
        ("夜市美食街", "restaurant", "夜间小吃与平价餐饮集中地"),
    ]
    if category != "all":
        options = [o for o in options if o[1] == category]

    out: list[RecommendationOut] = []
    r = Random(destination)
    for idx, (name, item_type, description) in enumerate(options):
        lat, lng = point_for(destination, idx + 100)
        out.append(
            RecommendationOut(
                name=name,
                type=item_type,
                description=description,
                latitude=lat + r.uniform(-0.01, 0.01),
                longitude=lng + r.uniform(-0.01, 0.01),
                map_link=map_link(lat, lng),
            )
        )
    return out

