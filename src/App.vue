<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import HomePage from './components/HomePage.vue';
import Workbench from './components/Workbench.vue';
import { generateHtml, refineHtml, testApiConnection as testApi } from './api/generator';
import { showDebugPanel } from './utils/debug';

// 错误接口
interface ApiError {
  message: string;
  status?: number;
}

// 版本号 - v1.1.0
// 使用相对路径解决CORS问题
const apiBaseUrl = '/api/v1';

// 当前视图模式：'home' | 'workbench'
const currentView = ref<'home' | 'workbench'>('home');

// 提供当前模式给子组件 - 始终为API模式
provide('currentMode', 'api');

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
  // 显示调试面板
  showDebugPanel('应用已启动');
  
  // 测试API连接
  testApiConnection();
});

// 测试API连接是否可用
const testApiConnection = async () => {
  try {
    const isConnected = await testApi();
    
    if (!isConnected) {
      throw new Error('API连接测试失败');
    }
    
    console.log('API连接成功');
  } catch (e) {
    console.error('API连接失败:', e);
    error.value = 'API连接失败，请检查服务器状态';
    setTimeout(() => {
      error.value = '';
    }, 5000);
  }
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
    // 使用API服务
    const html = await generateHtml(prompt, style.value);
    code.value = html;
    
    // 保存到本地历史记录
    saveToHistory(prompt, code.value);
  } catch (e: any) {
    console.error('生成失败:', e);
    
    // 显示错误消息
    if (e.status) {
      error.value = `生成失败: API错误 ${e.status}`;
    } else {
      error.value = `生成失败: ${e.message}`;
    }
    
    error.value += '。请检查API连接和服务器状态。';
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
    // 使用API服务
    const html = await refineHtml(code.value, prompt);
    code.value = html;
    
    // 保存到本地历史记录
    saveToHistory(prompt, code.value, true);
  } catch (e: any) {
    console.error('优化失败:', e);
    
    // 显示错误消息
    if (e.status) {
      error.value = `优化失败: API错误 ${e.status}`;
    } else {
      error.value = `优化失败: ${e.message}`;
    }
    
    error.value += '。请检查API连接和服务器状态。';
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
          <img src="/airob-logo.svg" alt="Airob Logo" class="logo-img">
          <span class="logo-text">Airob.cc</span>
        </div>
      </div>
      <div class="header-center">
        <div v-if="currentView === 'workbench'" class="navigation-tabs">
          <div class="tab active">Code</div>
          <div class="tab">Preview</div>
        </div>
        <div v-else class="tagline">Code Copilot - AI网页生成工具</div>
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
        <div class="api-mode-badge">
          API模式
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
  gap: 0.5rem;
}

.logo-img {
  width: 32px;
  height: 32px;
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

.api-mode-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background-color: rgba(79, 142, 255, 0.15);
  border-radius: 4px;
  color: #4f8eff;
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
