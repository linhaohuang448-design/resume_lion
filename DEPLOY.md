# 简历狮 - 部署指南

本文档将帮助你将简历狮应用部署到云端，让其他人可以直接访问使用。

## 🚀 推荐部署方式：Vercel（最简单）

### 第一步：准备代码仓库

1. **创建 GitHub 仓库**（如果还没有）
   - 访问 https://github.com/new
   - 创建新仓库，例如：`resume-lion`
   - 将代码推送到 GitHub

2. **确保 .env.local 不会被提交**
   - `.gitignore` 已包含 `*.local`，所以 `.env.local` 不会被提交（这是正确的）

### 第二步：部署到 Vercel

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在 "Environment Variables" 部分
   - 添加变量：
     - **Name**: `GEMINI_API_KEY`
     - **Value**: 你的 Gemini API Key（`AIzaSyBxbtLong601W3I01w4GyDyzhTmsv0wwnw`）
   - 点击 "Save"

4. **部署设置**
   - Framework Preset: 选择 "Vite"（或保持默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `dist`（默认）
   - Install Command: `npm install`（默认）
   - 点击 "Deploy"

5. **等待部署完成**
   - 部署通常需要 1-2 分钟
   - 完成后会获得一个 URL，例如：`https://resume-lion.vercel.app`

### 第三步：分享链接

部署完成后，你可以直接分享 Vercel 提供的 URL 给其他人使用！

---

## 🌐 备选方案：Netlify

### 部署步骤

1. **访问 Netlify**
   - 打开 https://www.netlify.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - 点击 "Show advanced"
   - 添加环境变量：
     - Key: `GEMINI_API_KEY`
     - Value: 你的 API Key

4. **部署**
   - 点击 "Deploy site"
   - 等待部署完成

---

## 📦 本地构建测试

在部署前，你可以先在本地测试构建：

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

## ⚠️ 重要提示

1. **API Key 安全**
   - ✅ 环境变量已配置在平台，不会暴露在代码中
   - ✅ `.env.local` 不会被提交到 Git
   - ⚠️ 注意：如果 API Key 有使用限制，建议设置配额限制

2. **免费额度**
   - Vercel 和 Netlify 都提供免费套餐
   - 对于个人项目通常足够使用

3. **自定义域名**（可选）
   - Vercel 和 Netlify 都支持绑定自定义域名
   - 在项目设置中可以配置

---

## 🔗 快速链接

- **Vercel**: https://vercel.com
- **Netlify**: https://www.netlify.com
- **GitHub**: https://github.com
- **Gemini API Key**: https://aistudio.google.com/apikey

---

## 📝 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] 在部署平台配置了 `GEMINI_API_KEY` 环境变量
- [ ] 本地构建测试通过（`npm run build`）
- [ ] 部署成功，可以访问
- [ ] 测试应用功能是否正常

部署完成后，你就可以通过分享链接让其他人使用你的应用了！🎉

