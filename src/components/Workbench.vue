<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import CodeEditor from './CodeEditor.vue';
import LivePreview from './LivePreview.vue';

const props = defineProps<{
  code: string;
  isGenerating: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:code', value: string): void;
  (e: 'generate', prompt: string): void;
  (e: 'refine', prompt: string): void;
}>();

const localCode = ref(props.code);
const userPrompt = ref('');
const deviceType = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
const showDeviceFrame = ref(true);
const activeTab = ref('html');

watch(() => props.code, (newValue) => {
  if (localCode.value !== newValue) {
    localCode.value = newValue;
  }
});

watch(localCode, (newValue) => {
  emit('update:code', newValue);
});

const generateCode = () => {
  if (userPrompt.value.trim()) {
    emit('generate', userPrompt.value);
    userPrompt.value = '';
  }
};

const refineCode = () => {
  if (userPrompt.value.trim()) {
    emit('refine', userPrompt.value);
    userPrompt.value = '';
  }
};

// 代码统计信息
const codeStats = computed(() => {
  const code = localCode.value;
  const lines = code.split('\n').length;
  const chars = code.length;
  
  // 计算HTML, CSS和JS行数
  const htmlCount = (code.match(/<[^>]+>/g) || []).length;
  const cssLines = (code.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [])
    .reduce((acc, style) => acc + style.split('\n').length, 0);
  
  const jsLines = (code.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [])
    .reduce((acc, script) => acc + script.split('\n').length, 0);
  
  return {
    lines,
    chars,
    htmlCount,
    cssLines,
    jsLines
  };
});
</script>

<template>
  <div class="workbench">
    <div class="workbench-content">
      <!-- 代码编辑器区域 -->
      <div class="editor-panel">
        <div class="editor-header">
          <div class="tabs">
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'html' }"
              @click="activeTab = 'html'"
            >
              index.html
            </button>
          </div>
          <div class="editor-actions">
            <button class="action-button" title="下载HTML" @click="$emit('download')">
              <span>下载</span>
            </button>
          </div>
        </div>
        
        <div class="editor-body">
          <CodeEditor 
            v-model="localCode" 
            language="html"
          />
        </div>
        
        <div class="editor-footer">
          <div class="code-stats">
            <span>{{ codeStats.lines }} 行</span>
            <span>{{ codeStats.chars }} 字符</span>
            <span>HTML: {{ codeStats.htmlCount }} 标签</span>
          </div>
        </div>
      </div>
      
      <!-- 预览区域 -->
      <div class="preview-panel">
        <LivePreview 
          :html="localCode" 
          :showDeviceFrame="showDeviceFrame"
          v-model:deviceType="deviceType"
        />
      </div>
    </div>
    
    <!-- 底部提示输入区 -->
    <div class="prompt-panel">
      <div v-if="props.isGenerating" class="generating-indicator">
        <div class="spinner"></div>
        <span>AI 正在生成代码...</span>
      </div>
      
      <div class="device-toggle">
        <label class="toggle-label">
          <input 
            type="checkbox" 
            v-model="showDeviceFrame"
            class="toggle-input" 
          />
          <span class="toggle-text">设备框架</span>
        </label>
      </div>
      
      <div class="prompt-container">
        <input 
          type="text" 
          v-model="userPrompt"
          placeholder="描述您想要的网页，或输入修改建议..." 
          class="prompt-input"
          @keyup.enter="generateCode"
          :disabled="props.isGenerating"
        />
        
        <button 
          class="action-btn refine-btn" 
          @click="refineCode" 
          :disabled="props.isGenerating || !localCode.trim() || !userPrompt.trim()"
        >
          <span v-if="props.isGenerating">处理中...</span>
          <span v-else>优化</span>
        </button>
        
        <button 
          class="action-btn generate-btn" 
          @click="generateCode" 
          :disabled="props.isGenerating || !userPrompt.trim()"
        >
          <span v-if="props.isGenerating">生成中...</span>
          <span v-else>生成</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #0d0f18;
}

.workbench-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-panel, .preview-panel {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  height: 40px;
  background-color: #171923;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tabs {
  display: flex;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #8b8b9e;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 0.85rem;
}

.tab-button.active {
  color: #fff;
  border-bottom-color: #4f8eff;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.5rem;
  background-color: #1e2235;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #2c3146;
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.editor-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #171923;
  font-size: 0.75rem;
  color: #8b8b9e;
}

.code-stats {
  display: flex;
  gap: 1rem;
}

.prompt-panel {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  background-color: #0d0f18;
  position: relative;
}

.generating-indicator {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(10, 10, 20, 0.9);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4f8eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.device-toggle {
  position: absolute;
  top: -30px;
  right: 1rem;
  z-index: 10;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-text {
  font-size: 0.8rem;
  color: #8b8b9e;
  margin-left: 0.5rem;
}

.prompt-container {
  display: flex;
  gap: 0.5rem;
}

.prompt-input {
  flex: 1;
  padding: 0.7rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  background-color: #171923;
  color: #fff;
  outline: none;
}

.action-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refine-btn {
  background-color: #374151;
}

.refine-btn:hover:not(:disabled) {
  background-color: #4b5563;
}

.generate-btn {
  background-color: #4f8eff;
}

.generate-btn:hover:not(:disabled) {
  background-color: #3b7dff;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .workbench-content {
    flex-direction: column;
  }
  
  .editor-panel, .preview-panel {
    width: 100%;
    height: 50%;
  }
}

@media (min-width: 769px) {
  .editor-panel, .preview-panel {
    height: calc(100vh - 120px);
  }
  
  .prompt-panel {
    height: 60px;
  }
}
</style> 