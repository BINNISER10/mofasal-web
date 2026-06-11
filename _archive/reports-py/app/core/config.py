from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "MUFASAL Reports"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mufasal"
    redis_url: str = "redis://localhost:6379/0"
    cors_origins: list[str] = ["http://localhost:3000"]
    api_key: str = ""
    report_cache_ttl: int = 3600

    class Config:
        env_file = ".env"


settings = Settings()
