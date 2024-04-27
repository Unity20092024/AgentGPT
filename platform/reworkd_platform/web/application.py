from importlib import metadata
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import UJSONResponse
from reworkd_platform.logging import configure_logging
from reworkd_platform.settings import settings
from reworkd_platform.web.api.error_handling import platformatic_exception_handler
from reworkd_platform.web.api.errors import PlatformaticError
from reworkd_platform.web.api.router import api_router
from reworkd_platform.web.lifetime import register_shutdown_event, register_startup_event


def get_app() -> FastAPI:
    """Get FastAPI application."""
    configure_logging()

    app = FastAPI(
        title="Reworkd Platform API",
        version=metadata.version("reworkd_platform"),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        default_response_class=UJSONResponse,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_origin_regex=settings.allowed_origins_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_startup_event(app)
    register_shutdown_event(app)

    app.include_router(api_router, prefix="/api")

    app.exception_handler(PlatformaticError)(platformatic_exception_handler)

    return app
