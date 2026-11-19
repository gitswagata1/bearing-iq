from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
import time

from fastapi import Request
from routers import inspection, quotation, failure, maintenance, sourcing, dashboard, rul


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "=" * 60)
    print("  MICRO TURNER — AI Bearing Platform API")
    print("  Status: Running")
    print("  Docs:   http://localhost:8000/docs")
    print("=" * 60 + "\n")
    yield


app = FastAPI(
    title="Micro Turner AI Bearing Platform API",
    description="AI-powered bearing manufacturing platform — visual inspection, quotation, failure analysis, predictive maintenance, and sourcing intelligence.",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time-ms"] = f"{(time.perf_counter() - start) * 1000:.1f}"
    return response


app.include_router(dashboard.router)
app.include_router(inspection.router)
app.include_router(quotation.router)
app.include_router(failure.router)
app.include_router(maintenance.router)
app.include_router(sourcing.router)
app.include_router(rul.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "name": "Micro Turner AI Bearing Platform",
        "version": "1.1.0",
        "status": "healthy",
        "modules": [
            "inspection",
            "quotation",
            "failure-analysis",
            "predictive-maintenance",
            "sourcing-intelligence",
            "executive-dashboard",
        ],
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
