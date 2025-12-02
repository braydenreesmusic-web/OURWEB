# Deploy to Render

## 1. Prepare your credentials

Get these from:
- **Firebase**: console.firebase.google.com → Project settings
- **Cloudinary**: cloudinary.com → Dashboard → Settings
- **OpenAI** (optional): platform.openai.com → API keys

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/webbb.git
git push -u origin main
```

## 3. Deploy on Render

1. Go to **render.com** → Sign up (free)
2. Click **New** → **Blueprint** → Connect GitHub repo
3. Select the repo, it will auto-detect `render.yaml`
4. Render will create 2 services:
   - `webbb-frontend` (static React site)
   - `webbb-backend` (Express server)

## 4. Set Environment Variables

In Render dashboard:
- Go to `webbb-frontend` → Environment
  - Set all `NEXT_PUBLIC_*` vars from Firebase + Cloudinary
  - Set `NEXT_PUBLIC_LLM_ENDPOINT=https://webbb-backend.render.com/api/llm`
  - Set `NEXT_PUBLIC_UPLOAD_ENDPOINT=https://webbb-backend.render.com/api/upload`

- Go to `webbb-backend` → Environment
  - Set `OPENAI_API_KEY`, `CLOUDINARY_*` keys
  - `PORT` and `NODE_ENV` are already set

## 5. Redeploy

Click "Redeploy" on both services. Watch the logs.

## 6. Test

- Frontend: `https://webbb-frontend.render.com`
- Backend: `https://webbb-backend.render.com/api/llm` (test with POST)

Done! Your app is live.
