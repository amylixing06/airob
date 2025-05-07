<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps<{
  html: string;
  showDeviceFrame?: boolean;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}>();

const previewSrc = computed(() => {
  try {
    // 创建Blob和URL以便在iframe中预览
    const blob = new Blob([props.html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('预览生成失败:', e);
    return '';
  }
});

// 设备尺寸类
const deviceClass = computed(() => {
  if (!props.showDeviceFrame) return '';
  
  switch (props.deviceType) {
    case 'tablet':
      return 'tablet-frame';
    case 'mobile':
      return 'mobile-frame';
    default:
      return 'desktop-frame';
  }
});

const iframeRef = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);

onMounted(() => {
  if (iframeRef.value) {
    iframeRef.value.onload = () => {
      isLoading.value = false;
    };
  }
});

watch(() => props.html, () => {
  isLoading.value = true;
});

// 设备选择
const deviceTypes = [
  { value: 'desktop', icon: '💻', label: '桌面' },
  { value: 'tablet', icon: '📱', label: '平板' },
  { value: 'mobile', icon: '📱', label: '手机' }
];

const emit = defineEmits<{
  (e: 'update:deviceType', value: 'desktop' | 'tablet' | 'mobile'): void;
}>();

const changeDevice = (type: 'desktop' | 'tablet' | 'mobile') => {
  emit('update:deviceType', type);
};
</script>

<template>
  <div class="preview-wrapper">
    <div v-if="showDeviceFrame" class="device-controls">
      <button 
        v-for="device in deviceTypes"
        :key="device.value"
        class="device-button"
        :class="{ active: deviceType === device.value }"
        @click="changeDevice(device.value as 'desktop' | 'tablet' | 'mobile')"
      >
        <span class="device-icon">{{ device.icon }}</span>
        <span class="device-label">{{ device.label }}</span>
      </button>
    </div>
    
    <div class="preview-container" :class="deviceClass">
      <div v-if="isLoading" class="loading-indicator">
        <div class="spinner"></div>
        <div>加载预览...</div>
      </div>
      
      <iframe 
        v-if="previewSrc" 
        :src="previewSrc" 
        class="preview-iframe"
        ref="iframeRef"
        :class="{ loading: isLoading }"
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
      ></iframe>
      
      <div v-else class="empty-preview">
        <div class="prompt">
          <h2>等待生成内容</h2>
          <p>使用AI生成网页或应用...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #0d0f18;
}

.device-controls {
  display: flex;
  justify-content: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background-color: #171923;
}

.device-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  color: #8b8b9e;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.device-button.active {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.device-icon {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.device-label {
  font-size: 0.8rem;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0a0c14;
  position: relative;
  overflow: auto;
  padding: 1rem;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
  opacity: 1;
  transition: opacity 0.3s;
}

.preview-iframe.loading {
  opacity: 0.3;
}

/* 设备框架样式 */
.desktop-frame {
  padding: 2rem;
}

.desktop-frame .preview-iframe {
  max-width: 1200px;
  max-height: 95%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.tablet-frame {
  padding: 2rem;
}

.tablet-frame .preview-iframe {
  width: 768px;
  height: 1024px;
  border-radius: 20px;
  border: 12px solid #222;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.mobile-frame {
  padding: 2rem;
}

.mobile-frame .preview-iframe {
  width: 375px;
  height: 667px;
  border-radius: 20px;
  border: 10px solid #222;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8b8b9e;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4f8eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8fafc;
  color: #000;
}

.prompt {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.prompt h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.prompt p {
  font-size: 1rem;
  color: #666;
}
</style> 