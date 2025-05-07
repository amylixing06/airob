const fetch = require('node-fetch');
const fs = require('fs');

// API密钥
const DEEPSEEK_API_KEY = 'sk-2b5d6bf0fe8a44a3834ae12e3951258a';

async function testFullProcess() {
  console.log('=== 开始完整测试流程 ===');
  
  try {
    // 1. 构造请求
    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的前端开发者，擅长生成高质量的HTML网页代码。请直接返回代码，不要有多余的解释。'
        },
        {
          role: 'user',
          content: '生成一个简单的HTML页面，标题为"花店网站"，包含导航栏、产品展示和联系我们部分。使用现代简约风格。'
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
      stream: false
    };
    
    console.log('请求DeepSeek API...');
    
    // 2. 发送请求
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`API响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API错误:', errorText);
      return;
    }
    
    // 3. 处理响应
    const data = await response.json();
    console.log('获取到API响应');
    
    // 4. 提取HTML
    const content = data.choices[0]?.message?.content;
    console.log(`内容长度: ${content.length} 字符`);
    
    // 尝试提取代码块
    const codeBlockMatch = content.match(/```(?:html)?([\s\S]*?)```/);
    let html;
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      html = codeBlockMatch[1].trim();
      console.log('从代码块中提取HTML成功');
    } else {
      html = content;
      console.log('未找到代码块，使用原始内容');
    }
    
    // 5. 保存HTML
    fs.writeFileSync('generated.html', html);
    console.log('HTML已保存到 generated.html');
    
    // 6. 输出前100个字符
    console.log('\n预览生成的HTML (前100个字符):');
    console.log('-----------------------------------');
    console.log(html.substring(0, 100));
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
  
  console.log('=== 测试流程完成 ===');
}

// 执行测试
testFullProcess(); 