#!/usr/bin/env python3
import asyncio
import os
import json
import sys

# 添加当前目录到Python路径，以便导入app包
sys.path.insert(0, os.path.abspath('.'))

# 设置必要的环境变量
os.environ["DEEPSEEK_API_KEY"] = "sk-2b5d6bf0fe8a44a3834ae12e3951258a"
os.environ["DEEPSEEK_API_BASE_URL"] = "https://api.deepseek.com"
os.environ["SECRET_KEY"] = "test_secret_key_for_development_only"

async def test_deepseek_service():
    """测试DeepSeek服务"""
    try:
        # 导入服务
        from app.services.deepseek import deepseek_service
        
        print("开始测试DeepSeek服务的API连接...")
        
        # 测试连接
        result = await deepseek_service.test_connection()
        
        if result['status'] == 'success':
            print(f"服务测试成功！")
            print(f"状态: {result['status']}")
            print(f"消息: {result['message']}")
            print(f"模型: {result['data']['model']}")
            print(f"回复: {result['data']['response']}")
            return True
        else:
            print(f"服务测试失败!")
            print(f"状态: {result['status']}")
            print(f"错误信息: {result['message']}")
            print(f"详细错误: {result.get('error_details', '无')}")
            return False
                
    except Exception as e:
        print(f"测试过程发生异常: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_deepseek_service()) 