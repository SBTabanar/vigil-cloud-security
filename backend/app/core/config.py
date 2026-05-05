from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache
import secrets

class Settings(BaseSettings):
    APP_NAME: str = "Vigil"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Security — must be set via environment variable; no default secret
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "sqlite:///./vigil_platform.db"
    
    # Redis (for caching, rate limiting, and Celery)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS — exact origin only
    FRONTEND_URL: str = "http://localhost:5173"
    
    # AWS (for scanner)
    AWS_REGION: str = "us-east-1"
    VIGIL_SCANNER_ROLE_ARN: str = "arn:aws:iam::123456789012:role/VigilScannerRole"
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    
    # PayMongo (Philippines)
    PAYMONGO_SECRET_KEY: str = ""
    PAYMONGO_WEBHOOK_SECRET: str = ""
    PAYMONGO_PUBLIC_KEY: str = ""
    
    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "alerts@example.com"
    FROM_NAME: str = "Vigil Security"
    
    # GitHub (for Terraform PRs)
    GITHUB_TOKEN: str = ""
    
    model_config = ConfigDict(env_file=".env")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
