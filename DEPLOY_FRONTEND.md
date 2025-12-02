# Deploy Frontend to Render (Static Site)

## Step 1: Prepare Your Code
Your frontend is already built with:
- `npm run build` → creates `dist/` folder
- Vite React app with path aliases
- Ready for production

## Step 2: On Render.com

1. Go to **render.com** → **Dashboard**
2. Click **New +** → **Static Site**
3. Select your **OURWEB** GitHub repo
4. Fill in:
   - **Name:** `ourweb-frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site** (FREE)

## Step 3: Add Environment Variables
After creation, go to **Settings** → **Environment**:
```
NEXT_PUBLIC_FIREBASE_API_KEY = your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = your_upload_preset
NEXT_PUBLIC_LLM_ENDPOINT = https://ourweb-backend.onrender.com/api/llm
NEXT_PUBLIC_UPLOAD_ENDPOINT = https://ourweb-backend.onrender.com/api/upload
```

## Step 4: Deploy
- Click **Redeploy latest**
- Wait ~2-3 minutes for build
- Your site will be at: `https://ourweb-frontend.onrender.com`

Done!
