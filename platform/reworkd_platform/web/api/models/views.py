from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from reworkd_platform.schemas.agent import LLM_MODEL_MAX_TOKENS
from reworkd_platform.schemas.user import UserBase
from reworkd_platform.web.api.dependencies import get_current_active_user

router = APIRouter()


class ModelWithAccess(BaseModel):
    name: str
    max_tokens: int
    has_access: bool = False

    @classmethod
    def from_model(cls, name: str, max_tokens: int, user: UserBase) -> "ModelWithAccess":
        has_access = user is not None
        return cls(name=name, max_tokens=max_tokens, has_access=has_access)


@router.get("", response_model=List[ModelWithAccess])
async def get_models(
    user: UserBase = Depends(get_current_active_user),
) -> List[ModelWithAccess]:
    return [
        ModelWithAccess.from_model(name=model, max_tokens=tokens, user=user)
        for model, tokens in LLM_MODEL_MAX_TOKENS.items()
    ]
