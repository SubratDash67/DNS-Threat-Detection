from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import time
import os
import logging
from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import (
    auth,
    scan,
    history,
    analytics,
    safelist,
    models,
    users,
    admin,
)
from app.services.detector_service import get_detector_service

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up DNS Threat Detection API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    await init_db()
    logger.info("Database initialized successfully")

    detector = get_detector_service()
    logger.info("Detector service loaded successfully")

    yield

    logger.info("Shutting down DNS Threat Detection API...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade API for DNS threat detection with ML-powered analysis",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Validation error"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=settings.DEBUG)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred",
        },
    )


app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(safelist.router)
app.include_router(models.router)
app.include_router(users.router)
app.include_router(admin.router)

# Mount static files for avatars
static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
@app.head("/")  # Add HEAD method support for Render health checks
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
@app.head("/health")  # Add HEAD method support for health checks
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}


@app.get("/api/info")
async def api_info():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "endpoints": {
            "auth": "/api/auth",
            "scan": "/api/scan",
            "history": "/api/history",
            "analytics": "/api/analytics",
            "safelist": "/api/safelist",
            "models": "/api/models",
            "users": "/api/users",
            "admin": "/api/admin",
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=settings.DEBUG)
