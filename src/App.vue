<script setup lang="ts">
import { ref } from 'vue';
import PageGeneratorForm from './components/PageGeneratorForm.vue';
import PagePreview from './components/PagePreview.vue';

const html = ref('');
const isLoading = ref(false);

const handleGenerated = (generatedHtml) => {
  html.value = generatedHtml;
};

const startLoading = () => {
  isLoading.value = true;
};

const stopLoading = () => {
  isLoading.value = false;
};
</script>

<template>
  <div class="h-screen flex flex-col">
    <header class="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6">
      <div class="container mx-auto px-4">
        <h1 class="text-4xl font-bold">Airob</h1>
        <p class="text-xl opacity-90 mt-2">基于DeepSeek大模型的AI落地页生成器</p>
      </div>
    </header>
    
    <main class="flex-grow flex flex-col md:flex-row overflow-hidden">
      <div class="md:w-1/3 p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <PageGeneratorForm 
          @generated="handleGenerated" 
          @loading-start="startLoading"
          @loading-end="stopLoading"
        />
      </div>
      <div class="md:w-2/3 p-6 bg-white overflow-y-auto">
        <PagePreview :html="html" :is-loading="isLoading" />
      </div>
    </main>
    
    <footer class="bg-gray-800 text-white text-center py-4 text-sm">
      <p>Airob © 2023 - 由DeepSeek大模型提供技术支持</p>
    </footer>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #111827;
  overflow: hidden;
}
</style>
