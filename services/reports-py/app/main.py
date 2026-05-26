from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import reports, analytics, export

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="MUFASAL Reports",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "reports"}
