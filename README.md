# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# Airob - AI落地页生成器

基于DeepSeek大模型的AI落地页生成器，能够根据用户输入的行业、风格等要求，快速生成专业的落地页。

## 部署指南

本项目采用前后端分离架构，分别部署在Vercel上。

### 前端部署

1. 确保你有一个Vercel账号，访问[vercel.com](https://vercel.com)注册或登录

2. 在本地构建前端项目：
   ```bash
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   ```

3. 使用Vercel CLI部署（推荐）：
   ```bash
   # 安装Vercel CLI
   npm i -g vercel
   
   # 部署
   vercel
   ```
   
   或者直接在Vercel网站上导入GitHub仓库进行部署

4. 配置环境变量：
   在Vercel项目设置中添加以下环境变量：
   - `VITE_API_BASE_URL`: 后端API基础URL（例如：https://airob-backend.vercel.app/api/v1）

### 后端部署

1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 使用Vercel CLI部署：
   ```bash
   vercel
   ```

3. 配置环境变量：
   在Vercel项目设置中添加以下环境变量：
   - `DEEPSEEK_API_KEY`: DeepSeek API密钥
   - `SECRET_KEY`: 用于JWT的密钥

### 双部署验证

1. 确保前端能够成功连接后端API
2. 测试生成页面功能
3. 验证跨域设置是否正确

## 开发指南

### 前端开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 本地运行
python run.py
```

## 故障排除

1. 如果遇到跨域问题，检查后端CORS设置和前端API调用
2. 如果Vercel构建失败，检查package.json中的构建命令和依赖
3. 如果API调用失败，检查环境变量配置是否正确
