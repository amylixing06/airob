<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  name: string;
  description: string;
  tags: string[];
  onSelect: () => void;
}>();

const previewColor = computed(() => {
  // 根据标签生成不同的背景颜色
  if (props.tags.includes('游戏')) return 'bg-indigo-500';
  if (props.tags.includes('商城')) return 'bg-emerald-500';
  if (props.tags.includes('博客')) return 'bg-amber-500';
  if (props.tags.includes('工具')) return 'bg-blue-500';
  if (props.tags.includes('展示')) return 'bg-rose-500';
  return 'bg-violet-500';
});

const isHovered = ref(false);
</script>

<template>
  <div 
    class="template-card" 
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="props.onSelect"
  >
    <div class="template-preview" :class="previewColor">
      <div class="template-icon">{{ name.substring(0, 1) }}</div>
      <div v-if="isHovered" class="use-template-overlay">
        <span>使用此模板</span>
      </div>
    </div>
    <div class="template-info">
      <h3 class="template-name">{{ name }}</h3>
      <p class="template-description">{{ description }}</p>
      <div class="template-tags">
        <span 
          v-for="tag in tags" 
          :key="tag" 
          class="template-tag"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  background-color: #1a1a27;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #2a2a3c;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.template-preview {
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.template-icon {
  font-size: 3rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
}

.use-template-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
}

.template-info {
  padding: 1rem;
}

.template-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff;
}

.template-description {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 0.8rem;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.template-tag {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background-color: #2a2a3c;
  border-radius: 3px;
  color: #aaa;
}
</style> 