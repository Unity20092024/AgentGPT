from fastapi import HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from reworkd_platform.db.crud.base import BaseCrud
from reworkd_platform.db.models.agent import AgentRun, AgentTask
from reworkd_platform.schemas.agent import Loop_Step
from reworkd_platform.schemas.user import UserBase
from reworkd_platform.settings import settings
from reworkd_platform.web.api.errors import MaxLoopsError, MultipleSummaryError


class AgentCRUD(BaseCrud):
    """CRUD operations for AgentRun and AgentTask models."""

    def __init__(self, session: AsyncSession, user: UserBase):
        super().__init__(session)
        self.user = user

    def __repr__(self):
        return f"<AgentCRUD user_id={self.user.id}>"

    async def get_run(self, run_id: str) -> AgentRun:
        """Get a run by id."""
        return await AgentRun.get(self.session, run_id)

    async def get_task_count_by_run_and_type(
        self, run_id: str, type_: str
    ) -> int:
        """Get the count of tasks by run and type."""
        query = select(func.count(AgentTask.id)).where(
            and_(
                AgentTask.run_id == run_id,
                AgentTask.type_ == type_,
            )
        )

        return (await self.session.execute(query)).scalar_one()

    async def create_run(self, goal: str) -> AgentRun:
        """Create a new run."""
        run = AgentRun(
            user_id=self.user.id,
            goal=goal,
        )

        return await run.save(self.session)

    async def create_task(self, run_id: str, type_: Loop_Step) -> AgentTask:
        """Create a new task."""
        await self.validate_task_count(run_id, type_)

        task = AgentTask(
            run_id=run_id,
            type_=type_,
        )

        return await task.save(self.session)

    async def validate_task_count(
        self, run_id: str, type_: str
    ) -> None:
        """Validate the task count for a given run and type."""
        run = await self.get_run(run_id)
        if not run:
            raise HTTPException(404, f"Run {run_id} not found")

        max_ = settings.max_loops
        task_count = await self.get_task_count_by_run_and_type(run_id, type_)

        if task_count >= max_:
            raise MaxLoopsError(
                StopIteration(),
                f"Max loops of {max_} exceeded, shutting down.",
                429,
                should_log=False,
            )

        if type_ == "summarize" and task_count > 1:
            raise MultipleSummaryError(
                StopIteration(),
                "Multiple summary tasks are not allowed",
                429,
            )
