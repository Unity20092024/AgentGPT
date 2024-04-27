import json
import typing as t
from datetime import datetime, timedelta

import aiohttp
from fastapi import FastAPI, HTTPException
from loguru import logger
from pydantic import BaseModel

from reworkd_platform.db.crud.oauth import OAuthCrud
from reworkd_platform.db.models.auth import OauthCredentials
from reworkd_platform.settings import settings
from reworkd_platform.services.security import encryption_service
from reworkd_platform.web.api.agent.stream_mock import stream_string
from reworkd_platform.web.api.agent.tools.tool import Tool
from reworkd_platform.web.api.agent.tools.utils import Snippet, summarize_sid

app = FastAPI()

class SIDOAuth:
    @staticmethod
    async def get_access_token(
        oauth_crud: OAuthCrud, installation: OauthCredentials
    ) -> t.Optional[str]:
        if not installation.refresh_token_enc:
            return None
        if datetime.now() + timedelta(minutes=5) > installation.access_token_expiration:
            refresh_token = encryption_service.decrypt(installation.refresh_token_enc)
            data = {
                "grant_type": "refresh_token",
                "client_id": settings.sid_client_id,
                "client_secret": settings.sid_client_secret,
                "redirect_uri": settings.sid_redirect_uri,
                "refresh_token": refresh_token,
            }
            async with aiohttp.ClientSession() as session:
                async with session.post("https://auth.sid.ai/oauth/token", data=data) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=response.status, detail="Failed to exchange tokens")
                    response_data = await response.json()
                    access_token = response_data["access_token"]
                    expires_in = response_data["expires_in"]
            installation.access_token_enc = encryption_service.encrypt(access_token)
            installation.access_token_expiration = datetime.now() + timedelta(seconds=expires_in)
            await installation.save(oauth_crud.session)

        return encryption_service.decrypt(installation.access_token_enc)

class SID(Tool):
    public_description = "Grant access to your Notion, Google Drive, etc."
    description = """
        Find private information by searching through notion, email and google drive.
        Should be used when questions refer to personal information.
    """
    arg_description = (
        "The query to search for. It should be a question in natural language."
    )
    image_url = "/tools/sid.png"

    @staticmethod
    def available() -> bool:
        return settings.sid_enabled

    @staticmethod
    async def dynamic_available(user: UserBase, oauth_crud: OAuthCrud) -> bool:
        installation = await oauth_crud.get_installation_by_user_id(
            user_id=user.id, provider="sid"
        )

        return bool(installation and installation.access_token_enc)

    async def _run_sid(
        self,
        goal: str,
        task: str,
        input_str: str,
        user: UserBase,
        oauth_crud: OAuthCrud,
    ) -> t.Optional[t.Any]:
        installation = await oauth_crud.get_installation_by_user_id(
            user_id=user.id, provider="sid"
        )
        if not installation:
            logger.warning("No sid installation found for user {user.id}")
            return None

        token = await SIDOAuth.get_access_token(oauth_crud, installation)
        if not token:
            logger.warning("Unable to fetch sid access token for {user.id}")
            return None

        try:
            res = await _sid_search_results(input_str, limit=10, token=token)
            snippets: t.List[Snippet] = [
                Snippet(text=result["text"]) for result in (res.get("results", []))
            ]
        except Exception as e:
            logger.exception(e)
            return None

        if not snippets:
            return None

        return summarize_sid(self.model, self.language, goal, task, snippets)

    async def call(
        self,
        goal: str,
        task: str,
        input_str: str,
        user: UserBase,
        oauth_crud: OAuthCrud,
        *args: t.Any,
        **kwargs: t.Any,
    ) -> t.Any:
         # fall back to search if no results are found
        return await self._run_sid(goal, task, input_str, user, oauth_crud) or await Search(self.model, self.language).call(
        goal, task, input_str, user, oauth_crud
    )

async def _sid_search_results(
    search_term: str, limit: int, token: str
) -> t.Dict[str, t.Any]:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {"query": search_term, "limit": limit}

    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://api.sid.ai/v1/users/me/query",
            headers=headers,
            data=json.dumps(data),
        ) as response:
            response.raise_for_status()
            search_results = await response.json()
            return search_results
