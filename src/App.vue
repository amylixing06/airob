<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 错误接口
interface ApiError {
  message: string;
}

// 版本号 - v1.0.3
const apiBaseUrl = 'https://airob-backend.vercel.app/api/v1';
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
const userInput = ref('');
const error = ref('');
const style = ref('modern');
const styles = [
  { value: 'modern', label: '现代简约' },
  { value: 'corporate', label: '企业商务' },
  { value: 'creative', label: '创意设计' },
  { value: 'minimal', label: '极简风格' },
  { value: 'tech', label: '科技风格' }
];

const previewSrc = computed(() => {
  try {
    // 创建Blob和URL以便在iframe中预览
    const blob = new Blob([code.value], { type: 'text/html' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('预览生成失败:', e);
    return '';
  }
});

// 获取用户最近的生成记录
onMounted(async () => {
  // 这里可以添加从localStorage或API获取最近生成记录的逻辑
  // 目前先用默认代码
});

const generateCode = async () => {
  if (!userInput.value.trim()) {
    error.value = '请输入您的需求描述';
    setTimeout(() => {
      error.value = '';
    }, 3000);
    return;
  }
  
  isGenerating.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`${apiBaseUrl}/generator/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: userInput.value,
        style: style.value
      })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    code.value = data.html;
    
    // 保存到本地历史记录
    saveToHistory(userInput.value, code.value);
    
    // 清空输入
    userInput.value = '';
    
  } catch (e: unknown) {
    console.error('生成失败:', e);
    error.value = e instanceof Error ? `生成失败: ${e.message}` : '生成失败：未知错误';
  } finally {
    isGenerating.value = false;
  }
};

const refineCode = async () => {
  if (!userInput.value.trim()) {
    error.value = '请输入您的优化需求';
    setTimeout(() => {
      error.value = '';
    }, 3000);
    return;
  }
  
  isGenerating.value = true;
  error.value = '';
  
  try {
    const response = await fetch(`${apiBaseUrl}/generator/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalHtml: code.value,
        instructions: userInput.value
      })
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    code.value = data.html;
    
    // 保存到本地历史记录
    saveToHistory(userInput.value, code.value, true);
    
    // 清空输入
    userInput.value = '';
    
  } catch (e: unknown) {
    console.error('优化失败:', e);
    error.value = e instanceof Error ? `优化失败: ${e.message}` : '优化失败：未知错误';
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
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">Airob</div>
      <div class="tagline">AI网页生成工具</div>
      <div class="style-selector">
        <span class="style-label">风格:</span>
        <select v-model="style" class="style-dropdown">
          <option v-for="option in styles" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </header>
    
    <div class="main-content">
      <div class="editor-container">
        <div class="file-header">
          <span>index.html</span>
          <button @click="downloadHTML" class="download-btn" title="下载HTML">
            <span>下载</span>
          </button>
        </div>
        <div class="editor">
          <textarea 
            v-model="code" 
            class="code-input"
            spellcheck="false"
          ></textarea>
        </div>
      </div>
      
      <div class="preview-container">
        <div class="file-header preview-header">
          <span>预览</span>
        </div>
        <div class="preview">
          <iframe v-if="previewSrc" :src="previewSrc" class="preview-iframe"></iframe>
          <div class="empty-preview" v-else>
            <div class="prompt">
              <h1><span>准备就绪</span></h1>
              <h2>告诉我你想要什么样的网页</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="footer">
      <div class="input-container">
        <div v-if="error" class="error-message">{{ error }}</div>
        <input 
          type="text" 
          class="command-input" 
          v-model="userInput"
          placeholder="描述你想要的网页，或输入修改建议..." 
          @keyup.enter="generateCode"
        />
        <button 
          class="action-btn refine-btn" 
          @click="refineCode" 
          :disabled="isGenerating || !code.trim()"
        >
          <span v-if="isGenerating">处理中...</span>
          <span v-else>优化</span>
        </button>
        <button 
          class="action-btn generate-btn" 
          @click="generateCode" 
          :disabled="isGenerating"
        >
          <span v-if="isGenerating">生成中...</span>
          <span v-else>生成</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #0f0f19;
  color: #fff;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid #2a2a3c;
  background-color: #0f0f19;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff;
  margin-right: 1rem;
}

.tagline {
  color: #888;
  font-size: 0.9rem;
  margin-right: auto;
}

.style-selector {
  display: flex;
  align-items: center;
}

.style-label {
  margin-right: 0.5rem;
  color: #888;
  font-size: 0.9rem;
}

.style-dropdown {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background-color: #1a1a27;
  color: #fff;
  border: 1px solid #2a2a3c;
  outline: none;
  font-size: 0.9rem;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-container, .preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-container {
  border-right: 1px solid #2a2a3c;
  background-color: #0f0f19;
}

.file-header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #2a2a3c;
  font-size: 0.9rem;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-header {
  background-color: #1a1a27;
  color: #888;
}

.download-btn {
  padding: 0.25rem 0.5rem;
  background-color: transparent;
  border: 1px solid #2a2a3c;
  border-radius: 4px;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.download-btn:hover {
  background-color: #2a2a3c;
  color: #fff;
}

.editor, .preview {
  flex: 1;
  overflow: auto;
}

.editor {
  padding: 0;
}

.code-input {
  width: 100%;
  height: 100%;
  background-color: #0f0f19;
  border: none;
  color: #ccc;
  font-family: 'Menlo', monospace;
  resize: none;
  outline: none;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 1rem;
  box-sizing: border-box;
}

.preview-container {
  background-color: #ffffff;
}

.preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  color: #000;
  background-color: #fff;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.empty-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #000;
  background-color: #f5f5f5;
}

.prompt {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.prompt h1 {
  font-size: 1.5rem;
  color: #999;
  font-weight: normal;
  margin-bottom: 0.5rem;
}

.prompt h2 {
  font-size: 2rem;
  color: #000;
  margin-top: 0;
}

.footer {
  padding: 1rem;
  border-top: 1px solid #2a2a3c;
  background-color: #0f0f19;
}

.input-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  text-align: center;
}

.command-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #2a2a3c;
  border-radius: 4px;
  background-color: #1a1a27;
  color: #fff;
  outline: none;
  margin-bottom: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refine-btn {
  background-color: #444;
}

.refine-btn:hover:not(:disabled) {
  background-color: #555;
}

.generate-btn {
  background-color: #0066ff;
}

.generate-btn:hover:not(:disabled) {
  background-color: #0055cc;
}

@media (min-width: 768px) {
  .input-container {
    flex-direction: row;
    align-items: center;
  }
  
  .command-input {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .editor-container, .preview-container {
    height: 50%;
    width: 100%;
  }
  
  .editor-container {
    border-right: none;
    border-bottom: 1px solid #2a2a3c;
  }
}
</style>
