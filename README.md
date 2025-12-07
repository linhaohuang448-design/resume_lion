<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 简历狮 - 大学生AI简历导师

一个智能的AI助手，帮助大学生将零散经历转化为专业的STAR格式简历内容。

## 功能特点

- 🦁 智能分析：自动识别和分类学生经历（比赛、社团、志愿、实习、项目等）
- 🎯 深度挖掘：通过智能追问挖掘经历亮点
- ✨ 专业输出：生成符合STAR法则的简历内容
- 💼 岗位推荐：根据经历推荐适合的实习岗位

## 本地运行

**前置要求：** Node.js

1. 安装依赖：
   ```bash
   npm install
   ```

2. 配置 API Key：
   - 在项目根目录创建 `.env.local` 文件
   - 添加：`GEMINI_API_KEY=你的API密钥`
   - 获取 API Key：https://aistudio.google.com/apikey

3. 运行应用：
   ```bash
   npm run dev
   ```

4. 在浏览器打开：http://localhost:3000

## 部署

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

## 技术栈

- React 19 + TypeScript
- Vite
- Google Gemini AI
- Tailwind CSS
