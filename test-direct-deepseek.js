const fetch = require('node-fetch');

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-2b5d6bf0fe8a44a3834ae12e3951258a';
const DEEPSEEK_MODEL = 'deepseek-chat';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 简单的测试消息
const TEST_MESSAGES = [
  { role: 'system', content: '请简短回答' },
  { role: 'user', content: '你好，用一句话介绍自己' }
];

async function testDirectDeepSeek() {
  console.log('=== 直接测试 DeepSeek API ===');
  console.log(`URL: ${DEEPSEEK_API_URL}`);
  console.log(`模型: ${DEEPSEEK_MODEL}`);
  console.log(`API密钥前缀: ${DEEPSEEK_API_KEY.substring(0, 7)}...`);
  
  try {
    console.log('\n发送测试请求...');
    const startTime = Date.now();
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: TEST_MESSAGES,
        temperature: 0.5,
        max_tokens: 50,
        stream: false
      })
    });
    
    const elapsedTime = (Date.now() - startTime) / 1000;
    console.log(`响应状态: ${response.status} (用时: ${elapsedTime.toFixed(2)}秒)`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`请求失败: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('\n响应数据:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('\n回复内容:');
      console.log(data.choices[0].message.content);
    }
  } catch (error) {
    console.error(`请求错误: ${error.message}`);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testDirectDeepSeek(); 