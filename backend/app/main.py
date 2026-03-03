from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.websocket import router as ws_router
from app.config import get_settings

app = FastAPI(
    title="Multi-Agent Problem Solver",
    description="AI-powered organizational document analysis with multi-agent pipeline",
    version="1.0.0",
)

_origins = [o.strip() for o in get_settings().CORS_ORIGINS.split(",") if o.strip()]
# Fallback: if no origins configured, allow production frontend (avoids CORS block when env missing)
if not _origins:
    _origins = ["https://demo-agent-solution.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(ws_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
