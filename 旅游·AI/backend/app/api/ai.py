from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Trip, User
from app.schemas.schemas import (
    AssistantContextRequest,
    AssistantContextResponse,
    BudgetEstimateRequest,
    BudgetEstimateResponse,
    ChatRequest,
    ChatResponse,
    GuideGenerateRequest,
    GuideGenerateResponse,
    InspirationRequest,
    InspirationResponse,
    ItineraryGenerateRequest,
    ItineraryGenerateResponse,
    RouteOptimizeRequest,
    RouteOptimizeResponse,
)
from app.services.ai_chat import process_chat_message
from app.services.ai_modules.assistant_engine import generate_assistant_alerts
from app.services.ai_modules.budget_estimator import calculate_budget
from app.services.ai_modules.guide_generator import generate_guides
from app.services.ai_modules.inspiration_engine import recommend_destinations
from app.services.ai_modules.route_optimizer import optimize_route
from app.services.planner import generate_itinerary

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/inspiration", response_model=InspirationResponse)
def inspiration(payload: InspirationRequest) -> InspirationResponse:
    return recommend_destinations(payload)


@router.post("/generate-itinerary", response_model=ItineraryGenerateResponse)
def generate(payload: ItineraryGenerateRequest) -> ItineraryGenerateResponse:
    return generate_itinerary(payload)


@router.post("/optimize-route", response_model=RouteOptimizeResponse)
def optimize_trip_route(payload: RouteOptimizeRequest) -> RouteOptimizeResponse:
    return optimize_route(payload)


@router.post("/calculate-budget", response_model=BudgetEstimateResponse)
def estimate_budget(payload: BudgetEstimateRequest) -> BudgetEstimateResponse:
    return calculate_budget(payload)


@router.post("/generate-guides", response_model=GuideGenerateResponse)
def generate_social_guides(payload: GuideGenerateRequest) -> GuideGenerateResponse:
    return generate_guides(payload)


@router.post("/assistant-context", response_model=AssistantContextResponse)
def assistant_context(payload: AssistantContextRequest) -> AssistantContextResponse:
    return generate_assistant_alerts(payload)


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ChatResponse:
    trip = db.query(Trip).filter(Trip.id == payload.trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    reply, suggested_changes = process_chat_message(db, trip, payload.message)
    return ChatResponse(reply=reply, suggested_changes=suggested_changes)
