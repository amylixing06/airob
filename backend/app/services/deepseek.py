import httpx
from typing import Dict, Any, Optional
from ..core.config import settings

class DeepSeekService:
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = settings.DEEPSEEK_API_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_page(self, prompt: str, style: str = "professional") -> Dict[str, Any]:
        """生成落地页内容"""
        enhanced_prompt = f"""
        你是一个专业的网页内容生成AI，请根据以下要求生成网页内容:
        风格: {style}
        详细需求: {prompt}
        
        输出格式要求:
        - 返回完整HTML代码
        - 包含CSS样式(内联)
        - 移动端适配
        - 包含常见的网页区块(导航、英雄区、功能展示、客户评价、CTA等)
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": enhanced_prompt}],
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            return response.json()

    async def refine_page(self, original_html: str, instructions: str) -> Dict[str, Any]:
        """优化现有页面内容"""
        prompt = f"""
        请根据以下要求优化网页内容:
        原始HTML:
        {original_html}
        
        优化要求:
        {instructions}
        
        请保持原有的HTML结构，只修改需要优化的部分。
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5
                }
            )
            response.raise_for_status()
            return response.json()

deepseek_service = DeepSeekService() 