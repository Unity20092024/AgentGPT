from unittest.mock import Mock

import tiktoken

from reworkd_platform.schemas.agent import LLM_MODEL_MAX_TOKENS
from reworkd_platform.services.tokenizer.token_service import TokenService

EncodingType = tiktoken.Encoding


def create_token_service(encoding: EncodingType) -> TokenService:
    return TokenService(encoding)


def test_happy_path(service: TokenService) -> None:
    text = "Hello world!"
    validate_tokenize_and_detokenize(service, text, 2)


def test_empty_string(service: TokenService) -> None:
    text = ""
    validate_tokenize_and_detokenize(service, text, 0)


def validate_tokenize_and_detokenize(
    service: TokenService, text: str, expected_token_count: int
) -> None:
    tokens = service.tokenize(text)
    assert text == service.detokenize(tokens)
    assert len(tokens) == service.count(text)
    assert len(tokens) == expected_token_count


def test_calculate_max_tokens_with_small_max_tokens(service: TokenService) -> None:
    initial_max_tokens = 3000
    model = Mock(spec=["model_name", "max_tokens"])
    model.model_name = "gpt-3.5-turbo"
    model.max_tokens = initial_max_tokens

    service.calculate_max_tokens(model, "Hello")

    assert model.max_tokens == initial_max_tokens


def test_calculate_max_tokens_with_high_completion_tokens(service: TokenService) -> None:
    prompt_tokens = service.count(LONG_TEXT)
    model = Mock(spec=["model_name", "max_tokens"])
    model.model_name = "gpt-3.5-turbo"
    model.max_tokens = 8000

    service.calculate_max_tokens(model, LONG_TEXT)

    assert model.max_tokens == (
        LLM_MODEL_MAX_TOKENS.get("gpt-3.5-turbo") - prompt_tokens
    )


def test_calculate_max_tokens_with_negative_result(service: TokenService) -> None:
    model = Mock(spec=["model_name", "max_tokens"])
    model.model_name = "gpt-3.5-turbo"
    model.max_tokens = 8000

    service.calculate_max_tokens(model, LONG_TEXT * 100)

    # We use the minimum length of 1
    assert model.max_tokens == 1


LONG_TEXT = """
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This is some long text.
This is some long text. This is some long text. This if some long text.
This is some long text. This is some long text. This is some long text.
"""


if __name__ == "__main__":
    encoding = tiktoken.get_encoding("cl100k_base")
    service = create_token_service(encoding)

    # Run all tests
    test_happy_path(service)
    test_empty_string(service)
    test_calculate_max_tokens_with_small_max_tokens(service)
    test_calculate_max_tokens_with_high_completion_tokens(service)
    test_calculate_max_tokens_with_negative_result(service)
