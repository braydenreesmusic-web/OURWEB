# Deploy Your App to Render (5 minutes)

## What's Happening
- Your frontend (React) builds to static files
- Your backend (Express server) runs on its own
- Render connects them automatically

## Step-by-Step

### 1. Get Environment Variables Ready

#### Firebase (get from console.firebase.google.com):
- Project Settings → Copy these:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID

#### Cloudinary (from cloudinary.com dashboard):
- Dashboard → Settings → Copy these:
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (create unsigned upload preset)
  - CLOUDINARY_API_KEY (optional, for server uploads)
  - CLOUDINARY_API_SECRET (optional, for server uploads)

#### OpenAI (optional, from platform.openai.com):
- API Keys → Copy:
  - OPENAI_API_KEY

### 2. Push Code to GitHub
```bash
cd /Users/braydenrees/Desktop/webbb
git remote set-url origin https://github.com/YOUR_USERNAME/webbb.git
git push -u origin main
```

### 3. Deploy on Render
1. Go to **render.com** → Sign up (free)
2. Click **New +** → **Blueprint**
3. Select **GitHub** and connect your account
4. Choose the `webbb` repository
5. Render automatically detects `render.yaml`
6. Click **Create Blueprint** → Wait for services to spin up

### 4. Set Environment Variables
Once services are created, go to each service and set variables:

#### Frontend (`webbb-frontend`):
- Environment → Add Variables:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY = <your_value>
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = <your_value>
  NEXT_PUBLIC_FIREBASE_PROJECT_ID = <your_value>
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = <your_value>
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = <your_value>
  NEXT_PUBLIC_FIREBASE_APP_ID = <your_value>
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = <your_value>
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = <your_value>
  NEXT_PUBLIC_LLM_ENDPOINT = https://webbb-backend.onrender.com/api/llm
  NEXT_PUBLIC_UPLOAD_ENDPOINT = https://webbb-backend.onrender.com/api/upload
  ```

#### Backend (`webbb-backend`):
- Environment → Add Variables:
  ```
  OPENAI_API_KEY = <your_value>
  CLOUDINARY_API_KEY = <your_value>
  CLOUDINARY_API_SECRET = <your_value>
  CLOUDINARY_CLOUD_NAME = <your_value>
  ```

### 5. Trigger Redeploy
- Go to each service
- Click **Redeploy latest**
- Watch logs to confirm deployment

### 6. Test Your App
- Frontend: `https://webbb-frontend.onrender.com`
- Backend: `https://webbb-backend.onrender.com/api/llm` (test with POST request)

## Done! 🚀
Your app is now live and accessible anywhere!

## Troubleshooting

**Blank page on frontend?**
- Check browser console for errors
- Make sure env vars are set in Render

**Backend not responding?**
- Go to `webbb-backend` service
- Check the logs for errors
- Make sure OpenAI/Cloudinary keys are correct

**Uploads not working?**
- Verify Cloudinary preset is unsigned
- Check CLOUDINARY_CLOUD_NAME is correct

**LLM calls failing?**
- Make sure OPENAI_API_KEY is set
- Check request format in base44Client.js
