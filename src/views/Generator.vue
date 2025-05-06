<template>
  <div class="py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            页面生成配置
          </h3>
          
          <ErrorMessage
            v-if="error"
            :message="error"
            title="生成失败"
          />

          <div class="mt-5">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label for="industry" class="block text-sm font-medium text-gray-700">
                  行业类型
                </label>
                <select
                  id="industry"
                  v-model="formData.industry"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="tech">科技</option>
                  <option value="ecommerce">电子商务</option>
                  <option value="education">教育</option>
                  <option value="healthcare">医疗健康</option>
                </select>
              </div>

              <div>
                <label for="style" class="block text-sm font-medium text-gray-700">
                  页面风格
                </label>
                <select
                  id="style"
                  v-model="formData.style"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="modern">现代简约</option>
                  <option value="professional">专业商务</option>
                  <option value="creative">创意设计</option>
                </select>
              </div>

              <div>
                <label for="features" class="block text-sm font-medium text-gray-700">
                  主要功能/特点
                </label>
                <textarea
                  id="features"
                  v-model="formData.features"
                  rows="3"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="请输入主要功能或特点，用逗号分隔"
                ></textarea>
              </div>

              <div>
                <label for="colorScheme" class="block text-sm font-medium text-gray-700">
                  配色方案
                </label>
                <div class="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div
                    v-for="color in colorSchemes"
                    :key="color.name"
                    class="relative"
                  >
                    <input
                      type="radio"
                      :id="color.name"
                      :value="color.value"
                      v-model="formData.colorScheme"
                      class="sr-only"
                    >
                    <label
                      :for="color.name"
                      class="flex flex-col items-center cursor-pointer"
                    >
                      <div
                        class="w-full h-12 rounded-lg"
                        :style="{
                          background: generateGradient(getColorScheme(color.value))
                        }"
                      ></div>
                      <span class="mt-2 text-sm text-gray-700">
                        {{ color.label }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  :disabled="isGenerating"
                >
                  <LoadingSpinner v-if="isGenerating" class="mr-2" />
                  {{ isGenerating ? '生成中...' : '生成页面' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGeneratorStore } from '@/stores/generator'
import { generateGradient, getColorScheme } from '@/utils/colors'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const router = useRouter()
const generatorStore = useGeneratorStore()
const error = ref<string | null>(null)

const formData = reactive({
  industry: 'tech',
  style: 'modern',
  features: '',
  colorScheme: 'blue'
})

const colorSchemes = [
  { name: 'blue', label: '蓝色系', value: 'blue' },
  { name: 'green', label: '绿色系', value: 'green' },
  { name: 'purple', label: '紫色系', value: 'purple' },
  { name: 'orange', label: '橙色系', value: 'orange' }
]

const handleSubmit = async () => {
  error.value = null
  try {
    await generatorStore.generate(formData)
    router.push('/preview')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '生成失败'
  }
}
</script> 