<script setup lang="ts">
import { ref } from 'vue';
import AppTemplate from './AppTemplate.vue';

const templates = [
  {
    id: 1,
    name: '个人作品集',
    description: '展示您的项目、技能和经验的专业作品集网站',
    tags: ['展示', '个人', '响应式']
  },
  {
    id: 2,
    name: '企业官网',
    description: '专业的公司网站，展示企业产品、服务和团队信息',
    tags: ['企业', '商务', '展示']
  },
  {
    id: 3,
    name: '电子商城',
    description: '完整的电商网站，包含商品展示、购物车和结账功能',
    tags: ['商城', '交易', '产品']
  },
  {
    id: 4,
    name: '个人博客',
    description: '分享您的想法、文章和生活经验的博客网站',
    tags: ['博客', '内容', '社交']
  },
  {
    id: 5,
    name: '餐厅网站',
    description: '展示菜单、位置和预订功能的餐厅专用网站',
    tags: ['服务', '展示', '预订']
  },
  {
    id: 6,
    name: '贪吃蛇游戏',
    description: '经典贪吃蛇游戏，支持键盘控制和分数记录',
    tags: ['游戏', '互动', '娱乐']
  },
  {
    id: 7,
    name: '天气应用',
    description: '实时显示天气信息，支持城市搜索和天气预报',
    tags: ['工具', '数据', '服务']
  },
  {
    id: 8,
    name: '待办事项',
    description: '简洁的待办事项管理应用，支持添加、完成和删除任务',
    tags: ['工具', '生产力', '管理']
  }
];

const emit = defineEmits<{
  (e: 'select-template', templateId: number): void;
  (e: 'custom-prompt'): void;
}>();

const customPrompt = ref('');

const selectTemplate = (templateId: number) => {
  emit('select-template', templateId);
};

const startCustomPrompt = () => {
  emit('custom-prompt');
};
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Airob <span class="accent">AI</span> 网页生成器</h1>
      <p class="subtitle">使用AI技术，轻松创建专业网站和应用程序</p>
      
      <div class="search-container">
        <input 
          type="text" 
          v-model="customPrompt"
          placeholder="描述您想要创建的网站或应用..."
          class="prompt-input"
          @keyup.enter="startCustomPrompt"
        />
        <button 
          class="create-button"
          @click="startCustomPrompt"
        >
          创建
        </button>
      </div>
    </div>
    
    <div class="templates-section">
      <h2 class="section-title">选择模板开始</h2>
      <div class="templates-grid">
        <AppTemplate
          v-for="template in templates"
          :key="template.id"
          :name="template.name"
          :description="template.description"
          :tags="template.tags"
          :onSelect="() => selectTemplate(template.id)"
        />
      </div>
    </div>
    
    <div class="features-section">
      <h2 class="section-title">Airob的强大功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">✨</div>
          <h3>AI驱动生成</h3>
          <p>基于DeepSeek大模型，将您的想法转化为功能完整的网站</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>即时预览</h3>
          <p>实时查看和编辑您的网站代码和效果</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>响应式设计</h3>
          <p>生成的网站自动适配各种屏幕尺寸</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>SEO优化</h3>
          <p>内置搜索引擎优化，提高网站的可见性</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.accent {
  color: #0066ff;
}

.subtitle {
  font-size: 1.2rem;
  color: #aaa;
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  max-width: 700px;
  margin: 0 auto;
}

.prompt-input {
  flex: 1;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #2a2a3c;
  border-radius: 8px 0 0 8px;
  background-color: #1a1a27;
  color: #fff;
  outline: none;
}

.create-button {
  padding: 1rem 2rem;
  background-color: #0066ff;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: #0055cc;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #fff;
  text-align: center;
}

.templates-section {
  margin-bottom: 3rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.features-section {
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background-color: #1a1a27;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #2a2a3c;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.feature-card p {
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .prompt-input {
    border-radius: 8px 8px 0 0;
  }
  
  .create-button {
    border-radius: 0 0 8px 8px;
  }
}
</style> 