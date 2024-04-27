from functools import wraps
from time import time
from typing import Any, Callable

import loguru

LogLevel = loguru.levels.Level

def timed_function(level: LogLevel = loguru.levels.INFO) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    A decorator that times the execution of a function and logs the result.

    :param level: The log level to use for the message. Default is INFO.
    :return: A decorator that can be applied to a function.
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = time()
            result = func(*args, **kwargs)
            execution_time = time() - start_time
            log_message = f"Function '{func.__qualname__}' executed in {execution_time:.4f} seconds"
            loguru.logger.log(level, log_message)

            return result

        return wrapper

    return decorator
