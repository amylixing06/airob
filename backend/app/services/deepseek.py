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
            # 检查base_url是否已经包含了/chat/completions
            endpoint = "/chat/completions"
            if self.base_url.endswith("/chat/completions"):
                url = self.base_url
            elif "/chat/completions" in self.base_url:
                # 如果URL中已经包含了部分路径但不完整
                url = self.base_url.split("/chat")[0] + "/chat/completions"
            else:
                # 去除可能的尾部斜杠
                base = self.base_url.rstrip('/')
                url = f"{base}{endpoint}"
                
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": enhanced_prompt}],
                        "temperature": 0.7
                    },
                    timeout=60.0  # 增加超时时间到60秒
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # 记录错误信息
                print(f"DeepSeek API调用失败: {str(e)}")
                print(f"请求URL: {url}")
                print(f"API密钥前缀: {self.api_key[:7]}...")
                raise

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
            # 与generate_page相同的URL构建逻辑
            endpoint = "/chat/completions"
            if self.base_url.endswith("/chat/completions"):
                url = self.base_url
            elif "/chat/completions" in self.base_url:
                url = self.base_url.split("/chat")[0] + "/chat/completions"
            else:
                base = self.base_url.rstrip('/')
                url = f"{base}{endpoint}"
                
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.5
                    },
                    timeout=60.0  # 增加超时时间到60秒
                )
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # 记录错误信息
                print(f"DeepSeek API调用失败: {str(e)}")
                print(f"请求URL: {url}")
                print(f"API密钥前缀: {self.api_key[:7]}...")
                raise

    async def test_connection(self) -> Dict[str, Any]:
        """测试与DeepSeek API的连接"""
        test_message = "你好，这是一条测试消息。请回复'连接成功'。"
        
        async with httpx.AsyncClient() as client:
            endpoint = "/chat/completions"
            if self.base_url.endswith("/chat/completions"):
                url = self.base_url
            elif "/chat/completions" in self.base_url:
                url = self.base_url.split("/chat")[0] + "/chat/completions"
            else:
                base = self.base_url.rstrip('/')
                url = f"{base}{endpoint}"
                
            try:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": test_message}],
                        "temperature": 0.5,
                        "max_tokens": 50  # 限制回复长度，节省token
                    },
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                return {
                    "status": "success",
                    "message": "API连接成功",
                    "data": {
                        "model": result.get("model", "未知"),
                        "response": result.get("choices", [{}])[0].get("message", {}).get("content", "无回复")
                    }
                }
            except Exception as e:
                return {
                    "status": "error",
                    "message": f"API连接失败: {str(e)}",
                    "error_details": str(e)
                }

deepseek_service = DeepSeekService() 