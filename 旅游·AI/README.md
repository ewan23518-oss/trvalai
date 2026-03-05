# AI Travel Platform MVP

## 一键部署（避免 Netlify 404）

### 1) 先部署后端（Render）

使用仓库根目录的 `render.yaml`，创建 Blueprint 服务。

必须配置环境变量：
- `GEMINI_API_KEY_ENCRYPTED`
- `APP_ENCRYPTION_KEY`

部署成功后拿到后端地址，例如：
- `https://ai-travel-planner-api.onrender.com`

### 2) 部署前端（Netlify）

仓库已提供两份配置：
- 根目录：`netlify.toml`
- `frontend/netlify.toml`

在 Netlify 新建站点时请严格设置：
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: **留空**（不要手填）

前端环境变量：
- `NEXT_PUBLIC_API_BASE_URL=https://你的Render后端域名`

### 3) 若仍出现 Netlify Page not found

按顺序检查：
1. Site settings -> Build & deploy -> Build settings
- 确认 Base directory 是 `frontend`
- 确认 Publish directory 是空

2. Deploys -> Trigger deploy -> Clear cache and deploy site

3. 确认首页路由存在：`frontend/app/page.tsx`

## 后端本地运行

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## 前端本地运行

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```
