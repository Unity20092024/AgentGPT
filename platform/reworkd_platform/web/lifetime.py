from typing import Awaitable, Callable

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import async_sessionmaker, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData
import reworkd_platform.db.models
import reworkd_platform.db.meta
import reworkd_platform.db.utils
import reworkd_platform.services.tokenizer.lifetime

app = FastAPI()

async def create_tables():
    engine = create_engine("sqlite+aiosqlite:///./test.db")
    metadata = MetaData()
    metadata.reflect(bind=engine)
    if not metadata.tables:
        reworkd_platform.db.models.Base.metadata.create_all(engine)
    await engine.dispose()

def setup_db(app: FastAPI) -> None:
    engine = create_engine("sqlite+aiosqlite:///./test.db")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    app.state.db_engine = engine
    app.state.db_session_factory = SessionLocal

async def init_app() -> None:
    await create_tables()
    setup_db(app)
    reworkd_platform.services.tokenizer.lifetime.init_tokenizer(app)

@app.on_event("startup")
async def startup_event() -> None:
    await init_app()

@app.on_event("shutdown")
async def shutdown_event() -> None:
    app.state.db_engine.dispose()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
