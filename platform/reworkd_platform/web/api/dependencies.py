from datetime import datetime
from typing import Annotated

from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.exc import NoResultFound

from reworkd_platform.db.crud.user import UserCrud
from reworkd_platform.db.dependencies import get_db_session
from reworkd_platform.schemas.user import UserBase
from reworkd_platform.web.api.http_responses import forbidden

