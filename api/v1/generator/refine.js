// Vercel Serverless API - 优化HTML端点
const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
// 修正DeepSeek API基础URL和模型名称
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
// 使用正确的DeepSeek模型名称
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// API调用配置
const API_CONFIG = {
  timeout: 120000,  // 增加到120秒超时
  retries: 3,      // 增加到3次重试
  retryDelay: 5000 // 重试间隔5秒
};

/**
 * 优化HTML API端点
 */
module.exports = async (req, res) => {
  console.log('API调用: /api/v1/generator/refine');
  console.log('请求方法:', req.method);
  
  // 允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    res.status(405).json({ error: '方法不允许' });
    return;
  }

  try {
    const { originalHtml, instructions } = req.body;

    if (!originalHtml || !instructions) {
      res.status(400).json({ error: '缺少必要参数' });
      return;
    }

    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API密钥未配置');
      res.status(500).json({ error: 'API配置错误: DeepSeek API密钥未配置' });
      return;
    }

    console.log(`优化请求: ${instructions}`);

    try {
      // 创建提示词
      const prompt = createRefinementPrompt(originalHtml, instructions);

      // 调用DeepSeek API
      console.log('准备调用DeepSeek API进行优化');
      const response = await callDeepSeekAPIWithRetry(prompt);
      console.log('DeepSeek API响应成功');

      // 提取HTML代码
      const html = extractHtmlFromResponse(response);
      console.log('成功提取优化后的HTML代码，长度:', html.length);

      res.status(200).json({ html });
    } catch (apiError) {
      console.error('DeepSeek API优化调用失败:', apiError.message);
      res.status(502).json({ 
        error: `DeepSeek API优化调用失败: ${apiError.message}`,
        details: apiError.details
      });
    }
  } catch (error) {
    console.error('优化页面失败:', error);
    res.status(500).json({ 
      error: `优化失败: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * 带重试机制的DeepSeek API调用
 * @param {string} prompt - 提示词
 * @param {number} retries - 剩余重试次数
 * @returns {object} - API响应
 */
async function callDeepSeekAPIWithRetry(prompt, retries = API_CONFIG.retries) {
  try {
    return await callDeepSeekAPI(prompt);
  } catch (error) {
    if (retries > 0) {
      console.log(`API调用失败，${API_CONFIG.retryDelay/1000}秒后重试...剩余重试次数: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return callDeepSeekAPIWithRetry(prompt, retries - 1);
    }
    // 无重试次数，抛出异常
    throw error;
  }
}

/**
 * 调用DeepSeek API
 * @param {string} prompt - 提示词
 * @returns {object} - API响应
 */
async function callDeepSeekAPI(prompt) {
  // 确保使用正确的API端点路径
  const url = `${DEEPSEEK_API_BASE_URL}/v1/chat/completions`;

  console.log('API信息检查:');
  console.log('- DeepSeek API URL:', url);
  console.log('- DeepSeek 模型:', DEEPSEEK_MODEL);
  console.log('- API密钥配置状态:', DEEPSEEK_API_KEY ? '已配置' : '未配置');
  
  const body = {
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: "system",
        content: "你是一个专业的前端开发者，擅长优化HTML网页代码。请直接返回代码，不要有多余的解释。"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.5,
    max_tokens: 4000,
    stream: false
  };

  console.log('调用DeepSeek API:', url);
  console.log('请求体:', JSON.stringify(body).substring(0, 200) + '...');

  try {
    // 使用AbortController实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    // 清除超时计时器
    clearTimeout(timeoutId);

    console.log('DeepSeek API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误:', errorText);
      throw {
        message: `DeepSeek API错误 (${response.status})`,
        details: errorText,
        status: response.status
      };
    }

    const data = await response.json();
    console.log('DeepSeek API响应成功, 数据类型:', typeof data);
    console.log('API响应结构:', JSON.stringify(data).substring(0, 200) + '...');
    return data;
  } catch (error) {
    // 判断是否为超时错误
    if (error.name === 'AbortError') {
      console.error('DeepSeek API请求超时');
      throw {
        message: '请求超时',
        details: '超过了60秒等待时间',
        status: 408
      };
    }
    
    console.error('调用DeepSeek API失败:', error.message || error);
    throw error.details ? error : {
      message: `调用失败: ${error.message || '未知错误'}`,
      details: error.stack || error,
      status: error.status || 500
    };
  }
}

/**
 * 从DeepSeek响应中提取HTML代码
 * @param {object} response - DeepSeek API响应
 * @returns {string} - 提取的HTML代码
 */
function extractHtmlFromResponse(response) {
  try {
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('API响应中没有内容');
    }

    // 尝试提取代码块中的HTML
    const codeBlockMatch = content.match(/```(?:html)?([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }

    // 如果没有代码块，直接返回内容
    return content;
  } catch (error) {
    console.error('提取HTML失败:', error);
    throw new Error('无法从API响应中提取HTML代码');
  }
}

/**
 * 创建优化HTML的提示词
 * @param {string} originalHtml - 原始HTML代码
 * @param {string} instructions - 优化指令
 * @returns {string} - 生成的提示词
 */
function createRefinementPrompt(originalHtml, instructions) {
  return `我需要你优化以下HTML代码，根据这些指令：${instructions}

原始HTML代码：
\`\`\`html
${originalHtml}
\`\`\`

请基于上述指令，优化这段HTML代码。保留原始代码的结构，只修改需要改进的部分。
返回完整的HTML代码，不需要解释你做了哪些修改。HTML代码应该放在markdown代码块中，如下所示：

\`\`\`html
<!DOCTYPE html>
<html>
...优化后的代码...
</html>
\`\`\``;
} 