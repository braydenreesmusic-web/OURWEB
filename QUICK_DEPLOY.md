# Quick Manual Deployment Summary

## Timeline: 10 minutes total

### DEPLOY BACKEND FIRST (5 min)
1. **render.com** → **New +** → **Web Service**
2. Connect **OURWEB** repo
3. Settings:
   - Name: `ourweb-backend`
   - Environment: `Node`
   - Build: `npm install`
   - Start: `node server/index.js`
4. Add secrets (Settings → Environment):
   - OPENAI_API_KEY
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - CLOUDINARY_CLOUD_NAME
5. Deploy and wait for URL (e.g., `https://ourweb-backend.onrender.com`)

### DEPLOY FRONTEND SECOND (5 min)
1. **render.com** → **New +** → **Static Site**
2. Connect **OURWEB** repo again
3. Settings:
   - Name: `ourweb-frontend`
   - Build: `npm run build`
   - Publish: `dist`
4. Add environment vars (Settings → Environment):
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
   - NEXT_PUBLIC_LLM_ENDPOINT = https://ourweb-backend.onrender.com/api/llm
   - NEXT_PUBLIC_UPLOAD_ENDPOINT = https://ourweb-backend.onrender.com/api/upload
5. Deploy and get frontend URL (e.g., `https://ourweb-frontend.onrender.com`)

### DONE! 🚀
- Frontend: https://ourweb-frontend.onrender.com
- Backend: https://ourweb-backend.onrender.com

Both are live and talking to each other!
