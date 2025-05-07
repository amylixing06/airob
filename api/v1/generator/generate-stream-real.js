// Vercel Serverless API - 真实流式生成HTML端点
const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// API调用配置
const API_CONFIG = {
  timeout: 280000,          // 280秒超时 (给Vercel 300秒上限留出缓冲)
  safeMaxGenerationTime: 240000,  // 强制在240秒时结束生成 (4分钟)
  retries: 1                // 只重试一次
};

/**
 * 真实流式生成HTML API端点
 */
module.exports = async (req, res) => {
  console.log('API调用: /api/v1/generator/generate-stream-real');
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

    console.log(`真实流式生成请求: ${description}, 风格: ${style || '默认'}`);

    // 设置响应头，支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 发送初始消息
    res.write(`data: ${JSON.stringify({ type: 'status', status: 'start', message: '开始生成HTML...' })}\n\n`);
    
    try {
      // 创建提示词
      const prompt = createGenerationPrompt(description, style);
      console.log('提示词创建完成');
      
      // 发送状态更新
      res.write(`data: ${JSON.stringify({ type: 'status', status: 'prompt_ready', message: '提示词已准备好，正在连接AI...' })}\n\n`);
      
      // 使用真实的流式API
      await handleRealTimeStream(prompt, res);
      
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
 * 处理真实的流式API响应
 * @param {string} prompt - 提示词
 * @param {object} res - 响应对象
 */
async function handleRealTimeStream(prompt, res) {
  console.log('开始真实流式响应...');
  
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
        content: "你是一个专业的前端开发者，擅长生成高质量且简洁的HTML网页代码。请直接生成代码，不要有任何多余的解释。保持代码简短高效。"
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,  // 略微提高创造性
    max_tokens: 2500,  // 减少最大token，避免过长生成
    stream: true       // 流式响应
  };

  try {
    // 使用AbortController实现超时
    const controller = new AbortController();
    
    // 在外部保存累积的HTML，以便在超时时能访问
    let savedAccumulatedHTML = '';
    let lastUpdateTime = Date.now();
    
    // 设置主超时
    const timeoutId = setTimeout(() => {
      console.log('API调用超时，正常中止生成过程');
      controller.abort();
    }, API_CONFIG.timeout);
    
    // 添加安全超时，防止生成时间过长
    const safetyTimeoutId = setTimeout(() => {
      console.log(`达到安全超时限制 (${API_CONFIG.safeMaxGenerationTime/1000}秒)，强制结束生成`);
      
      // 尝试发送到目前为止生成的内容
      try {
        if (savedAccumulatedHTML) {
          const elapsedTime = (Date.now() - startTime) / 1000;
          const html = extractCodeFromText(savedAccumulatedHTML);
          
          // 发送生成被打断的消息
          res.write(`data: ${JSON.stringify({ 
            type: 'status', 
            status: 'interrupted',
            message: '生成时间过长，已返回部分生成的内容'
          })}\n\n`);
          
          // 发送部分生成的内容
          res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            html: html,
            time: elapsedTime.toFixed(2),
            isPartial: true
          })}\n\n`);
          
          res.write('data: [DONE]\n\n');
        }
      } catch (e) {
        console.error('超时发送部分结果失败:', e);
      }
      
      controller.abort();
    }, API_CONFIG.safeMaxGenerationTime);
    
    console.log(`开始API请求，超时设置: ${API_CONFIG.timeout/1000}秒, 安全超时: ${API_CONFIG.safeMaxGenerationTime/1000}秒`);
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
    
    // 检查响应状态
    if (!response.ok) {
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
      const errorText = await response.text();
      console.error('DeepSeek API错误:', errorText);
      throw new Error(`DeepSeek API错误 (${response.status}): ${errorText.substring(0, 200)}`);
    }
    
    // 发送状态更新
    res.write(`data: ${JSON.stringify({ type: 'status', status: 'generating', message: '正在实时生成HTML...' })}\n\n`);

    // 直接转发原始流式响应
    const streamDeepSeekToClient = async () => {
      let accumulatedHTML = '';
      let buffer = '';
      
      try {
        const reader = response.body.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // 流结束
            console.log('DeepSeek流结束');
            break;
          }
          
          // 更新最后活动时间
          lastUpdateTime = Date.now();
          
          // 解码这一块数据
          const chunk = new TextDecoder().decode(value, { stream: true });
          buffer += chunk;
          
          // 处理缓冲区中的完整数据行
          let lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行
          
          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data:')) continue;
            
            if (line.includes('[DONE]')) {
              // 发送完成标记 (会在外部再次发送)
              continue;
            }
            
            try {
              // 解析DeepSeek返回的数据
              const data = JSON.parse(line.substring(line.indexOf(':') + 1).trim());
              
              if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                const textChunk = data.choices[0].delta.content;
                accumulatedHTML += textChunk;
                
                // 保存当前累积的内容，以便在超时时能访问
                savedAccumulatedHTML = accumulatedHTML;
                
                // 将每个块立即发送给客户端
                res.write(`data: ${JSON.stringify({
                  type: 'content',
                  content: textChunk,
                  accumulatedHTML: accumulatedHTML
                })}\n\n`);
                
                // 确保数据被立即发送
                if (res.flush) {
                  res.flush();
                }
              }
            } catch (e) {
              console.error('解析DeepSeek事件失败:', e, line);
            }
          }
        }
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log(`流式生成完成，用时: ${elapsedTime.toFixed(2)}秒`);
        
        // 提取完整HTML
        const html = extractCodeFromText(accumulatedHTML);
        
        // 发送完成事件
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          html: html,
          time: elapsedTime.toFixed(2)
        })}\n\n`);
        
        return { success: true, html, time: elapsedTime };
      } catch (error) {
        // 如果是中止错误，并且我们有部分生成的内容，返回部分内容
        if (error.name === 'AbortError' && savedAccumulatedHTML) {
          const elapsedTime = (Date.now() - startTime) / 1000;
          const html = extractCodeFromText(savedAccumulatedHTML);
          
          console.log(`生成被中止，但返回部分内容 (${html.length} 字符)`);
          
          // 已经在安全超时处理程序中发送了部分内容，所以这里不重复发送
          return { success: false, html, time: elapsedTime, interrupted: true };
        }
        
        console.error('流式处理中断:', error);
        throw error;
      } finally {
        clearTimeout(timeoutId);
        clearTimeout(safetyTimeoutId);
      }
    };
    
    // 执行流式传输
    await streamDeepSeekToClient();
    
  } catch (error) {
    console.error('API调用失败:', error.message);
    console.error('错误详情:', error.stack || JSON.stringify(error));
    throw error;
  }
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

  return `请创建一个简洁高效的HTML网页，满足以下要求：
1. 页面描述：${description}
2. 设计风格：${styleDescription}
3. 确保HTML代码完整可运行，但要保持简洁
4. 页面应该是响应式的，使用最少代码实现
5. 使用简洁的HTML5和CSS3
6. 代码尽量简短，优先减少生成时间
7. 避免过于复杂的动画和特效

请直接返回HTML代码，不要有任何解释。尽量减少注释和空行，使代码更精简。
代码请放在markdown代码块中：

\`\`\`html
<!DOCTYPE html>
<html>
...简洁的代码...
</html>
\`\`\``;
} 