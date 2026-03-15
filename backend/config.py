from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import itertools
import os

# Look for .env in parent directory (project root)
env_path = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEY_2: str = ""
    EXA_API_KEY: str = ""
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""
    LANGFUSE_BASE_URL: str = "https://cloud.langfuse.com"
    ANALYTICS_ENABLED: bool = True
    ANTHROPIC_API_KEY: str = ""
    
    DB_URL: str = "sqlite:///./data/outcomes.db"
    MODEL: str = "models/gemini-2.5-flash-lite"
    DEBUG: bool = False
    
    model_config = SettingsConfigDict(
        env_file=str(env_path),
        extra="ignore",
        case_sensitive=False
    )

settings = Settings()

# Round-robin key rotation to spread quota across both keys
_key_cycle = itertools.cycle([settings.GEMINI_API_KEY, settings.GEMINI_API_KEY_2])

def get_api_key() -> str:
    """Get the next API key in the rotation."""
    return next(_key_cycle)
