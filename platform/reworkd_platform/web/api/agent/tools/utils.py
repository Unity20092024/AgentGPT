from dataclasses import dataclass
from typing import List, TypeVar, Generic

from fastapi.responses import StreamingResponse as FastAPIStreamingResponse
from lanarky.responses import StreamingResponse
from langchain import LLMChain
from langchain.chat_models.base import BaseChatModel

T = TypeVar('T')

@dataclass
class CitedSnippet(Generic[T]):
    index: int
    text: T
    url: str = ""

    def __repr__(self) -> str:
        """
        The string representation the AI model will see
        """
        return f"{{i: {self.index}, text: {self.text}, url: {self.url}}}"


@dataclass
class Snippet(Generic[T]):
    text: T

    def __repr__(self) -> str:
        """
        The string representation the AI model will see
        """
        return f"{{text: {self.text}}}"


def _summarize_with_snippets(
    model: BaseChatModel,
    language: str,
    goal: str,
    query: str,
    snippets: List[Union[CitedSnippet, Snippet]],
    prompt_func,
    media_type: str = "text/event-stream",
) -> FastAPIStreamingResponse:
    chain = LLMChain(llm=model, prompt=prompt_func)

    return StreamingResponse.from_chain(
        chain,
        {
            "goal": goal,
            "query": query,
            "language": language,
            "snippets": snippets,
        },
        media_type=media_type,
    )


def summarize(
    model: BaseChatModel,
    language: str,
    goal: str,
    text: str,
) -> FastAPIStreamingResponse:
    from reworkd_platform.web.api.agent.prompts import summarize_prompt

    return _summarize_with_snippets(
        model,
        language,
        goal,
        "",
        [Snippet(text)],
        summarize_prompt,
    )


def summarize_with_sources(
    model: BaseChatModel,
    language: str,
    goal: str,
    query: str,
    snippets: List[CitedSnippet],
) -> FastAPIStreamingResponse:
    from reworkd_platform.web.api.agent.prompts import summarize_with_sources_prompt

    return _summarize_with_snippets(
        model,
        language,
        goal,
        query,
        snippets,
        summarize_with_sources_prompt,
    )


def summarize_sid(
    model: BaseChatModel,
    language: str,
    goal: str,
    query: str,
    snippets: List[Snippet],
) -> FastAPIStreamingResponse:
    from reworkd_platform.web.api.agent.prompts import summarize_sid_prompt

    return _summarize_with_snippets(
        model,
        language,
        goal,
        query,
        snippets,
        summarize_sid_prompt,
    )
