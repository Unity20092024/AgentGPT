import ast
import re
from typing import Any, Final, List, Optional

from langchain.schema import BaseOutputParser, OutputParserException


class TaskOutputParser(BaseOutputParser[List[str]]):
    """
    Extension of LangChain's BaseOutputParser
    Responsible for parsing task creation output into a list of task strings
    """

    completed_tasks: Final = []

    def __init__(self, *, completed_tasks: Optional[List[str]] = None):
        super().__init__()
        self.completed_tasks = completed_tasks or []

    def parse(self, text: str) -> List[str]:
        try:
            array_str = self._extract_array(text)
            all_tasks = [task for task in array_str if self._real_tasks_filter(task)]
            return [task for task in all_tasks if task not in self.completed_tasks]
        except Exception as e:
            msg = f"Failed to parse tasks from completion '{text}'. Exception: {e}"
            raise OutputParserException(msg)

    def get_format_instructions(self) -> str:
        return """
        The response should be a JSON array of strings. Example:

        ["Search the web for NBA news", "Write some code to build a web scraper"]

        This should be parsable by json.loads()
        """

    def _extract_array(self, input_str: str) -> List[str]:
        regex = r"\[(?:\s*(?:\"[^\"\\]*(?:\\.[^\"\\]*)*\"|\'[^\'\\]*(?:\\.[^\'\\]*)*\')\s*,?)*\s*\]"
        match = re.fullmatch(regex, input_str)
        if match is not None:
            return ast.parse(match[0], mode="eval").get("body")[0].get("value")
        else:
            return self._handle_multiline_string(input_str)

    def _handle_multiline_string(self, input_str: str) -> List[str]:
        processed_lines = [
            re.sub(r".*?(\d+\..+)", r"\1", line).strip()
            for line in input_str.split("\n")
            if line.strip() != ""
        ]

        if any(re.fullmatch(r"\d+\..+", line) for line in processed_lines):
            return processed_lines
        else:
            raise RuntimeError(f"Failed to extract array from {input_str}")

    def _remove_prefix(self, input_str: str) -> str:
        prefix_pattern = (
            r"^(Task\s*\d*\.\s*|Task\s*\d*[-:]?\s*|Step\s*\d*["
            r"-:]?\s*|Step\s*[-:]?\s*|\d+\.\s*|\d+\s*[-:]?\s*|^\.\s*|^\.*)"
        )
        return re.sub(prefix_pattern, "", input_str, flags=re.IGNORECASE)

    def _real_tasks_filter(self, input_str: str) -> bool:
        no_task_regex = (
            r"^No( (new|further|additional|extra|other))? tasks? (is )?("
            r"required|needed|added|created|inputted).*"
        )
        task_complete_regex = r"^Task (complete|completed|finished|done|over|success).*"
        do_nothing_regex = r"^(\s*|Do nothing(\s.*)?)$"

        return (
            not re.fullmatch(no_task_regex, input_str, re.IGNORECASE)
            and not re.fullmatch(task_complete_regex, input_str, re.IGNORECASE)
            and not re.fullmatch(do_nothing_regex, input_str, re.IGNORECASE)
        )
