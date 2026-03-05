from fastapi import APIRouter, Query

from app.schemas.schemas import RecommendationOut
from app.services.recommendations import get_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut])
def recommendations(
    destination: str = Query(..., min_length=2),
    category: str = Query("all", pattern="^(all|attraction|restaurant)$"),
) -> list[RecommendationOut]:
    return get_recommendations(destination=destination, category=category)
