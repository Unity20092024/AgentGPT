import asyncio
import logging
import re
from typing import Any, Callable, Dict, List, Optional, Type

import openai
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from langchain import LLMChain
from langchain.callbacks.base import AsyncCallbackHandler
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate
from langchain.schema import HumanMessage
from pydantic import BaseModel, ValidationError
from pydantic.json import pydantic_encoder
from ratelimiter import RateLimiter
from typing_extensions import Literal

import reworkd_platform.db.crud.oauth as oauth_crud
import reworkd_platform.schemas.agent as agent_schemas
import reworkd_platform.schemas.user as user_schemas
import reworkd_platform.services.tokenizer.token_service as token_service
import reworkd_platform.web.api.agent.analysis as analysis
import reworkd_platform.web.api.agent.helpers as agent_helpers
import reworkd_platform.web.api.agent.model_factory as model_factory
import reworkd_platform.web.api.agent.prompts as prompts
import reworkd_platform.web.api.agent.tools.open_ai_function as open_ai_function
import reworkd_platform.web.api.agent.tools.tools as tools
import reworkd_platform.web.api.agent.tools.utils as tools_utils
from reworkd_platform.web.api.agent.task_output_parser import TaskOutputParser
from reworkd_platform.web.api.errors import OpenAIError

logger = logging.getLogger(__name__)
re.compile("")  # This line is a workaround for a Flake8 issue.

class OpenAIAgentService(AgentService):
    def __init__(
        self,
        model: model_factory.WrappedChatOpenAI,
        settings: agent_schemas.ModelSettings,
        token_service: token_service.TokenService,
        callbacks: Optional[List[AsyncCallbackHandler]],
        user: user_schemas.UserBase,
        oauth_crud: oauth_crud.OAuthCrud,
    ):
        self.model = model
        self.settings = settings
        self.token_service = token_service
        self.callbacks = callbacks or []
        self.user = user
        self.oauth_crud = oauth_crud
        self._rate_limiter = RateLimiter(max_calls=10, period=1)

    async def start_goal(self, *, goal: str) -> List[str]:
        prompt = ChatPromptTemplate.from_messages(
            [SystemMessagePromptTemplate(prompt=prompts.start_goal_prompt)]
        )

        self.token_service.calculate_max_tokens(
            self.model,
            prompt.format_prompt(
                goal=goal,
                language=self.settings.language,
            ).to_string(),
        )

        completion = await agent_helpers.call_model_with_handling(
            self.model,
            ChatPromptTemplate.from_messages(
                [SystemMessagePromptTemplate(prompt=prompts.start_goal_prompt)]
            ),
            {"goal": goal, "language": self.settings.language},
            settings=self.settings,
            callbacks=self.callbacks,
        )

        task_output_parser = TaskOutputParser(completed_tasks=[])
        tasks = task_output_parser.parse(completion)

        return tasks

    async def analyze_task(
        self, *, goal: str, task: str, tool_names: List[str]
    ) -> analysis.Analysis:
        user_tools = await tools.get_user_tools(tool_names, self.user, self.oauth_crud)
        functions = [open_ai_function.get_tool_function(tool) for tool in user_tools]
        prompt = prompts.analyze_task_prompt.format_prompt(
            goal=goal,
            task=task,
            language=self.settings.language,
        )

        self.token_service.calculate_max_tokens(
            self.model,
            prompt.to_string(),
            str(functions),
        )

        message = await agent_helpers.openai_error_handler(
            func=self.model.predict_messages,
            messages=prompt.to_messages(),
            functions=functions,
            settings=self.settings,
            callbacks=self.callbacks,
        )

        function_call = message.additional_kwargs.get("function_call", {})
        completion = function_call.get("arguments", "")

        try:
            pydantic_parser = PydanticOutputParser(pydantic_object=analysis.AnalysisArguments)
            analysis_arguments = pydantic_parser.parse(completion)
            return analysis.Analysis(
                action=function_call.get("name", tools.get_tool_name(tools.get_default_tool())),
                **analysis_arguments.dict(),
            )
        except (OpenAIError, ValidationError):
            return analysis.Analysis.get_default_analysis(task)

    async def execute_task(
        self,
        *,
        goal: str,
        task: str,
        analysis: analysis.Analysis,
    ) -> StreamingResponse:
        tool_class = tools.get_tool_from_name(analysis.action)
        return await tool_class(self.model, self.settings.language).call(
            goal,
            task,
            analysis.arg,
            self.user,
            self.oauth_crud,
        )

    async def create_tasks(
        self,
        *,
        goal: str,
        tasks: List[str],
        last_task: str,
        result: str,
        completed_tasks: Optional[List[str]] = None,
    ) -> List[str]:
        prompt = ChatPromptTemplate.from_messages(
            [SystemMessagePromptTemplate(prompt=prompts.create_tasks_prompt)]
        )

        args = {
            "goal": goal,
            "language": self.settings.language,
            "tasks": "\n".join(tasks),
            "lastTask": last_task,
            "result": result,
        }

        self.token_service.calculate_max_tokens(
            self.model, prompt.format_prompt(**args).to_string()
        )

        completion = await agent_helpers.call_model_with_handling(
            self.model, prompt, args, settings=self.settings, callbacks=self.callbacks
        )

        previous_tasks = (completed_tasks or []) + tasks
        return [completion] if completion not in previous_tasks else []

    async def summarize_task(
        self,
        *,
        goal: str,
        results: List[str],
    ) -> StreamingResponse:
        self.model.model_name = "gpt-3.5-turbo-16k"
        self.model.max_tokens = 8000  # Total tokens = prompt tokens + completion tokens

        snippet_max_tokens = 7000  # Leave room for the rest of the prompt
        text_tokens = self.token_service.tokenize("".join(results))
        text = self.token_service.detokenize(text_tokens[0:snippet_max_tokens])
        logger.info(f"Summarizing text: {text}")

        return tools_utils.summarize(
            model=self.model,
            language=self.settings.language,
            goal=goal,
            text=text,
        )

    async def chat(
        self,
        *,
        message: str,
        results: List[str],
    ) -> StreamingResponse:
        self.model.model_name = "gpt-3.5-turbo-16k"
        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessagePromptTemplate(prompt=prompts.chat_prompt),
                *[HumanMessage(content=result) for result in results],
                HumanMessage(content=message),
            ]
        )

        self.token_service.calculate_max_tokens(
            self.model,
            prompt.format_prompt(
                language=self.settings.language,
            ).to_string(),
        )

        chain = LLMChain(llm=self.model, prompt=prompt)

        return StreamingResponse.from_chain(
            chain,
            {"language": self.settings.language},
            media_type="text/event-stream",
        )

    @property
    def max_tokens(self) -> int:
        return self.model.max_tokens

    @max_tokens.setter
    def max_tokens(self, value: int) -> None:
        self.model.max_tokens = value
