const fetch = require('node-fetch');

// 替换为您的实际API密钥
const DEEPSEEK_API_KEY = 'sk-2b5d6bf0fe8a44a3834ae12e3951258a'; // 注意：这只是用于临时测试

async function testDeepSeekAPI() {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  
  console.log('测试DeepSeek API连接...');
  
  const body = {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是一个帮助助手，请简短回答。'
      },
      {
        role: 'user',
        content: '你好，请用一句话自我介绍'
      }
    ],
    temperature: 0.5,
    max_tokens: 100,
    stream: false
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    console.log('API响应状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API响应成功!');
    console.log('响应数据:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('API调用失败:', error);
  }
}

testDeepSeekAPI();

/**
 * 测试DeepSeek API URL构建逻辑
 */

const DEEPSEEK_API_BASE_URL_VARIANTS = [
  'https://api.deepseek.com',
  'https://api.deepseek.com/',
  'https://api.deepseek.com/v1',
  'https://api.deepseek.com/v1/',
  'https://api.deepseek.com/v1/chat/completions'
];

function buildCorrectUrl(baseUrl) {
  let url;
  if (baseUrl.endsWith('/chat/completions')) {
    url = baseUrl;
  } else if (baseUrl.endsWith('/v1')) {
    url = `${baseUrl}/chat/completions`;
  } else if (baseUrl.endsWith('/v1/')) {
    url = `${baseUrl}chat/completions`;
  } else {
    // 去除所有尾部斜杠
    const base = baseUrl.replace(/\/+$/, '');
    // 检查是否已包含v1路径
    if (base.endsWith('/v1') || base.includes('/v1/')) {
      url = `${base}/chat/completions`.replace('/v1/v1/', '/v1/');
    } else {
      url = `${base}/v1/chat/completions`;
    }
  }

  // 确保URL没有重复的路径段
  url = url.replace('/v1/v1/', '/v1/');
  
  return url;
}

// 测试所有变体
console.log('测试DeepSeek API URL构建逻辑:');
console.log('============================');

DEEPSEEK_API_BASE_URL_VARIANTS.forEach(baseUrl => {
  const finalUrl = buildCorrectUrl(baseUrl);
  console.log(`输入: ${baseUrl}`);
  console.log(`输出: ${finalUrl}`);
  console.log('----------------------------');
});

console.log('测试完成！'); 