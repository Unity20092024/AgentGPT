from abc import ABC, abstractmethod
from typing import Any, Optional

import anthropic
from pydantic import BaseModel


class AbstractPrompt(ABC, BaseModel):
    @abstractmethod
    def to_string(self) -> str:
        pass

