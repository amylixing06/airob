<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import HomePage from './components/HomePage.vue';
import Workbench from './components/Workbench.vue';

// 错误接口
interface ApiError {
  message: string;
}

// 版本号 - v1.1.0
// 使用相对路径解决CORS问题
const apiBaseUrl = '/api/v1';

// 是否使用本地模拟数据（当API连接失败时）
const useLocalMock = ref(false);
// 当前视图模式：'home' | 'workbench'
const currentView = ref<'home' | 'workbench'>('home');

const code = ref(`<!DOCTYPE html>
<html>
<head>
  <title>我的网页</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: "微软雅黑", sans-serif;
    }
    h1 {
      color: #333;
      font-size: 2rem;
    }
  </style>
</head>
<body>
  <h1>你好，世界！</h1>
</body>
</html>`);

const isGenerating = ref(false);
const error = ref('');
const style = ref('modern');
const styles = [
  { value: 'modern', label: '现代简约' },
  { value: 'corporate', label: '企业商务' },
  { value: 'creative', label: '创意设计' },
  { value: 'minimal', label: '极简风格' },
  { value: 'tech', label: '科技风格' }
];

// 获取用户最近的生成记录
onMounted(async () => {
  // 这里可以添加从localStorage或API获取最近生成记录的逻辑
  // 目前先用默认代码
  
  // 测试API连接
  testApiConnection();
});

// 测试API连接是否可用
const testApiConnection = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/generator/generate`, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    useLocalMock.value = false;
    console.log('API连接成功');
  } catch (e) {
    console.error('API连接失败，将使用本地模拟数据:', e);
    useLocalMock.value = true;
    
    // 显示临时错误通知
    error.value = 'API连接失败，将使用本地模拟数据';
    setTimeout(() => {
      error.value = '';
    }, 5000);
  }
};

// 本地模拟生成HTML
const mockGenerateHtml = (prompt: string, style: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <title>生成的网页 - ${prompt}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: "微软雅黑", sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: ${style === 'tech' ? '#0066ff' : 
              style === 'creative' ? '#ff6b6b' : 
              style === 'corporate' ? '#2c3e50' : 
              style === 'minimal' ? '#333' : '#2563eb'};
      text-align: center;
      margin-top: 1rem;
    }
    p {
      line-height: 1.6;
    }
    .header {
      text-align: center;
      padding: 1rem;
      ${style === 'corporate' ? 'background-color: #2c3e50; color: white;' : ''}
    }
    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${prompt}</h1>
    </div>
    <div class="content">
      <p>这是本地模拟生成的网页示例。</p>
      <p>您选择了"${styles.find(s => s.value === style)?.label || style}"风格。</p>
      <p>在您的实际需求中，这里将展示更多相关内容。</p>
    </div>
    <div class="footer">
      <p>由Airob本地模拟生成 &copy; ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;
};

const generateCode = async (prompt: string) => {
  if (!prompt.trim()) {
    error.value = '请输入您的需求描述';
    setTimeout(() => {
      error.value = '';
    }, 3000);
    return;
  }
  
  isGenerating.value = true;
  error.value = '';
  
  try {
    // 如果API不可用，使用本地模拟数据
    if (useLocalMock.value) {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 生成模拟HTML
      code.value = mockGenerateHtml(prompt, style.value);
      
      // 保存到本地历史记录
      saveToHistory(prompt, code.value);
      
      return;
    }
    
    // 如果API可用，正常请求
    const response = await fetch(`${apiBaseUrl}/generator/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: prompt,
        style: style.value
      })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    code.value = data.html;
    
    // 保存到本地历史记录
    saveToHistory(prompt, code.value);
    
  } catch (e: unknown) {
    console.error('生成失败:', e);
    error.value = e instanceof Error ? `生成失败: ${e.message}` : '生成失败：未知错误';
    
    // 如果API请求失败但之前未开启模拟模式，切换到模拟模式
    if (!useLocalMock.value) {
      useLocalMock.value = true;
      error.value += '。已切换到本地模拟模式，请重试。';
    }
  } finally {
    isGenerating.value = false;
  }
};

const refineCode = async (prompt: string) => {
  if (!prompt.trim()) {
    error.value = '请输入您的优化需求';
    setTimeout(() => {
      error.value = '';
    }, 3000);
    return;
  }
  
  isGenerating.value = true;
  error.value = '';
  
  try {
    // 如果API不可用，使用本地模拟数据
    if (useLocalMock.value) {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 简单的模拟优化，在HTML中添加用户请求的内容
      const currentHtml = code.value;
      const bodyEndPos = currentHtml.lastIndexOf('</body>');
      
      if (bodyEndPos !== -1) {
        const newHtml = currentHtml.substring(0, bodyEndPos) + 
          `\n  <!-- 根据"${prompt}"进行了优化 -->\n  ` +
          `<div class="refinement-note" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">` +
          `<p><strong>优化内容：</strong> ${prompt}</p></div>\n` +
          currentHtml.substring(bodyEndPos);
        
        code.value = newHtml;
      }
      
      // 保存到本地历史记录
      saveToHistory(prompt, code.value, true);
      
      return;
    }
    
    // 如果API可用，正常请求
    const response = await fetch(`${apiBaseUrl}/generator/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalHtml: code.value,
        instructions: prompt
      })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    code.value = data.html;
    
    // 保存到本地历史记录
    saveToHistory(prompt, code.value, true);
    
  } catch (e: unknown) {
    console.error('优化失败:', e);
    error.value = e instanceof Error ? `优化失败: ${e.message}` : '优化失败：未知错误';
    
    // 如果API请求失败但之前未开启模拟模式，切换到模拟模式
    if (!useLocalMock.value) {
      useLocalMock.value = true;
      error.value += '。已切换到本地模拟模式，请重试。';
    }
  } finally {
    isGenerating.value = false;
  }
};

const saveToHistory = (prompt: string, html: string, isRefinement: boolean = false) => {
  try {
    const history = JSON.parse(localStorage.getItem('airobHistory') || '[]');
    history.unshift({
      id: Date.now(),
      prompt,
      html,
      timestamp: new Date().toISOString(),
      type: isRefinement ? 'refinement' : 'generation'
    });
    
    // 限制历史记录数量
    if (history.length > 10) {
      history.pop();
    }
    
    localStorage.setItem('airobHistory', JSON.stringify(history));
  } catch (e) {
    console.error('保存历史记录失败:', e);
  }
};

const downloadHTML = () => {
  try {
    const blob = new Blob([code.value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airob-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('下载失败:', e);
    error.value = '下载失败，请稍后重试';
  }
};

// 从主页切换到工作台
const goToWorkbench = () => {
  currentView.value = 'workbench';
};

// 处理模板选择
const handleTemplateSelect = (templateId: number) => {
  // 这里可以根据模板ID加载不同的初始代码
  // 目前使用默认代码
  goToWorkbench();
};

// 处理自定义提示词
const handleCustomPrompt = () => {
  goToWorkbench();
};
</script>

<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo" @click="currentView = 'home'">
          <span class="logo-text">Airob</span>
        </div>
      </div>
      <div class="header-center">
        <div v-if="currentView === 'workbench'" class="navigation-tabs">
          <div class="tab active">Code</div>
          <div class="tab">Preview</div>
        </div>
        <div v-else class="tagline">AI网页生成工具</div>
      </div>
      <div class="header-right">
        <div class="language-selector">中文</div>
        <div v-if="currentView === 'workbench'" class="style-selector">
          <select v-model="style" class="style-dropdown">
            <option v-for="option in styles" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div v-if="useLocalMock" class="mode-badge">
          本地模式
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 主页视图 -->
      <HomePage 
        v-if="currentView === 'home'"
        @select-template="handleTemplateSelect"
        @custom-prompt="handleCustomPrompt"
      />
      
      <!-- 工作台视图 -->
      <Workbench 
        v-else
        v-model:code="code"
        :isGenerating="isGenerating"
        @generate="generateCode"
        @refine="refineCode"
        @download="downloadHTML"
      />
    </main>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #0d0f18;
  color: #fff;
  overflow: hidden;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* 头部导航栏 - DeepSite风格 */
.app-header {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #0d0f18;
  height: 60px;
}

.header-left, .header-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-right {
  justify-content: flex-end;
  gap: 1rem;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-text {
  font-weight: 600;
  font-size: 1.5rem;
  background: linear-gradient(to right, #4f8eff, #41b3ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  color: #8b8b9e;
  font-size: 0.9rem;
}

.mode-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background-color: rgba(255, 107, 107, 0.15);
  border-radius: 4px;
  color: #ff6b6b;
}

.language-selector {
  font-size: 0.85rem;
  color: #8b8b9e;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.style-selector {
  margin-left: 0.5rem;
}

.style-dropdown {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background-color: #171923;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  font-size: 0.85rem;
}

/* 导航标签 - DeepSite风格 */
.navigation-tabs {
  display: flex;
  gap: 1rem;
}

.tab {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #8b8b9e;
}

.tab.active {
  background-color: #1a1e2e;
  color: #fff;
}

/* 主内容区 */
.app-main {
  flex: 1;
  overflow: hidden;
}

/* 错误消息 */
.error-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff6b6b;
  font-size: 0.9rem;
  padding: 0.8rem 1.2rem;
  background-color: rgba(15, 15, 25, 0.9);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 90%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 0.6rem;
  }
  
  .header-center {
    display: none;
  }
  
  .header-right {
    justify-content: flex-end;
  }
  
  .language-selector {
    display: none;
  }
}
</style>
