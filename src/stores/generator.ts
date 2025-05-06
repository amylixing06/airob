import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GeneratorRequest, GeneratorResponse } from '@/api/generator'
import { generatePage, refinePage } from '@/api/generator'

export const useGeneratorStore = defineStore('generator', () => {
  const generatedContent = ref<GeneratorResponse | null>(null)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const generate = async (request: GeneratorRequest) => {
    isGenerating.value = true
    error.value = null
    try {
      const response = await generatePage(request)
      generatedContent.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成失败'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const refine = async (originalHtml: string, instructions: string) => {
    isGenerating.value = true
    error.value = null
    try {
      const response = await refinePage({ originalHtml, instructions })
      generatedContent.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '优化失败'
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  const reset = () => {
    generatedContent.value = null
    error.value = null
  }

  return {
    generatedContent,
    isGenerating,
    error,
    generate,
    refine,
    reset
  }
}) 