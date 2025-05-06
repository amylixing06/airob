<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              页面预览
            </h3>
            <div class="flex space-x-3">
              <button
                @click="handleEdit"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                编辑
              </button>
              <button
                @click="handleDownload"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                下载代码
              </button>
            </div>
          </div>

          <ErrorMessage
            v-if="error"
            :message="error"
            title="预览失败"
          />

          <div class="mt-4 border-4 border-dashed border-gray-200 rounded-lg p-4">
            <div v-if="isLoading" class="flex justify-center items-center h-[600px]">
              <LoadingSpinner text="加载中..." />
            </div>
            <iframe
              v-else
              ref="previewFrame"
              class="w-full h-[600px] border-0"
              :srcdoc="generatedHtml"
              @load="handleIframeLoad"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGeneratorStore } from '@/stores/generator'
import { cleanHtml, validateHtml } from '@/utils/html'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const router = useRouter()
const generatorStore = useGeneratorStore()
const previewFrame = ref<HTMLIFrameElement | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const generatedHtml = ref('')

onMounted(() => {
  if (generatorStore.generatedContent) {
    generatedHtml.value = cleanHtml(generatorStore.generatedContent.html)
    if (!validateHtml(generatedHtml.value)) {
      error.value = '生成的HTML内容可能不安全'
    }
  } else {
    router.push('/generator')
  }
})

const handleIframeLoad = () => {
  isLoading.value = false
}

const handleEdit = () => {
  router.push('/generator')
}

const handleDownload = () => {
  if (!generatedHtml.value) return

  const blob = new Blob([generatedHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'landing-page.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script> 