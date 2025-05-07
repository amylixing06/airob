/**
 * 测试流式生成API
 */
const fetch = require('node-fetch');

async function testStreamAPI() {
  console.log('测试流式生成API...');

  try {
    const response = await fetch('http://localhost:3000/api/v1/generator/generate-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: '简单的个人博客首页',
        style: 'modern'
      })
    });

    if (!response.ok) {
      console.error(`HTTP错误! 状态: ${response.status}`);
      console.error('错误详情:', await response.text());
      return;
    }

    console.log('连接成功，正在接收流式响应...');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('流式传输完成');
        break;
      }
      
      const chunk = decoder.decode(value);
      const events = chunk.split('\n\n').filter(e => e.trim().startsWith('data:'));
      
      for (const event of events) {
        if (!event.trim()) continue;
        
        const dataStr = event.substring(event.indexOf('data:') + 5).trim();
        if (dataStr === '[DONE]') {
          console.log('接收到结束标记');
          continue;
        }
        
        try {
          const data = JSON.parse(dataStr);
          console.log('接收到事件:', data.type);
          
          // 显示状态更新
          if (data.type === 'status') {
            console.log('状态消息:', data.message);
          }
          
          // 显示内容长度
          if (data.type === 'content') {
            console.log('收到内容片段，长度:', data.content.length);
          }
          
          // 显示完成消息
          if (data.type === 'complete') {
            console.log('生成完成，HTML长度:', data.html.length);
            console.log('生成用时:', data.time, '秒');
          }
          
          // 显示错误
          if (data.type === 'error') {
            console.error('错误消息:', data.error);
          }
        } catch (error) {
          console.error('解析事件数据失败:', error);
          console.error('原始数据:', dataStr);
        }
      }
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

async function testLocalServer() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/status');
    
    if (response.ok) {
      console.log('本地服务器正在运行');
      await testStreamAPI();
    } else {
      console.error('本地服务器未响应或返回错误');
    }
  } catch (error) {
    console.error('无法连接到本地服务器。请确保服务器已启动:', error.message);
    console.log('使用以下命令启动开发服务器:');
    console.log('npm run dev');
  }
}

testLocalServer(); 