// Vercel Serverless API - 状态检查端点

/**
 * 状态检查API端点
 */
module.exports = async (req, res) => {
  // 允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只接受GET请求
  if (req.method !== 'GET') {
    res.status(405).json({ error: '方法不允许' });
    return;
  }

  const deepseekConfigured = Boolean(process.env.DEEPSEEK_API_KEY);

  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apis: {
      deepseek: {
        configured: deepseekConfigured,
        baseUrl: deepseekConfigured ? '已配置' : '未配置'
      }
    }
  });
}; 