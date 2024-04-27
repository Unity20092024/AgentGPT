from typing import Any

import asyncio
from fastapi import FastAPI, HTTPException
from langchain import WikipediaAPIWrapper

from reworkd_platform.web.api.agent.stream_mock import stream_string
from reworkd_platform.web.api.agent.tools.tool import Tool

class Wikipedia(Tool):
    description = (
        "Search Wikipedia for information about historical people, companies, events, "
        "places or research. This should be used over search for broad overviews of "
        "specific nouns."
    )
    public_description = "Search Wikipedia for historical information."
    arg_description = "A simple query string of just the noun in question."
    image_url = "/tools/wikipedia.png"

    def __init__(self):
        self.wikipedia_client = WikipediaAPIWrapper(wiki_client=None)

    async def call(
        self, goal: str, task: str, input_str: str, *args: Any, **kwargs: Any
    ) -> StreamingResponse:
        try:
            wikipedia_search = await self.wikipedia_client.run(input_str)
            return stream_string(wikipedia_search)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Wikipedia search failed")

