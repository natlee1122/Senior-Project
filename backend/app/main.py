from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, events, quests, recommendations, rewards, users
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title="Lifescape API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(quests.router, prefix="/api")
app.include_router(rewards.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
