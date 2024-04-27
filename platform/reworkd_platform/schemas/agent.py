from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseSettings, BaseModel, Field, validator

from reworkd_platform.web.api.agent.analysis import Analysis

class ModelSettings(BaseSettings):
    model: LLM_Model = Field(default="gpt-3.5-turbo")
    custom_api_key: Optional[str] = Field(default=None)
    temperature: float = Field(default=0.9, ge=0.0, le=1.0)
    max_tokens: int = Field(default=500, ge=0)
    language: str = Field(default="English")

    def __init__(self, **data: Any) -> None:
        max_tokens = LLM_MODEL_MAX_TOKENS[data["model"]]
        super().__init__(max_tokens=max_tokens, **data)

    class Config:
        validate_assignment = True


LLM_Model = Literal[
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k",
    "gpt-4",
]
Loop_Step = Literal[
    "start",
    "analyze",
    "execute",
    "create",
    "summarize",
    "chat",
]
LLM_MODEL_MAX_TOKENS: Dict[LLM_Model, int] = {
    "gpt-3.5-turbo": 4000,
    "gpt-3.5-turbo-16k": 16000,
    "gpt-4": 8000,
}


class AgentRunCreate(BaseModel):
    """Represents the settings for creating a new agent run."""

    goal: str
    model_settings: ModelSettings = Field(default=ModelSettings())

    @validator("model_settings")
    def validate_model(cls, v: ModelSettings) -> ModelSettings:
        """Validates the `model` attribute of the `model_settings` field."""
        if v.model not in LLM_MODEL_MAX_TOKENS:
            raise ValueError(f"Invalid model: {v.model}")
        return v


class Run(BaseModel):
    """Represents a single run of an agent."""

    run_id: str
    goal: str
    model_settings: ModelSettings
    start_time: datetime
    end_time: Optional[datetime] = None


class RunManager:
    """Manages a collection of runs."""

    def __init__(self) -> None:
        self.runs: List[Run] = []

    def create_run(self, goal: str, model_settings: ModelSettings) -> Run:
        """Creates a new run and adds it to the manager."""
        run = Run(
            run_id=str(id(model_settings)),
            goal=goal,
            model_settings=model_settings,
            start_time=datetime.now(),
        )
        self.runs.append(run)
        return run


class AgentTaskAnalyze(AgentRunCreate):
    """Represents a task that analyzes some input."""

    task: str
    tool_names: List[str] = Field(default=[])


class AgentTaskExecute(AgentRunCreate):
    """Represents a task that executes some code."""

    task: str
    analysis: Analysis


class AgentTaskCreate(AgentRunCreate):
    """Represents a task that creates new tasks."""

    tasks: List[str] = Field(default=[])
    last_task: Optional[str] = Field(default=None)
    result: Optional[str] = Field(default=None)
    completed_tasks: List[str] = Field(default=[])


class AgentSummarize(AgentRunCreate):
    """Represents a task that summarizes some text."""

    results: List[str] = Field(default=[])


class AgentChat(AgentRunCreate):
    """Represents a task that chats with a user."""

    message: str
    results: List[str] = Field(default=[])


class NewTasksResponse(BaseModel):
    """Represents the response from the server when new tasks are created."""

    run_id: str
    new_tasks: List[str] = Field(alias="newTasks")


class RunCount(BaseModel):
    """Represents the count of runs."""

    count: int
    first_run: Optional[datetime]
    last_run: Optional[datetime]
