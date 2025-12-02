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
