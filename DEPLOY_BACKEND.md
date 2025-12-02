# Deploy Backend to Render (Node.js)

## Step 1: Your Backend is Ready
- Express server in `server/index.js`
- Endpoints: `/api/llm` and `/api/upload`
- Listens on PORT env var (default 3000)

## Step 2: On Render.com

1. Go to **render.com** → **Dashboard**
2. Click **New +** → **Web Service**
3. Select your **OURWEB** GitHub repo
4. Fill in:
   - **Name:** `ourweb-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
5. Click **Create Web Service** (FREE)

## Step 3: Add Environment Variables
After creation, go to **Settings** → **Environment**:
```
OPENAI_API_KEY = your_openai_key
CLOUDINARY_API_KEY = your_cloudinary_key
CLOUDINARY_API_SECRET = your_cloudinary_secret
CLOUDINARY_CLOUD_NAME = your_cloud_name
```

## Step 4: Deploy
- Click **Manual Deploy** or wait for auto-deploy
- Wait ~2-3 minutes for build
- Your API will be at: `https://ourweb-backend.onrender.com`
- Test: `curl https://ourweb-backend.onrender.com/api/llm`

## Note: Free Tier Behavior
- Service spins down after 15 min of inactivity
- First request after sleep takes ~30 sec (cold start)
- Upgrade to paid if you need always-on

Done!
