from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Helix API"
    SECRET_KEY: str = "c0bde6cb739eb986ffb2db259439c1073135e3b4fbf38708b37912bffcb33fd4"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./helix.db"  # SQLite for demo

    model_config = SettingsConfigDict(case_sensitive=True)


settings = Settings()
