# OURWEB

## Troubleshooting Firestore CORS / Listen errors
 - Symptom: Devtools shows "Fetch API cannot load ... Firestore/Listen ... due to access control checks".
 - Causes:
	 - Your site origin is not in Firebase Authentication "Authorized domains".
	 - Browser/network blocks streaming requests; Firestore Listen falls back to long-polling.
	 - Code initializing Firestore on the server side (non-browser environment).
 - Fixes implemented:
	 - Client Firestore uses long-polling (`experimentalAutoDetectLongPolling: true`, `useFetchStreams: false`).
	 - Initialization is browser-guarded to avoid server-side SDK usage.
 - Action items for you:
	 - Add your domain (e.g., `localhost:5173`, `your-render-domain`, `custom-domain`) to Firebase Console → Authentication → Settings → Authorized domains.
	 - Verify `.env` has correct Firebase values (`VITE_FIREBASE_*`) and matches your project.
	 - Ensure you run via Vite dev server or deployed HTTPS origin, not `file://`.

### Quick check
Run the app locally and confirm Firestore connects without CORS errors:

```
npm install
npm run dev
```

Open the shown `http://localhost:5173` and watch devtools Network → `googleapis.com` requests. If still failing, confirm the localhost domain is in Authorized domains.
# webbb — local dev

Quick setup for local development (Vite + React).

1. Copy `.env.example` to `.env` and fill in values (Firebase, Cloudinary, etc.).

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start dev server:
```bash
npm run dev
```

Notes
- This repo expects a small API shim at `api/base44Client.js` that maps `base44.*` calls to your backend (Firestore + Cloudinary) — a starter shim is included.
- If you want server-side LLM or upload proxy, add server endpoints and set `NEXT_PUBLIC_LLM_ENDPOINT` to your proxy URL.
