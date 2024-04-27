from typing import List, Type

import pytest
from langchain.schema import OutputParserException
from reworkd_platform.web.api.agent.task_output_parser import (
    TaskOutputParser,
    extract_array,
    real_tasks_filter,
    remove_prefix,
)
from reworkd_platform.web.api.agent.task_output_parser import extract_tasks  # Added import


@pytest.mark.parametrize(
    "input_text,expected_output",
    [
        # ... (same as original)
    ],
)
def test_parse_success(input_text: str, expected_output: List[str]) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "input_text, expected_output",
    [
        # ... (same as original)
    ],
)
def test_parse_with_completed_tasks(input_text: str, expected_output: List[str]) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "input_text, exception",
    [
        # ... (same as original)
    ],
)
def test_parse_failure(input_text: str, exception: Type[Exception]) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "input_str, expected",
    [
        # ... (same as original)
    ],
)
def test_extract_array_success(input_str: str, expected: List[str]) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "input_str, exception",
    [
        # ... (same as original)
    ],
)
def test_extract_array_exception(input_str: str, exception: Type[Exception]) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "task_input, expected_output",
    [
        # ... (same as original)
    ],
)
def test_remove_task_prefix(task_input: str, expected_output: str) -> None:
    # ... (same as original)


@pytest.mark.parametrize(
    "input_text, expected_result",
    [
        # ... (same as original)
    ],
)
def test_real_tasks_filter_no_task(input_text: str, expected_result: bool) -> None:
    # ... (same as original)


def test_extract_tasks() -> None:
    """Test extract_tasks function with different input cases."""
    assert extract_tasks("") == []
    assert extract_tasks("Task: This is a sample task") == ["This is a sample task"]
    assert extract_tasks("Task 1: Perform a comprehensive analysis of system performance.") == [
        "Perform a comprehensive analysis of system performance."
    ]
    assert extract_tasks("Task 2. Create a python script") == ["Create a python script"]
    assert extract_tasks("5 - This is a sample task") == ["This is a sample task"]
    assert extract_tasks("2: This is a sample task") == ["This is a sample task"]
    assert extract_tasks("This is a sample task without a prefix") == [
        "This is a sample task without a prefix"
    ]
    assert extract_tasks("Step: This is a sample task") == ["This is a sample task"]
    assert extract_tasks("Step 1: Perform a comprehensive analysis of system performance.") == [
        "Perform a comprehensive analysis of system performance."
    ]
    assert extract_tasks("Step 2:Create a python script") == ["Create a python script"]
    assert extract_tasks("Step:This is a sample task") == ["This is a sample task"]
    assert extract_tasks(". Conduct research on the history of Nike") == [
        "Conduct research on the history of Nike"
    ]
    assert extract_tasks(".This is a sample task") == [
        "This is a sample task"
    ]
    assert extract_tasks("1. Research the history and background of Nike company.") == [
        "Research the history and background of Nike company."
    ]
