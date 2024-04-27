import pytest
from unittest.mock import Mock

import pytest_asyncio
from reworkd_platform.web.api.agent import dependancies

pytest_asyncio.patch("reworkd_platform.web.api.agent.crud.create_task", new_callable=AsyncMock)(mocker)

@pytest.mark.anyio
@pytest.mark.parametrize(
    "validator, step",
    [
        (dependancies.agent_summarize_validator, "summarize"),
        (dependancies.agent_chat_validator, "chat"),
        (dependancies.agent_analyze_validator, "analyze"),
        (dependancies.agent_create_validator, "create"),
        (dependancies.agent_execute_validator, "execute"),
    ],
)
async def test_agent_validate(mocker, validator, step):
    mocker.patch("reworkd_platform.web.api.agent.crud.create_task", new_callable=AsyncMock)
    run_id = "asim"
    crud = mocker.Mock()
    body = Mock()
    body.run_id = run_id

    await validator(body, crud)

    crud.create_task.assert_called_once_with.assert_called_once_with(run_id, step)
