from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # 基本配置
    PROJECT_NAME: str = "AIROB API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # DeepSeek API配置
    DEEPSEEK_API_KEY: str
    DEEPSEEK_API_BASE_URL: str = "https://api.deepseek.com/v1"
    
    # 安全配置
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://airob.vercel.app",  # 添加您的Vercel部署域名
        "https://*.vercel.app"       # 允许所有Vercel预览部署
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 