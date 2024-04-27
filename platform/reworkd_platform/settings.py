import platform
from pathlib import Path
from typing import Any, Callable, Dict, List, Literal, Optional, Union

from pydantic import BaseSettings, Field
from yarl import URL

from reworkd_platform.constants import ENV_PREFIX

TEMP_DIR = Path(gettempdir())

LOG_LEVEL = Literal[
    "NOTSET",
    "DEBUG",
    "INFO",
    "WARNING",
    "ERROR",
    "FATAL",
]

SASL_MECHANISM = Literal[
    "PLAIN",
    "SCRAM-SHA-256",
]

ENVIRONMENT = Literal[
    "development",
    "production",
]


class Settings(BaseSettings):
    """
    Application settings.

    These parameters can be configured
    with environment variables.
    """

    # Application settings
    host: str = Field(default="127.0.0.1", title="Host")
    port: int = Field(default=8000, title="Port")
    workers_count: int = Field(default=1, title="Workers Count")
    reload: bool = Field(default=True, title="Reload")
    environment: ENVIRONMENT = Field(default="development", title="Environment")
    log_level: LOG_LEVEL = Field(default="INFO", title="Log Level")

    # Make sure you update this with your own secret key
    # Must be 32 url-safe base64-encoded bytes
    secret_signing_key: str = Field(
        default="JF52S66x6WMoifP5gZreiguYs9LYMn0lkXqgPYoNMD0=",
        title="Secret Signing Key",
    )

    # OpenAI
    openai_api_base: str = Field(
        default="https://api.openai.com/v1", title="OpenAI API Base"
    )
    openai_api_key: str = Field(
        default="<Should be updated via env>", title="OpenAI API Key"
    )
    openai_api_version: str = Field(
        default="2023-08-01-preview", title="OpenAI API Version"
    )
    azure_openai_deployment_name: str = Field(
        default="<Should be updated via env if using azure>",
        title="Azure OpenAI Deployment Name",
    )

    # Helicone
    helicone_api_base: str = Field(
        default="https://oai.hconeai.com/v1", title="Helicone API Base"
    )
    helicone_api_key: Optional[str] = Field(
        default=None, title="Helicone API Key"
    )

    replicate_api_key: Optional[str] = Field(
        default=None, title="Replicate API Key"
    )
    serp_api_key: Optional[str] = Field(
        default=None, title="Serp API Key"
    )

    # Frontend URL for CORS
    frontend_url: str = Field(
        default="http://localhost:3000", title="Frontend URL"
    )
    allowed_origins_regex: Optional[str] = Field(
        default=None, title="Allowed Origins Regex"
    )

    # Variables for the database
    db_host: str = Field(default="localhost", title="Database Host")
    db_port: int = Field(default=3308, title="Database Port")
    db_user: str = Field(default="reworkd_platform", title="Database User")
    db_pass: str = Field(default="reworkd_platform", title="Database Password")
    db_base: str = Field(default="reworkd_platform", title="Database Base")
    db_echo: bool = Field(default=False, title="Database Echo")
    db_ca_path: Optional[str] = Field(default=None, title="Database CA Path")

    # Variables for Pinecone DB
    pinecone_api_key: Optional[str] = Field(
        default=None, title="Pinecone API Key"
    )
    pinecone_index_name: Optional[str] = Field(
        default=None, title="Pinecone Index Name"
    )
    pinecone_environment: Optional[str] = Field(
        default=None, title="Pinecone Environment"
    )

    # Sentry's configuration.
    sentry_dsn: Optional[str] = Field(default=None, title="Sentry DSN")
    sentry_sample_rate: float = Field(
        default=1.0, title="Sentry Sample Rate"
    )

    kafka_bootstrap_servers: Union[str, List[str]] = Field(
        default=[], title="Kafka Bootstrap Servers"
    )
    kafka_username: Optional[str] = Field(default=None, title="Kafka Username")
    kafka_password: Optional[str] = Field(default=None, title="Kafka Password")
    kafka_ssal_mechanism: SASL_MECHANISM = Field(
        default="PLAIN", title="Kafka Ssal Mechanism"
    )

    # Websocket settings
    pusher_app_id: Optional[str] = Field(default=None, title="Pusher App ID")
    pusher_key: Optional[str] = Field(default=None, title="Pusher Key")
    pusher_secret: Optional[str] = Field(default=None, title="Pusher Secret")
    pusher_cluster: Optional[str] = Field(default=None, title="Pusher Cluster")

    # Application Settings
    ff_mock_mode_enabled: bool = Field(
        default=False, title="FF Mock Mode Enabled"
    )  # Controls whether calls are mocked
    max_loops: int = Field(default=25, title="Maximum Number of Loops")

    # Settings for sid
    sid_client_id: Optional[str] = Field(default=None, title="SID Client ID")
    sid_client_secret: Optional[str] = Field(
        default=None, title="SID Client Secret"
    )
    sid_redirect_uri: Optional[str] = Field(
        default=None, title="SID Redirect URI"
    )

    @property
    def kafka_consumer_group(self) -> str:
        """
        Kafka consumer group will be the name of the host in development
        mode, making it easier to share a dev cluster.
        """

        if self.environment == "development":
            return platform.node()

        return "platform"

    @property
    def db_url(self) -> URL:
        return URL.build(
            scheme="mysql+aiomysql",
            host=self.db_host,
            port=self.db_port,
            user=self.db_user,
            password=self.db_pass,
            path=f"/{self.db_base}",
        )

    @property
    def pusher_enabled(self) -> bool:
        return all(
            [
                self.pusher_app_id,
                self.pusher_key,
                self.pusher_secret,
                self.pusher_cluster,
            ]
        )

    @property
    def kafka_enabled(self) -> bool:
        return all(
            [
                self.kafka_bootstrap_servers,
                self.kafka_username,
                self.kafka_password,
            ]
        )

    @property
    def helicone_enabled(self) -> bool:
        return all(
            [
                self.helicone_api_base,
                self.helicone_api_key,
            ]
        )

    @property
    def sid_enabled(self) -> bool:
        return all(
            [
                self.sid_client_id,
                self.sid_client_secret,
                self.sid_redirect_uri,
            ]
        )

    class Config:
        env_file: str = Field(default=".env", title="Env File")
        env_prefix: str = Field(default=ENV_PREFIX, title="Env Prefix")
        env_file_encoding: str = Field(default="utf-8", title="Env File Encoding")

        @classmethod
        def customise_sources(
            cls,
            init_setattr: Callable[[Any, str, Any], None],
            all_attributes: Dict[str, Any],
        ) -> None:
            for name, field in all_attributes.items():
                if name in (
                    "env_file",
                    "env_prefix",
                    "env_file_encoding",
                ):
                    continue

                title = field.field_info.title
                description = field.field_info.description
                examples = field.field_info.extra["examples"]
                external_docs = field.field_info.extra["external_docs"]
                external_docs_url = external_docs["url"]
                external_docs_description = external_docs["description"]
                external_docs_schema = external_docs["schema"]
                external_docs_title = external_docs["title"]

                init_setattr(
                    cls,
                    name,
                    field.type_(
                        title=title,
                        description=description,
                        examples=examples,
                        external_docs=external_docs,
                        external_docs_url=external_docs_url,
                        external_docs_description=external_docs_description,
                        external_docs_schema=external_docs_schema,
                        external_docs_title=external_docs_title,
                    ),
                )

settings = Settings()
