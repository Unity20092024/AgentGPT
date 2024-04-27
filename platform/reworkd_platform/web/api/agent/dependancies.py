from typing import TypeVar

from fastapi import Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from reworkd_platform.db.crud.agent import AgentCRUD
from reworkd_platform.db.dependencies import get_db_session
from reworkd_platform.schemas.agent import (
    AgentChat,
    AgentRun,
    AgentRunCreate,
    AgentSummarize,
    AgentTaskAnalyze,
    AgentTaskCreate,
    AgentTaskExecute,
    Loop_Step,
)
from reworkd_platform.schemas.user import UserBase
from reworkd_platform.web.api.dependencies import get_current_user

TaskType = TypeVar("TaskType", AgentTaskAnalyze, AgentTaskExecute, AgentTaskCreate, AgentSummarize, AgentChat)


def get_agent_crud(user: UserBase = Depends(get_current_user),
                   session: AsyncSession = Depends(get_db_session)) -> AgentCRUD:
    """
    Returns an instance of AgentCRUD with the given user and session.
    """
    return AgentCRUD(session, user)


async def create_agent_run(crud: AgentCRUD = Depends(get_agent_crud),
                           body: AgentRunCreate = Body(
                               example={
                                   "goal": "Create business plan for a bagel company",
                                   "modelSettings": {
                                       "customModelName": "gpt-3.5-turbo",
                                   },
                               },
                           )) -> AgentRun:
    """
    Creates a new agent run and returns an AgentRun object with the updated run_id.
    """
    id_ = (await crud.create_run(body.goal)).id
    return AgentRun(**body.dict(), run_id=str(id_))


async def validate_task(body: TaskType, crud: AgentCRUD = Depends(get_agent_crud),
                        task_type: Loop_Step) -> TaskType:
    """
    Validates the given task by creating a new task in the database and setting the run_id.
    """
    body.run_id = (await crud.create_task(body.run_id, task_type)).id
    return body


async def agent_analyze_validator(body: AgentTaskAnalyze = Body(),
                                   crud: AgentCRUD = Depends(get_agent_crud)) -> AgentTaskAnalyze:
    """
    Validates and creates a new AgentTaskAnalyze object in the database.
    """
    return await validate_task(body, crud, "analyze")


async def agent_execute_validator(body: AgentTaskExecute = Body(
                                       example={
                                           "goal": "Perform tasks accurately",
                                           "task": "Write code to make a platformer",
                                           "analysis": {
                                               "reasoning": "I like to write code.",
                                               "action": "code",
                                               "arg": "",
                                           },
                                       },
                                   ),
                                   crud: AgentCRUD = Depends(get_agent_crud)) -> AgentTaskExecute:
    """
    Validates and creates a new AgentTaskExecute object in the database.
    """
    return await validate_task(body, crud, "execute")


async def agent_create_validator(body: AgentTaskCreate = Body(),
                                  crud: AgentCRUD = Depends(get_agent_crud)) -> AgentTaskCreate:
    """
    Validates and creates a new AgentTaskCreate object in the database.
    """
    return await validate_task(body, crud, "create")


async def agent_summarize_validator(body: AgentSummarize = Body(),
                                     crud: AgentCRUD = Depends(get_agent_crud)) -> AgentSummarize:
    """
    Validates and creates a new AgentSummarize object in the database.
    """
    return await validate_task(body, crud, "summarize")


async def agent_chat_validator(body: AgentChat = Body(),
                                crud: AgentCRUD = Depends(get_agent_crud)) -> AgentChat:
    """
    Validates and creates a new AgentChat object in the database.
    """
    return await validate_task(body, crud, "chat")
