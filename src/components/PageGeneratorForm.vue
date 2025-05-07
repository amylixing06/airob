<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded shadow">
    <h2 class="text-xl font-bold mb-4">AI 落地页生成器</h2>
    <form @submit.prevent="handleGenerate">
      <div class="mb-3">
        <label class="block mb-1">行业</label>
        <input v-model="form.industry" class="input" placeholder="如：科技、教育、医疗" />
      </div>
      <div class="mb-3">
        <label class="block mb-1">页面类型</label>
        <input v-model="form.pageType" class="input" placeholder="如：landing" />
      </div>
      <div class="mb-3">
        <label class="block mb-1">主要卖点（用逗号分隔）</label>
        <input v-model="featuresInput" class="input" placeholder="如：高性能,易用性,安全保障" />
      </div>
      <div class="mb-3">
        <label class="block mb-1">风格</label>
        <select v-model="form.style" class="input">
          <option value="现代">现代</option>
          <option value="简约">简约</option>
          <option value="商务">商务</option>
          <option value="创意">创意</option>
          <option value="科技">科技</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="block mb-1">配色（用逗号分隔）</label>
        <input v-model="form.colorScheme" class="input" placeholder="#2563eb,#1e40af" />
      </div>
      <button 
        type="submit" 
        class="btn btn-primary w-full mt-4"
        :disabled="isLoading"
      >
        <span v-if="isLoading">生成中...</span>
        <span v-else>生成页面</span>
      </button>
      <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  industry: '科技',
  pageType: 'landing',
  keyFeatures: [],
  style: '现代',
  colorScheme: '#2563eb,#1e40af'
})
const featuresInput = ref('高性能,易用性,安全保障')
const isLoading = ref(false)
const error = ref('')

const emit = defineEmits(['generated', 'loading-start', 'loading-end'])

const handleGenerate = async () => {
  isLoading.value = true
  error.value = ''
  emit('loading-start')
  
  try {
    // 处理卖点列表
    form.value.keyFeatures = featuresInput.value.split(',').map(s => s.trim()).filter(Boolean)
    
    // 获取API基础URL，如果环境变量不存在，则使用默认URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://airob-backend.vercel.app/api/v1'
    
    // 调用后端API
    const res = await fetch(`${apiBaseUrl}/generator/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || `服务器错误 (${res.status})`)
    }
    
    const data = await res.json()
    
    if (data && data.html) {
      emit('generated', data.html)
    } else {
      throw new Error('返回的数据格式不正确')
    }
  } catch (err) {
    console.error('生成页面失败:', err)
    error.value = err.message || '生成页面失败，请重试'
  } finally {
    isLoading.value = false
    emit('loading-end')
  }
}
</script>

<style scoped>
.input {
  @apply w-full border rounded px-3 py-2;
}
.btn-primary {
  @apply bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style> 