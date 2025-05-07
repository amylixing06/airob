<script setup lang="ts">
import { ref } from 'vue';

// 版本号 - 用于触发新构建
const version = "1.0.1";

const code = ref('');
const output = ref('');
const isGenerating = ref(false);

const generateCode = () => {
  isGenerating.value = true;
  setTimeout(() => {
    output.value = `<!DOCTYPE html>
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
</html>`;
    isGenerating.value = false;
  }, 1000);
};
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div class="logo">Airob</div>
      <div class="tagline">想象并生成网页</div>
    </header>
    
    <div class="main-content">
      <div class="editor-container">
        <div class="file-header">index.html</div>
        <div class="editor">
          <textarea 
            v-model="code" 
            placeholder="描述你想要生成的网页..." 
            class="code-input"
          ></textarea>
        </div>
      </div>
      
      <div class="preview-container">
        <div class="preview" v-if="output">
          <pre class="code-output">{{ output }}</pre>
        </div>
        <div class="empty-preview" v-else>
          <div class="prompt">
            <h1><span>准备就绪</span></h1>
            <h2>告诉我你想要什么</h2>
            <img src="/arrow.svg" class="arrow" alt="arrow" />
          </div>
        </div>
      </div>
    </div>
    
    <footer class="footer">
      <div class="input-container">
        <input 
          type="text" 
          class="command-input" 
          placeholder="输入你的需求..." 
          @keyup.enter="generateCode"
        />
        <button class="generate-btn" @click="generateCode">
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
  border-radius: 12px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid #2a2a3c;
  background-color: #0f0f19;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  color: #fff;
}

.tagline {
  color: #888;
  font-size: 0.9rem;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  border-right: 1px solid #2a2a3c;
  display: flex;
  flex-direction: column;
  background-color: #0f0f19;
}

.file-header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #2a2a3c;
  font-size: 0.9rem;
  color: #888;
}

.editor {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.code-input {
  width: 100%;
  height: 100%;
  background-color: transparent;
  border: none;
  color: #ccc;
  font-family: 'Menlo', monospace;
  resize: none;
  outline: none;
  font-size: 0.9rem;
  line-height: 1.5;
}

.preview-container {
  flex: 1;
  overflow: auto;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  color: #000;
  background-color: #fff;
}

.code-output {
  padding: 1rem;
  margin: 0;
  font-family: 'Menlo', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.empty-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #000;
}

.prompt {
  text-align: center;
  position: relative;
  max-width: 600px;
}

.prompt h1 {
  font-size: 2rem;
  color: #999;
  font-weight: normal;
  margin-bottom: 0.5rem;
}

.prompt h2 {
  font-size: 3rem;
  color: #000;
  margin-top: 0;
}

.arrow {
  position: absolute;
  bottom: -100px;
  right: 10px;
  width: 80px;
  transform: rotate(45deg);
}

.footer {
  padding: 1rem;
  border-top: 1px solid #2a2a3c;
  background-color: #0f0f19;
}

.input-container {
  display: flex;
  width: 100%;
}

.command-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid #2a2a3c;
  border-radius: 4px 0 0 4px;
  background-color: #1a1a27;
  color: #fff;
  outline: none;
}

.generate-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 0 4px 4px 0;
  background-color: #0066ff;
  color: #fff;
  cursor: pointer;
}

.generate-btn:hover {
  background-color: #0055cc;
}
</style>
