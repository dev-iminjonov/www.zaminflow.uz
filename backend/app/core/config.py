from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "B2B Dairy Supply Chain & FinTech Escrow Platform"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str
    SUPABASE_URL: str = Field(min_length=1)

    JWT_SECRET_KEY: str = Field(min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes access token as per SRS v3.0
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CSRF_SECRET: str = Field(min_length=32)
    QR_HMAC_SECRET: str = Field(min_length=32)
    BANK_WEBHOOK_HMAC_SECRET: str = Field(min_length=32)

    APP_BASE_URL: str = "http://localhost:3000"
    KYB_DOCS_DIR: str = "/tmp/kyb_docs"

    # SMTP Configuration (falls back to console mailer if empty)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@zaminflow.uz"

    CORS_ALLOWED_ORIGINS: list[str] = [
        "https://zaminflow.uz",
        "https://www.zaminflow.uz",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
