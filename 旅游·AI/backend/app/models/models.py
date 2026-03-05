from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    trips: Mapped[list["Trip"]] = relationship(back_populates="user")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    destination: Mapped[str] = mapped_column(String(120), nullable=False)
    departure_city: Mapped[str] = mapped_column(String(120), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    travel_days: Mapped[int] = mapped_column(Integer, nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    travel_style: Mapped[str] = mapped_column(String(80), nullable=False)
    travelers: Mapped[int] = mapped_column(Integer, nullable=False)
    total_estimated_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="trips")
    days: Mapped[list["ItineraryDay"]] = relationship(back_populates="trip", cascade="all, delete")
    chat_messages: Mapped[list["ChatHistory"]] = relationship(
        back_populates="trip", cascade="all, delete"
    )


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str] = mapped_column(String(500), nullable=False)
    estimated_day_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    trip: Mapped["Trip"] = relationship(back_populates="days")
    attractions: Mapped[list["Attraction"]] = relationship(
        back_populates="itinerary_day", cascade="all, delete"
    )
    restaurants: Mapped[list["Restaurant"]] = relationship(
        back_populates="itinerary_day", cascade="all, delete"
    )


class Attraction(Base):
    __tablename__ = "attractions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    itinerary_day_id: Mapped[int] = mapped_column(ForeignKey("itinerary_days.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    map_link: Mapped[str] = mapped_column(String(500), nullable=False)
    distance_from_prev_km: Mapped[float] = mapped_column(Float, default=0)

    itinerary_day: Mapped["ItineraryDay"] = relationship(back_populates="attractions")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    itinerary_day_id: Mapped[int] = mapped_column(ForeignKey("itinerary_days.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    cuisine: Mapped[str] = mapped_column(String(80), default="local")
    price_level: Mapped[str] = mapped_column(String(20), default="$$")
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    map_link: Mapped[str] = mapped_column(String(500), nullable=False)

    itinerary_day: Mapped["ItineraryDay"] = relationship(back_populates="restaurants")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    trip: Mapped["Trip"] = relationship(back_populates="chat_messages")
