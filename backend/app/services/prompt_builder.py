def build_prompt(user_input: dict) -> str:
    return f"""
    生成一个{user_input.get('industry', '科技')}行业的{user_input.get('pageType', '落地')}页面，要求:
    - 主要卖点: {', '.join(user_input.get('keyFeatures', []))}
    - 风格: {user_input.get('style', '现代')}
    - 配色: {user_input.get('colorScheme', '#2563eb,#1e40af')}
    - 包含以下区块: 导航栏、英雄区(主视觉)、产品功能、客户评价、联系方式
    - 使用现代、响应式设计
    - 生成完整HTML代码，包含内联CSS和移动端适配
    """ 