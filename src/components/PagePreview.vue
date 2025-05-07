<template>
  <div class="mt-8">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">页面预览</h3>
      <div class="flex gap-2" v-if="html">
        <button class="btn" @click="downloadHTML">
          下载HTML
        </button>
        <button class="btn" @click="copyHTML">
          复制代码
        </button>
      </div>
    </div>
    
    <div class="border rounded overflow-hidden" style="height: 600px;">
      <iframe
        v-if="html && !isRefreshing"
        :srcdoc="html"
        class="w-full h-full"
        frameborder="0"
        @load="iframeLoaded = true"
      ></iframe>
      
      <!-- 加载中状态 -->
      <div v-else-if="isLoading || isRefreshing" class="flex flex-col items-center justify-center h-full bg-gray-50">
        <div class="loading-spinner mb-4"></div>
        <p class="text-gray-500">{{ loadingMessage }}</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center h-full bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-500">请填写左侧表单并生成页面</p>
      </div>
    </div>
    
    <div class="flex flex-wrap gap-2 mt-4" v-if="html">
      <button class="btn" @click="editSection('hero')">编辑主视觉区</button>
      <button class="btn" @click="editSection('features')">编辑功能区</button>
      <button class="btn" @click="editSection('testimonials')">编辑评价区</button>
      <button class="btn" @click="changeColorScheme">更换配色</button>
      <button class="btn" @click="refreshPreview">刷新预览</button>
    </div>
    
    <div v-if="copySuccess" class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
      HTML代码已复制到剪贴板
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  html: String,
  isLoading: {
    type: Boolean,
    default: false
  }
})

const copySuccess = ref(false)
const iframeLoaded = ref(false)
const isRefreshing = ref(false)
const loadingMessage = ref('页面生成中，请耐心等待...')

// 监听HTML变化，自动刷新预览
watch(() => props.html, (newHtml) => {
  if (newHtml) {
    refreshPreview()
  }
})

// 刷新预览
const refreshPreview = () => {
  if (!props.html) return
  
  isRefreshing.value = true
  loadingMessage.value = '刷新预览中...'
  iframeLoaded.value = false
  
  // 短暂延迟后刷新iframe
  setTimeout(() => {
    isRefreshing.value = false
    
    // 给浏览器一点时间渲染iframe
    setTimeout(() => {
      if (!iframeLoaded.value) {
        loadingMessage.value = '页面渲染中，大型页面可能需要更多时间...'
      }
    }, 2000)
  }, 500)
}

const editSection = (section) => {
  alert(`即将支持编辑${section}区块，敬请期待！`)
}

const changeColorScheme = () => {
  alert('即将支持更换配色，敬请期待！')
}

const downloadHTML = () => {
  if (!props.html) return
  
  const blob = new Blob([props.html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'landing-page.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const copyHTML = () => {
  if (!props.html) return
  
  navigator.clipboard.writeText(props.html)
    .then(() => {
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}
</script>

<style scoped>
.btn {
  @apply px-3 py-1.5 border rounded bg-gray-100 hover:bg-gray-200 text-sm transition-colors;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style> 