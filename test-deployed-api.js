/**
 * 测试Vercel已部署的API
 */
const fetch = require('node-fetch');

// 部署的基础URL - 替换为实际的Vercel部署URL
const DEPLOYED_BASE_URL = 'https://airob.vercel.app';

async function testDeployedAPI() {
  console.log('测试已部署的API...');
  console.log(`基础URL: ${DEPLOYED_BASE_URL}`);

  // 1. 测试状态API
  try {
    console.log('\n1. 测试状态API...');
    const statusResponse = await fetch(`${DEPLOYED_BASE_URL}/api/v1/status`);
    
    console.log(`状态API响应码: ${statusResponse.status}`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('状态API响应:', JSON.stringify(statusData, null, 2));
    } else {
      console.error('状态API错误:', await statusResponse.text());
    }
  } catch (error) {
    console.error('状态API请求失败:', error.message);
  }

  // 2. 测试普通生成API
  try {
    console.log('\n2. 测试普通生成API...');
    const generateResponse = await fetch(`${DEPLOYED_BASE_URL}/api/v1/generator/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: '测试简单页面',
        style: 'modern'
      })
    });
    
    console.log(`普通生成API响应码: ${generateResponse.status}`);
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('生成API响应成功!');
      console.log('生成的HTML长度:', generateData.html?.length || 0);
    } else {
      console.error('普通生成API错误:', await generateResponse.text());
    }
  } catch (error) {
    console.error('普通生成API请求失败:', error.message);
  }

  // 3. 测试流式生成API
  try {
    console.log('\n3. 测试流式生成API...');
    const streamResponse = await fetch(`${DEPLOYED_BASE_URL}/api/v1/generator/generate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: '测试简单页面(流式)',
        style: 'modern'
      })
    });
    
    console.log(`流式生成API响应码: ${streamResponse.status}`);
    
    if (!streamResponse.ok) {
      console.error('流式生成API错误:', await streamResponse.text());
      return;
    }
    
    console.log('流式生成API连接成功，接收中...');
    
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    let receivedChunks = 0;
    
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('流式传输完成');
        break;
      }
      
      receivedChunks++;
      const chunk = decoder.decode(value);
      const events = chunk.split('\n\n').filter(e => e.trim().startsWith('data:'));
      
      console.log(`收到第${receivedChunks}个数据块，包含${events.length}个事件`);
      
      for (const event of events) {
        if (!event.trim()) continue;
        
        const dataStr = event.substring(event.indexOf('data:') + 5).trim();
        if (dataStr === '[DONE]') {
          console.log('收到结束标记');
          continue;
        }
        
        try {
          const data = JSON.parse(dataStr);
          
          if (data.type === 'status') {
            console.log(`状态: ${data.status} - ${data.message}`);
          } else if (data.type === 'complete') {
            console.log(`完成: HTML长度=${data.html.length}字符, 用时=${data.time}秒`);
          } else if (data.type === 'error') {
            console.error(`错误: ${data.error}`);
          }
        } catch (error) {
          console.error('解析事件数据失败:', error.message);
          if (dataStr.length < 200) {
            console.error('原始数据:', dataStr);
          } else {
            console.error('原始数据太长，省略显示');
          }
        }
      }
    }
  } catch (error) {
    console.error('流式生成API请求失败:', error.message);
  }
}

testDeployedAPI(); 