<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  language?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editor = ref<HTMLTextAreaElement | null>(null);
const editorContent = ref(props.modelValue);
const lineNumbersEl = ref<HTMLDivElement | null>(null);

watch(() => props.modelValue, (newValue) => {
  if (editorContent.value !== newValue) {
    editorContent.value = newValue;
    updateLineNumbers();
  }
});

watch(editorContent, (newValue) => {
  emit('update:modelValue', newValue);
  updateLineNumbers();
});

onMounted(() => {
  updateLineNumbers();
  
  if (editor.value) {
    // 通过Tab键缩进
    editor.value.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.value!.selectionStart;
        const end = editor.value!.selectionEnd;
        
        // 在光标位置插入两个空格
        editorContent.value = editorContent.value.substring(0, start) + '  ' + editorContent.value.substring(end);
        
        // 移动光标到新位置
        setTimeout(() => {
          editor.value!.selectionStart = editor.value!.selectionEnd = start + 2;
        }, 0);
      }
    });
    
    // 同步滚动行号和编辑器
    editor.value.addEventListener('scroll', () => {
      if (lineNumbersEl.value && editor.value) {
        lineNumbersEl.value.scrollTop = editor.value.scrollTop;
      }
    });
  }
});

function updateLineNumbers() {
  if (!lineNumbersEl.value) return;
  
  const lines = editorContent.value.split('\n');
  const lineCount = lines.length;
  
  let lineNumbersContent = '';
  for (let i = 1; i <= lineCount; i++) {
    lineNumbersContent += `<div class="line-number">${i}</div>`;
  }
  
  lineNumbersEl.value.innerHTML = lineNumbersContent;
}
</script>

<template>
  <div class="code-editor-container">
    <div class="line-numbers" ref="lineNumbersEl"></div>
    <textarea
      class="code-editor"
      ref="editor"
      v-model="editorContent"
      spellcheck="false"
      :data-language="language || 'html'"
    ></textarea>
  </div>
</template>

<style scoped>
.code-editor-container {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #0d0f18;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
  font-size: 0.9rem;
  position: relative;
}

.line-numbers {
  width: 3rem;
  text-align: right;
  padding: 1rem 0.5rem 1rem 0;
  overflow: hidden;
  background-color: #0a0c14;
  color: #4b5563;
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.line-number {
  padding-right: 0.5rem;
  height: 1.5rem;
}

.code-editor {
  flex: 1;
  padding: 1rem;
  background-color: transparent;
  border: none;
  color: #e2e8f0;
  resize: none;
  outline: none;
  overflow: auto;
}

/* 滚动条样式 */
.code-editor::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.code-editor::-webkit-scrollbar-track {
  background: #171923;
}

.code-editor::-webkit-scrollbar-thumb {
  background: #2d3748;
  border-radius: 3px;
}

.code-editor::-webkit-scrollbar-thumb:hover {
  background: #4a5568;
}
</style> 