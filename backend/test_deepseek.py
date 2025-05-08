#!/usr/bin/env python
import asyncio
import os
import json
from dotenv import load_dotenv
import httpx

# 加载环境变量
load_dotenv()

# 获取API密钥和基础URL
api_key = os.getenv("DEEPSEEK_API_KEY")
base_url = os.getenv("DEEPSEEK_API_BASE_URL", "https://api.deepseek.com")

# 如果未设置，则使用测试API密钥（仅用于测试）
if not api_key:
    print("警告: 未找到环境变量DEEPSEEK_API_KEY，请确保配置正确")
    exit(1)

async def test_deepseek_api():
    """测试DeepSeek API连接"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # 构建请求URL
    endpoint = "/chat/completions"
    if base_url.endswith("/chat/completions"):
        url = base_url
    elif "/chat/completions" in base_url:
        url = base_url.split("/chat")[0] + "/chat/completions"
    else:
        base = base_url.rstrip('/')
        url = f"{base}{endpoint}"
    
    # 创建一个简单的测试消息
    test_message = "你好，这是一条测试消息。请用一句话回复。"
    
    print(f"正在测试DeepSeek API连接...")
    print(f"API URL: {url}")
    print(f"API密钥前缀: {api_key[:7]}...")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": test_message}],
                    "temperature": 0.5,
                    "max_tokens": 50  # 限制回复长度，节省token
                },
                timeout=30.0
            )
            
            # 打印完整响应状态
            print(f"响应状态码: {response.status_code}")
            
            # 尝试解析JSON响应
            if response.status_code == 200:
                result = response.json()
                print(f"API连接成功!")
                print(f"模型: {result.get('model', '未知')}")
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '无回复')
                print(f"回复: {content}")
                print(f"详细响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
                return True
            else:
                print(f"API请求失败，状态码: {response.status_code}")
                print(f"错误信息: {response.text}")
                return False
                
    except Exception as e:
        print(f"API连接异常: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_deepseek_api()) 