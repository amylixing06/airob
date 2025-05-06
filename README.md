# AIROB - AI驱动的落地页生成器

基于DeepSeek大模型的智能落地页生成工具，帮助用户快速创建专业的响应式落地页面。

## 功能特点

- 🎨 多种页面风格和配色方案
- 📱 响应式设计，适配各种设备
- 🚀 快速生成，即时预览
- 💾 支持代码下载和二次编辑
- 🎯 针对不同行业的优化模板

## 技术栈

- 前端：Vue 3 + TypeScript + TailwindCSS
- 后端：FastAPI (Python)
- AI：DeepSeek API
- 构建工具：Vite

## 开发环境设置

1. 克隆项目
```bash
git clone https://github.com/yourusername/airob.git
cd airob
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，添加必要的环境变量
```

4. 启动开发服务器
```bash
npm run dev
```

## 项目结构

```
airob/
├── src/
│   ├── api/          # API服务
│   ├── assets/       # 静态资源
│   ├── components/   # Vue组件
│   ├── stores/       # Pinia状态管理
│   ├── utils/        # 工具函数
│   └── views/        # 页面视图
├── public/           # 公共资源
└── package.json      # 项目配置
```

## 使用说明

1. 访问首页，点击"开始生成"
2. 选择行业类型和页面风格
3. 输入主要功能/特点
4. 选择配色方案
5. 点击生成按钮
6. 预览生成的页面
7. 可以编辑或下载生成的代码

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件 