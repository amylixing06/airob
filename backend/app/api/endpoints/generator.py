from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from ...services.deepseek import deepseek_service
from ...core.security import create_access_token
from datetime import timedelta
from ...core.config import settings

router = APIRouter()

@router.post("/generate")
async def generate_page(request: Dict[str, Any]) -> Dict[str, Any]:
    """生成落地页"""
    try:
        # 构建提示词
        prompt = f"""
        行业: {request.get('industry', 'tech')}
        风格: {request.get('style', 'modern')}
        主要功能: {request.get('features', '')}
        配色方案: {request.get('colorScheme', 'blue')}
        """
        
        # 调用DeepSeek API
        response = await deepseek_service.generate_page(
            prompt=prompt,
            style=request.get('style', 'modern')
        )
        
        # 提取生成的HTML内容
        generated_html = response['choices'][0]['message']['content']
        
        return {
            "html": generated_html,
            "css": "",  # 可以从HTML中提取
            "js": ""    # 可以从HTML中提取
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_page(request: Dict[str, Any]) -> Dict[str, Any]:
    """优化落地页"""
    try:
        response = await deepseek_service.refine_page(
            original_html=request['originalHtml'],
            instructions=request['instructions']
        )
        
        refined_html = response['choices'][0]['message']['content']
        
        return {
            "html": refined_html,
            "css": "",  # 可以从HTML中提取
            "js": ""    # 可以从HTML中提取
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 