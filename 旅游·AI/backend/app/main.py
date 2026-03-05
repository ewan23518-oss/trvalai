from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import ai, auth, community, recommendations, trip
from app.db.session import engine
from app.models.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Travel Planner API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

exports_dir = Path("exports")
exports_dir.mkdir(parents=True, exist_ok=True)
app.mount("/exports", StaticFiles(directory=str(exports_dir)), name="exports")

app.include_router(auth.router)
app.include_router(trip.router)
app.include_router(ai.router)
app.include_router(recommendations.router)
app.include_router(community.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
