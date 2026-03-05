from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_url: str = "sqlite:///./travel_planner.db"
    jwt_secret_key: str = "change_me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"

    gemini_model: str = "gemini-2.5-flash"
    gemini_api_key: str = ""
    gemini_api_key_encrypted: str = ""
    app_encryption_key: str = ""

    map_provider: str = "google"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
