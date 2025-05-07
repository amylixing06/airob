const fetch = require('node-fetch');

// 替换为您实际的部署URL
const DEPLOYED_URL = 'https://airob.vercel.app';

async function testDeployedApi() {
  console.log('=== 测试已部署的API端点 ===');
  
  // 测试状态API
  console.log('\n1. 测试状态API...');
  try {
    const statusResponse = await fetch(`${DEPLOYED_URL}/api/v1/status`);
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
  
  // 测试生成API (仅做连接测试)
  console.log('\n2. 测试生成API连接...');
  try {
    const generateResponse = await fetch(`${DEPLOYED_URL}/api/v1/generator/generate`, {
      method: 'HEAD'
    });
    
    console.log(`生成API连接测试响应码: ${generateResponse.status}`);
    if (generateResponse.ok) {
      console.log('生成API连接测试成功');
    } else {
      console.error('生成API连接测试失败:', await generateResponse.text());
    }
  } catch (error) {
    console.error('生成API连接测试请求失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testDeployedApi(); 