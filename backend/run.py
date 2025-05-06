import uvicorn
from app.core.config import settings
from fastapi import FastAPI
from app.main import app

# 这个文件用于Vercel部署
# 直接导出app实例

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 