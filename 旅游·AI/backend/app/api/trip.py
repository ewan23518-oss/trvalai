from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Attraction, ItineraryDay, Restaurant, Trip, User
from app.schemas.schemas import ItineraryGenerateRequest, TripCreateRequest, TripOut
from app.services.planner import generate_itinerary, map_link, point_for

router = APIRouter(prefix="/trip", tags=["trip"])


@router.post("/create", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripOut:
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid date range")

    itinerary = generate_itinerary(
        ItineraryGenerateRequest(
            destination=payload.destination,
            departure_city=payload.departure_city,
            start_date=payload.start_date,
            end_date=payload.end_date,
            travel_days=payload.travel_days,
            budget=payload.budget,
            travel_style=payload.travel_style,
            travelers=payload.travelers,
        )
    )

    trip = Trip(
        user_id=current_user.id,
        destination=payload.destination,
        departure_city=payload.departure_city,
        start_date=payload.start_date,
        end_date=payload.end_date,
        travel_days=payload.travel_days,
        budget=payload.budget,
        travel_style=payload.travel_style,
        travelers=payload.travelers,
        total_estimated_cost=itinerary.total_estimated_cost,
    )
    db.add(trip)
    db.flush()

    for day in itinerary.days:
        day_row = ItineraryDay(
            trip_id=trip.id,
            day_number=day.day,
            summary=day.summary,
            estimated_day_cost=day.estimated_cost,
        )
        db.add(day_row)
        db.flush()

        attraction_idx = 0
        restaurant_idx = 0
        previous_lat = None
        previous_lng = None
        for activity in day.activities:
            lat, lng = point_for(payload.destination, day.day * 10 + attraction_idx + restaurant_idx)
            distance = 0.0
            if previous_lat is not None and previous_lng is not None:
                distance = round(abs(lat - previous_lat) * 90 + abs(lng - previous_lng) * 70, 2)

            if activity.category == "restaurant":
                db.add(
                    Restaurant(
                        itinerary_day_id=day_row.id,
                        name=activity.name,
                        cuisine=payload.travel_style,
                        price_level="$$",
                        latitude=lat,
                        longitude=lng,
                        map_link=map_link(lat, lng),
                    )
                )
                restaurant_idx += 1
            else:
                db.add(
                    Attraction(
                        itinerary_day_id=day_row.id,
                        name=activity.name,
                        description=activity.description,
                        latitude=lat,
                        longitude=lng,
                        map_link=map_link(lat, lng),
                        distance_from_prev_km=distance,
                    )
                )
                attraction_idx += 1

            previous_lat = lat
            previous_lng = lng

    db.commit()

    saved_trip = (
        db.query(Trip)
        .options(
            joinedload(Trip.days).joinedload(ItineraryDay.attractions),
            joinedload(Trip.days).joinedload(ItineraryDay.restaurants),
        )
        .filter(Trip.id == trip.id, Trip.user_id == current_user.id)
        .first()
    )
    assert saved_trip is not None
    return saved_trip


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TripOut:
    trip = (
        db.query(Trip)
        .options(
            joinedload(Trip.days).joinedload(ItineraryDay.attractions),
            joinedload(Trip.days).joinedload(ItineraryDay.restaurants),
        )
        .filter(Trip.id == trip_id, Trip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip
