import argparse
import importlib
import logging
from logging.config import dictConfig
from typing import Any

import uvicorn

# Load the settings module
from my_project.settings import Settings  # type: ignore


def get_app() -> Any:
    """Return the application object."""
    return importlib.import_module("reworkd_platform.web.application").get_app()


def main() -> None:
    """Entrypoint of the application."""
    # Set up command-line arguments
    parser = argparse.ArgumentParser(description="Run the application.")
    parser.add_argument("--host", default=Settings.host, help="The host to bind to.")
    parser.add_argument("--port", type=int, default=Settings.port, help="The port to bind to.")
    parser.add_argument("--workers", type=int, default=Settings.workers_count, help="The number of workers.")
    parser.add_argument("--reload", action="store_true", default=Settings.reload, help="Enable reload on change.")
    parser.add_argument("--log-level", default=Settings.log_level, help="The log level.")
    args = parser.parse_args()

    # Set up logging
    dictConfig({
        "version": 1,
        "formatters": {"default": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"}},
        "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "default", "level": args.log_level}},
        "root": {"handlers": ["console"], "level": args.log_level}
    })

    # Run the application
    uvicorn.run(
        get_app,
        host=args.host,
        port=args.port,
        workers=args.workers,
        reload=args.reload,
        log_level=args.log_level,
        factory=True,
    )


if __name__ == "__main__":
    main()
