const fetch = require('node-fetch');

// 测试Serverless函数API
async function testServerlessApi() {
  console.log('=== 测试Serverless API ===');
  
  // 测试状态API
  console.log('\n1. 测试状态API...');
  try {
    const statusResponse = await fetch('http://localhost:3000/api/v1/status');
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
  
  // 测试生成API
  console.log('\n2. 测试生成API...');
  try {
    const generateResponse = await fetch('http://localhost:3000/api/v1/generator/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: '简单的登录页面',
        style: 'modern'
      })
    });
    
    console.log(`生成API响应码: ${generateResponse.status}`);
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log(`生成的HTML长度: ${generateData.html.length} 字符`);
      console.log('HTML预览 (前100个字符):');
      console.log(generateData.html.substring(0, 100));
    } else {
      console.error('生成API错误:', await generateResponse.text());
    }
  } catch (error) {
    console.error('生成API请求失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testServerlessApi(); 