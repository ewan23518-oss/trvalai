from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    created_at: datetime


class AttractionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    latitude: float
    longitude: float
    map_link: str
    distance_from_prev_km: float


class RestaurantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cuisine: str
    price_level: str
    latitude: float
    longitude: float
    map_link: str


class ItineraryDayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day_number: int
    summary: str
    estimated_day_cost: float
    attractions: list[AttractionOut]
    restaurants: list[RestaurantOut]


class TripCreateRequest(BaseModel):
    destination: str
    departure_city: str
    start_date: date
    end_date: date
    travel_days: int = Field(ge=1, le=30)
    budget: float = Field(gt=0)
    travel_style: str
    travelers: int = Field(ge=1)


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    destination: str
    departure_city: str
    start_date: date
    end_date: date
    travel_days: int
    budget: float
    travel_style: str
    travelers: int
    total_estimated_cost: float
    created_at: datetime
    days: list[ItineraryDayOut]


class ActivityItem(BaseModel):
    name: str
    description: str
    category: str
    location: str
    time: str
    transport: str
    cost: float


class DayPlan(BaseModel):
    day: int
    summary: str
    estimated_cost: float
    activities: list[ActivityItem]


class ItineraryGenerateRequest(BaseModel):
    destination: str
    departure_city: str
    start_date: date
    end_date: date
    travel_days: int
    budget: float
    travel_style: str
    travelers: int


class ItineraryGenerateResponse(BaseModel):
    days: list[DayPlan]
    total_estimated_cost: float


class ChatRequest(BaseModel):
    trip_id: int
    message: str


class ChatResponse(BaseModel):
    reply: str
    suggested_changes: list[str]


class RecommendationOut(BaseModel):
    name: str
    type: str
    description: str
    latitude: float
    longitude: float
    map_link: str


class RoutePointIn(BaseModel):
    name: str
    latitude: float
    longitude: float


class RouteOptimizeRequest(BaseModel):
    destination: str
    day: int = Field(ge=1)
    start_point: RoutePointIn | None = None
    attractions: list[RoutePointIn]
    objective: str = Field(default="shortest_path", pattern="^(shortest_path|least_time|least_transfer)$")
    transport_mode: str = Field(default="walk", pattern="^(walk|subway|taxi)$")


class RouteOptimizeActivityOut(BaseModel):
    name: str
    latitude: float
    longitude: float
    distance_from_previous_km: float
    estimated_travel_minutes: int


class RouteOptimizeResponse(BaseModel):
    day: int
    optimized_route: list[RouteOptimizeActivityOut]
    total_distance_km: float
    estimated_total_minutes: int
    strategy: str


class BudgetEstimateRequest(BaseModel):
    destination: str
    departure_city: str
    travel_days: int = Field(ge=1, le=30)
    travelers: int = Field(ge=1)
    travel_style: str
    total_budget: float | None = Field(default=None, gt=0)


class BudgetItem(BaseModel):
    category: str
    amount: float
    note: str


class BudgetEstimateResponse(BaseModel):
    destination: str
    travel_days: int
    travelers: int
    travel_style: str
    breakdown: list[BudgetItem]
    estimated_total: float
    estimated_daily_budget: float
    budget_gap: float | None
    suggestion: str
    saving_tips: list[str] = Field(default_factory=list)


class InspirationRequest(BaseModel):
    budget: float = Field(gt=0)
    travel_days: int = Field(ge=1, le=30)
    preferences: list[str] = Field(default_factory=list)
    top_k: int = Field(default=3, ge=1, le=10)


class InspirationDestination(BaseModel):
    destination: str
    match_score: float
    tags: list[str]
    estimated_budget: float
    reason: str


class InspirationResponse(BaseModel):
    recommendations: list[InspirationDestination]
    strategy: str


class GuideGenerateRequest(BaseModel):
    destination: str
    departure_city: str
    travel_days: int = Field(ge=1, le=30)
    travel_style: str
    budget_per_person: float = Field(gt=0)
    highlights: list[str] = Field(default_factory=list)


class GuideGenerateResponse(BaseModel):
    destination: str
    title: str
    xiaohongshu_post: str
    moments_post: str
    route_summary: str
    photo_suggestions: list[str]
    pdf_markdown: str
    pdf_file_name: str
    pdf_download_url: str
    video_route_script: str


class AssistantContextRequest(BaseModel):
    destination: str
    travel_date: date
    transport_mode: str = Field(default="subway", pattern="^(walk|subway|taxi)$")
    has_restaurant_booking: bool = False


class AssistantAlert(BaseModel):
    category: str
    title: str
    detail: str
    severity: str


class AssistantContextResponse(BaseModel):
    destination: str
    alerts: list[AssistantAlert]


class CommunityPostCreateRequest(BaseModel):
    user_name: str
    title: str
    content: str
    route_summary: str


class CommunityPostOut(BaseModel):
    id: int
    user_name: str
    title: str
    content: str
    route_summary: str
    likes: int
    favorites: int
    comments: list[str]


class CommunityCommentRequest(BaseModel):
    comment: str = Field(min_length=1, max_length=500)
