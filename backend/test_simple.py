#!/usr/bin/env python3
import os
import json
import urllib.request
import urllib.error

# DeepSeek API配置
API_KEY = "sk-2b5d6bf0fe8a44a3834ae12e3951258a"  # 这里填入您的API密钥
BASE_URL = "https://api.deepseek.com/v1/chat/completions"

def test_deepseek_api():
    """测试DeepSeek API连接"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 创建一个简单的测试消息
    data = json.dumps({
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": "你好，这是一条测试消息。请回复'连接成功'。"}],
        "temperature": 0.5,
        "max_tokens": 50  # 限制回复长度，节省token
    }).encode('utf-8')
    
    print(f"正在测试DeepSeek API连接...")
    print(f"API URL: {BASE_URL}")
    
    try:
        req = urllib.request.Request(BASE_URL, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=30) as response:
            # 打印响应
            response_data = response.read().decode('utf-8')
            result = json.loads(response_data)
            
            print(f"API连接成功!")
            print(f"模型: {result.get('model', '未知')}")
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '无回复')
            print(f"回复: {content}")
            # print(f"详细响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
            return True
                
    except urllib.error.HTTPError as e:
        print(f"API请求失败，HTTP错误: {e.code}")
        print(f"错误信息: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"API连接异常: {str(e)}")
        return False

if __name__ == "__main__":
    test_deepseek_api() 