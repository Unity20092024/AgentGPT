import os

def get_env_variables(prefix):
    env_vars = {}
    for key, value in os.environ.items():
        if key.startswith(prefix):
            env_vars[key] = value
    return env_vars

ENV_PREFIX = "REWORKD_PLATFORM_"
env_vars = get_env_variables(ENV_PREFIX)

for key, value in env_vars.items():
    print(f"{key}: {value}")
