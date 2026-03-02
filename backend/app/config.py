from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    MAX_DOCUMENT_CHARS: int = 15000
    UPLOAD_DIR: str = "uploads"

    # Rate limiting
    GROQ_RPM: int = 30
    GROQ_TPM: int = 12000
    MIN_CALL_DELAY: float = 2.5

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
