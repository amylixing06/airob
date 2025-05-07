// Vercel Serverless API - 流式生成HTML端点
const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// API调用配置
const API_CONFIG = {
  timeout: 120000,  // 120秒超时
  retries: 1       // 只重试一次
};

/**
 * 流式生成HTML API端点
 */
module.exports = async (req, res) => {
  console.log('API调用: /api/v1/generator/generate-stream');
  console.log('请求方法:', req.method);
  console.log('环境检查:');
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
    res.status(200).end();
    return;
  }

  // 只接受POST请求
  if (req.method !== 'POST') {
    console.log('不支持的请求方法:', req.method);
    res.status(405).json({ error: '方法不允许' });
    return;
  }

  try {
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

    console.log(`流式生成请求: ${description}, 风格: ${style || '默认'}`);

    // 设置响应头，支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 发送初始消息 - 使用标准SSE格式
    res.write(`data: ${JSON.stringify({ type: 'status', status: 'start', message: '开始生成HTML...' })}\n\n`);
    
    try {
      // 创建提示词
      const prompt = createGenerationPrompt(description, style);
      console.log('提示词创建完成');
      
      // 发送状态更新
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'prompt_ready', message: '提示词已准备好，正在连接AI...' })}\n\n`);
      
      // 在Vercel环境中，将流式API改为非流式API，但手动模拟流式效果
      // 这样可以避免某些Vercel环境对流式响应的限制
      await simulateStreamResponse(prompt, res);
      
      // 发送结束消息
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'complete', message: '生成完成' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (apiError) {
      console.error('DeepSeek API调用失败:', apiError.message);
      const errorDetails = apiError.stack || JSON.stringify(apiError);
      console.error('错误详情:', errorDetails);
      res.write(`data: ${JSON.stringify({ type: 'error', error: `DeepSeek API调用失败: ${apiError.message}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    console.error('流式生成失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: `流式生成失败: ${error.message}`, 
      details: error.stack 
    });
  }
};

/**
 * 模拟流式响应 - 使用非流式API但分段返回结果
 * @param {string} prompt - 提示词
 * @param {object} res - 响应对象
 */
async function simulateStreamResponse(prompt, res) {
  console.log('开始模拟流式响应...');
  
  // 构建正确的URL，避免路径重复问题
  let url;
  if (DEEPSEEK_API_BASE_URL.endsWith('/chat/completions')) {
    url = DEEPSEEK_API_BASE_URL;
  } else if (DEEPSEEK_API_BASE_URL.endsWith('/v1')) {
    url = `${DEEPSEEK_API_BASE_URL}/chat/completions`;
  } else if (DEEPSEEK_API_BASE_URL.endsWith('/v1/')) {
    url = `${DEEPSEEK_API_BASE_URL}chat/completions`;
  } else {
    // 去除所有尾部斜杠
    const base = DEEPSEEK_API_BASE_URL.replace(/\/+$/, '');
    // 检查是否已包含v1路径
    if (base.endsWith('/v1') || base.includes('/v1/')) {
      url = `${base}/chat/completions`.replace('/v1/v1/', '/v1/');
    } else {
      url = `${base}/v1/chat/completions`;
    }
  }

  // 确保URL没有重复的路径段
  url = url.replace('/v1/v1/', '/v1/');

  console.log('API请求到:', url);
  console.log('使用模型:', DEEPSEEK_MODEL);
  
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
    stream: false  // 使用非流式响应
  };

  try {
    // 使用AbortController实现超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    console.log(`开始API请求，超时设置: ${API_CONFIG.timeout/1000}秒`);
    const startTime = Date.now();
    
    // 发送状态更新
    res.write(`data: ${JSON.stringify({ type: 'status', status: 'api_request', message: '正在请求AI生成内容...' })}\n\n`);
    
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
    
    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误:', errorText);
      throw new Error(`DeepSeek API错误 (${response.status}): ${errorText.substring(0, 200)}`);
    }
    
    const result = await response.json();
    console.log('API响应成功,类型:', typeof result);
    
    // 获取生成的内容
    const content = result.choices[0]?.message?.content;
    if (!content) {
      throw new Error('API响应中没有找到内容');
    }
    
    // 模拟流式响应，分段返回内容
    await simulateChunkedResponse(content, res);
    
    const elapsedTime = (Date.now() - startTime) / 1000;
    console.log(`请求完成，用时: ${elapsedTime.toFixed(2)}秒`);
    
    // 发送最终的完整HTML代码
    const html = extractCodeFromText(content);
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      html: html,
      time: elapsedTime.toFixed(2)
    })}\n\n`);
    
  } catch (error) {
    console.error('API调用失败:', error.message);
    console.error('错误详情:', error.stack || JSON.stringify(error));
    throw error;
  }
}

/**
 * 模拟分段返回内容
 * @param {string} content - 完整内容
 * @param {object} res - 响应对象
 */
async function simulateChunkedResponse(content, res) {
  console.log('开始模拟分段返回，内容长度:', content.length);
  
  // 发送状态更新
  res.write(`data: ${JSON.stringify({ type: 'status', status: 'generating', message: '正在生成HTML...' })}\n\n`);
  
  // 检查内容是否包含代码块
  const codeBlockMatch = content.match(/```(?:html)?([\s\S]*?)```/);
  let htmlContent = content;
  
  if (codeBlockMatch) {
    console.log('找到代码块，长度:', codeBlockMatch[0].length);
    // 分块发送代码块前的内容
    const beforeCodeBlock = content.substring(0, content.indexOf(codeBlockMatch[0]));
    if (beforeCodeBlock.trim()) {
      res.write(`data: ${JSON.stringify({ 
        type: 'content', 
        content: beforeCodeBlock,
        accumulatedHTML: beforeCodeBlock
      })}\n\n`);
      await sleep(300); // 模拟延迟
    }
    
    // 分块发送代码块的开头
    const codeBlockStart = "```html\n";
    res.write(`data: ${JSON.stringify({ 
      type: 'content', 
      content: codeBlockStart,
      accumulatedHTML: beforeCodeBlock + codeBlockStart
    })}\n\n`);
    await sleep(200);
    
    // 获取代码块内容并分段发送
    htmlContent = codeBlockMatch[1].trim();
  }
  
  // 将HTML内容分成多个块发送，模拟流式响应
  const chunkSize = Math.floor(Math.random() * 50) + 20; // 20-70字符一块
  let accumulated = '';
  
  for (let i = 0; i < htmlContent.length; i += chunkSize) {
    // 获取当前块
    const chunk = htmlContent.substring(i, i + chunkSize);
    accumulated += chunk;
    
    // 发送当前块
    res.write(`data: ${JSON.stringify({ 
      type: 'content', 
      content: chunk,
      accumulatedHTML: accumulated
    })}\n\n`);
    
    // 随机延迟50-200ms，模拟打字效果
    await sleep(Math.floor(Math.random() * 150) + 50);
  }
  
  // 如果有代码块，发送代码块结束标记
  if (codeBlockMatch) {
    const codeBlockEnd = "\n```";
    res.write(`data: ${JSON.stringify({ 
      type: 'content', 
      content: codeBlockEnd,
      accumulatedHTML: accumulated + codeBlockEnd
    })}\n\n`);
  }
  
  console.log('模拟分段返回完成');
}

/**
 * 等待指定的毫秒数
 * @param {number} ms - 毫秒数
 * @returns {Promise} - Promise对象
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 从文本中提取HTML代码
 * @param {string} text - 含有代码的文本
 * @returns {string} - 提取的HTML代码
 */
function extractCodeFromText(text) {
  try {
    // 尝试提取代码块中的HTML
    const htmlCodeBlockRegex = /```(?:html)?([\s\S]*?)```/;
    const codeBlockMatch = text.match(htmlCodeBlockRegex);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
    }
    
    // 尝试查找是否有HTML标签
    const docTypeMatch = text.match(/<\!DOCTYPE html>[\s\S]*/i);
    if (docTypeMatch) {
      return docTypeMatch[0].trim();
    }
    
    const htmlTagMatch = text.match(/<html[\s\S]*<\/html>/i);
    if (htmlTagMatch) {
      return htmlTagMatch[0].trim();
    }

    // 如果没有找到HTML格式，但内容看起来像HTML
    if (text.includes('<body') || (text.includes('<div') && text.includes('</div>'))) {
      return text.trim();
    }

    // 如果没有代码块，直接返回内容
    return text.trim();
  } catch (error) {
    console.error('提取HTML失败:', error);
    return text;
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