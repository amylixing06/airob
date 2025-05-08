/**
 * 直接测试DeepSeek流式API
 */
const fetch = require('node-fetch');

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-2b5d6bf0fe8a44a3834ae12e3951258a';
const DEEPSEEK_API_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

async function testDeepSeekStreamAPI() {
  console.log('测试DeepSeek流式API...');
  console.log(`基础URL: ${DEEPSEEK_API_BASE_URL}`);
  console.log(`模型: ${DEEPSEEK_MODEL}`);
  
  const url = `${DEEPSEEK_API_BASE_URL}/chat/completions`;
  console.log(`完整请求URL: ${url}`);
  
  // 简单的请求体
  const body = {
    model: DEEPSEEK_MODEL,
    messages: [
      {
        role: "system",
        content: "你是一个简洁的助手"
      },
      {
        role: "user",
        content: "用HTML创建一个简单的登录页面"
      }
    ],
    temperature: 0.7,
    max_tokens: 300,
    stream: true  // 启用流式返回
  };
  
  try {
    console.log('发送请求...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    console.log(`状态码: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API错误: ${response.status}`);
      console.error(errorText);
      return;
    }
    
    console.log('成功连接，开始接收流式响应...');
    console.log('--------- 原始响应内容 ---------');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let rawOutput = '';
    let totalChunks = 0;
    
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('流式传输结束');
        break;
      }
      
      totalChunks++;
      const chunk = decoder.decode(value, { stream: true });
      
      // 显示原始数据
      console.log(`\n--- 块 #${totalChunks} (${value.length} 字节) ---`);
      console.log(chunk.replace(/\n/g, '\\n'));
      
      rawOutput += chunk;
    }
    
    console.log('\n--------- 结束流式响应 ---------');
    console.log(`总计 ${totalChunks} 个数据块`);
    console.log('\n解析所有数据块:');
    
    // 解析所有数据行
    let parsedContent = '';
    const lines = rawOutput.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data:') && line.trim() !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.substring(line.indexOf(':') + 1).trim());
          
          if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
            parsedContent += data.choices[0].delta.content;
          }
        } catch (e) {
          console.log(`无法解析行: ${line}`);
        }
      }
    }
    
    console.log('\n合并后的内容:');
    console.log(parsedContent);
    
  } catch (error) {
    console.error('请求失败:', error.message);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
  }
}

testDeepSeekStreamAPI(); 