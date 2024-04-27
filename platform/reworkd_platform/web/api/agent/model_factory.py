from typing import Any, Dict, Optional, Tuple, Type, Union

from langchain.chat_models import AzureChatOpenAI, ChatOpenAI
from pydantic import Field

from reworkd_platform.schemas.agent import LLM_Model, ModelSettings
from reworkd_platform.schemas.user import UserBase
from reworkd_platform.settings import Settings

class WrappedChatOpenAI(ChatOpenAI):
    client: Any = Field(
        default=None,
        description="Meta private value but mypy will complain its missing",
    )
    max_tokens: int
    model_name: LLM_Model = Field(alias="model")
    model_kwargs: dict

class WrappedAzureChatOpenAI(AzureChatOpenAI, WrappedChatOpenAI):
    openai_api_base: str
    openai_api_version: str
    deployment_name: str

WrappedChat = Union[WrappedAzureChatOpenAI, WrappedChatOpenAI]

def create_model(
    settings: Settings,
    model_settings: ModelSettings,
    user: UserBase,
    streaming: bool = False,
    force_model: Optional[LLM_Model] = None,
) -> WrappedChat:
    use_azure = (
        not model_settings.custom_api_key and "azure" in settings.openai_api_base
    )

    llm_model = force_model or model_settings.model
    model: Type[WrappedChat]
    if use_azure:
        model = WrappedAzureChatOpenAI
        deployment_name = llm_model.replace(".", "")
        base = settings.openai_api_base.rstrip("v1")
        kwargs = {
            "openai_api_version": settings.openai_api_version,
            "deployment_name": deployment_name,
            "openai_api_type": "azure",
            "openai_api_base": base,
            "model": deployment_name,
            "max_tokens": model_settings.max_tokens,
            "temperature": model_settings.temperature,
            "streaming": streaming,
            "max_retries": 5,
            "model_kwargs": {
                "user": user.email,
                "headers": get_headers(settings, user, use_helicone=True),
            },
        }
    else:
        model = WrappedChatOpenAI
        kwargs = {
            "openai_api_base": settings.openai_api_base,
            "openai_api_key": model_settings.custom_api_key or settings.openai_api_key,
            "temperature": model_settings.temperature,
            "model": llm_model,
            "max_tokens": model_settings.max_tokens,
            "streaming": streaming,
            "max_retries": 5,
            "model_kwargs": {
                "user": user.email,
                "headers": get_headers(settings, user),
            },
        }

    return model(**kwargs)

def get_base_and_headers(
    settings_: Settings, model_settings: ModelSettings, user: UserBase
) -> Tuple[str, Optional[Dict[str, str]], bool]:
    use_helicone = settings_.helicone_enabled and not model_settings.custom_api_key
    base = (
        settings_.helicone_api_base
        if use_helicone
        else (
            "https://api.openai.com/v1"
            if model_settings.custom_api_key
            else settings_.openai_api_base
        )
    )

    headers = (
        {
            "Helicone-Auth": f"Bearer {settings_.helicone_api_key}",
            "Helicone-Cache-Enabled": "true",
            "Helicone-User-Id": user.id,
            "Helicone-OpenAI-Api-Base": settings_.openai_api_base,
        }
        if use_helicone
        else None
    )

    return base, headers

def get_headers(settings: Settings, user: UserBase, use_helicone: bool = False) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "User-Email": user.email,
    }
    if use_helicone:
        headers.update({
            "Helicone-Auth": f"Bearer {settings.helicone_api_key}",
            "Helicone-Cache-Enabled": "true",
            "Helicone-User-Id": user.id,
            "Helicone-OpenAI-Api-Base": settings.openai_api_base,
        })
    return headers
