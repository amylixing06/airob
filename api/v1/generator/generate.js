// Vercel Serverless API - 生成HTML端点
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
 * 生成HTML API端点
 */
module.exports = async (req, res) => {
  console.log('API调用: /api/v1/generator/generate');
  console.log('请求方法:', req.method);
  console.log('环境变量检查:');
  console.log('- DEEPSEEK_API_KEY 配置:', DEEPSEEK_API_KEY ? '已配置' : '未配置');
  console.log('- DEEPSEEK_API_BASE_URL:', DEEPSEEK_API_BASE_URL);
  console.log('- DEEPSEEK_MODEL:', DEEPSEEK_MODEL);

  // 允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    console.log('处理OPTIONS请求');
    res.status(200).end();
    return;
  }

  // 处理HEAD请求 (API连接测试)
  if (req.method === 'HEAD') {
    console.log('处理HEAD请求 (API连接测试)');
    res.status(200).end();
    return;
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    console.log('不支持的请求方法:', req.method);
    res.status(405).json({ error: '方法不允许', method: req.method });
    return;
  }

  try {
    // 检查请求体
    console.log('请求体:', req.body);
    
    const { description, style } = req.body || {};

    if (!description) {
      console.log('缺少页面描述参数');
      res.status(400).json({ error: '缺少页面描述参数' });
      return;
    }

    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API密钥未配置');
      res.status(500).json({ error: 'API配置错误: DeepSeek API密钥未配置' });
      return;
    }

    console.log(`生成请求: ${description}, 风格: ${style || '默认'}`);

    // 使用DeepSeek API生成HTML
    try {
      // 创建提示词
      const prompt = createGenerationPrompt(description, style);
      console.log('提示词创建完成');

      // 调用DeepSeek API
      console.log('准备调用DeepSeek API');
      const response = await callDeepSeekAPIWithRetry(prompt);
      console.log('DeepSeek API响应成功');

      // 提取HTML代码
      const html = extractHtmlFromResponse(response);
      console.log('成功提取HTML代码，长度:', html.length);

      res.status(200).json({ html });
    } catch (apiError) {
      console.error('DeepSeek API调用失败:', apiError.message);
      res.status(502).json({ 
        error: `DeepSeek API调用失败: ${apiError.message}`,
        details: apiError.details
      });
    }
  } catch (error) {
    console.error('生成页面失败:', error);
    res.status(500).json({ 
      error: `生成失败: ${error.message}`,
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
  let url;
  
  // 根据base_url构建正确的URL
  if (DEEPSEEK_API_BASE_URL.endsWith('/chat/completions')) {
    url = DEEPSEEK_API_BASE_URL;
  } else if (DEEPSEEK_API_BASE_URL.endsWith('/v1')) {
    url = `${DEEPSEEK_API_BASE_URL}/chat/completions`;
  } else if (DEEPSEEK_API_BASE_URL.endsWith('/v1/')) {
    url = `${DEEPSEEK_API_BASE_URL}chat/completions`;
  } else {
    // 去除尾部斜杠
    const base = DEEPSEEK_API_BASE_URL.replace(/\/+$/, '');
    url = `${base}/v1/chat/completions`;
  }

  console.log('\n==== DeepSeek API请求详情 ====');
  console.log('- DeepSeek API URL:', url);
  console.log('- DeepSeek 模型:', DEEPSEEK_MODEL);
  console.log('- API密钥配置状态:', DEEPSEEK_API_KEY ? '已配置' : '未配置');
  console.log('- API密钥前缀:', DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 7) + '...' : '无');
  
  const body = {
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: "system",
        content: "你是一个专业的前端开发者，擅长生成高质量的HTML网页代码。请直接返回代码，不要有多余的解释。"
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
  console.log('请求体主要内容:');
  console.log(JSON.stringify(body, null, 2).substring(0, 500) + '...');

  try {
    // 使用AbortController实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    console.log(`开始API请求，超时设置: ${API_CONFIG.timeout/1000}秒`);
    const startTime = Date.now();
    
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
    const elapsedTime = (Date.now() - startTime) / 1000;
    
    console.log(`DeepSeek API响应状态: ${response.status}，用时: ${elapsedTime.toFixed(2)}秒`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误详情:');
      console.error(errorText);
      throw {
        message: `DeepSeek API错误 (${response.status})`,
        details: errorText,
        status: response.status
      };
    }

    const data = await response.json();
    console.log('DeepSeek API响应成功, 数据类型:', typeof data);
    console.log('API响应结构片段:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    console.log('==== DeepSeek API请求完成 ====\n');
    return data;
  } catch (error) {
    // 判断是否为超时错误
    if (error.name === 'AbortError') {
      console.error('DeepSeek API请求超时');
      throw {
        message: '请求超时',
        details: `超过了${API_CONFIG.timeout/1000}秒等待时间`,
        status: 408
      };
    }
    
    console.error('调用DeepSeek API失败:', error.message || error);
    console.log('==== DeepSeek API请求失败 ====\n');
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
    console.log('解析DeepSeek响应...');
    const content = response.choices && response.choices[0]?.message?.content;

    if (!content) {
      console.error('API响应中没有找到内容:', JSON.stringify(response).substring(0, 200));
      throw new Error('API响应中没有内容');
    }

    console.log(`收到内容长度: ${content.length}字符`);
    console.log('内容预览:', content.substring(0, 300) + '...');

    // 尝试提取代码块中的HTML
    const htmlCodeBlockRegex = /```(?:html)?([\s\S]*?)```/;
    const codeBlockMatch = content.match(htmlCodeBlockRegex);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      console.log('找到HTML代码块，提取内容');
      return codeBlockMatch[1].trim();
    }
    
    // 尝试查找是否有HTML标签
    const docTypeMatch = content.match(/<\!DOCTYPE html>[\s\S]*/i);
    if (docTypeMatch) {
      console.log('找到DOCTYPE声明，提取HTML');
      return docTypeMatch[0].trim();
    }
    
    const htmlTagMatch = content.match(/<html[\s\S]*<\/html>/i);
    if (htmlTagMatch) {
      console.log('找到HTML标签，提取HTML');
      return htmlTagMatch[0].trim();
    }

    // 如果没有找到HTML格式，但内容看起来像HTML
    if (content.includes('<body') || (content.includes('<div') && content.includes('</div>'))) {
      console.log('内容包含HTML元素，返回整个内容');
      return content.trim();
    }

    // 如果没有代码块，直接返回内容
    console.log('未检测到特殊HTML格式，返回原始内容');
    return content;
  } catch (error) {
    console.error('提取HTML失败:', error);
    throw new Error('无法从API响应中提取HTML代码');
  }
}

/**
 * 创建生成HTML的提示词
 * @param {string} description - 页面描述
 * @param {string} style - 页面风格
 * @returns {string} - 生成的提示词
 */
function createGenerationPrompt(description, style) {
  let styleDescription = '';

  switch (style) {
    case 'modern':
      styleDescription = '现代简约风格，使用扁平化设计，简洁的布局和大方的留白';
      break;
    case 'corporate':
      styleDescription = '企业商务风格，专业严谨，使用蓝色等商务色调';
      break;
    case 'creative':
      styleDescription = '创意设计风格，使用大胆的色彩和创新的布局';
      break;
    case 'minimal':
      styleDescription = '极简风格，减少视觉干扰，专注内容呈现';
      break;
    case 'tech':
      styleDescription = '科技风格，使用深色背景和霓虹色调，现代感强';
      break;
    default:
      styleDescription = '现代简约风格';
  }

  return `请创建一个完整的HTML网页，满足以下要求：
1. 页面描述：${description}
2. 设计风格：${styleDescription}
3. 确保HTML代码完整可运行，包含所有必要的CSS和JavaScript
4. 页面应该是响应式的，在移动设备上也能正常显示
5. 使用现代的HTML5和CSS3特性
6. 不要使用任何外部库或框架，所有代码都应该内联在HTML文件中
7. 为代码添加适当的注释

请直接返回HTML代码，不要包含任何解释或说明。HTML代码应该放在markdown代码块中，如下所示：

\`\`\`html
<!DOCTYPE html>
<html>
...你的代码...
</html>
\`\`\``;
} 