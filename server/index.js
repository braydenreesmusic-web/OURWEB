// Simple Express server with two endpoints:
// POST /api/llm  -> proxies to OpenAI (server-side) or returns a mock
// POST /api/upload -> accepts a file upload and forwards to Cloudinary using server-side credentials

import express from 'express';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;

app.post('/api/llm', async (req, res) => {
  try {
    const { prompt } = req.body;
    const OPENAI_KEY = process.env.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;
    if (!OPENAI_KEY) {
      // Return a safe mock if key not configured
      return res.json({ mock: true, result: `MOCK RESPONSE for prompt: ${prompt?.slice(0, 200)}` });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400
    }, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });

    return res.json(response.data);
  } catch (err) {
    console.error('LLM proxy error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'LLM proxy failed', details: err?.message || err });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { 173213128135825, nFLwOht7Jk2QlbDLOMZ76NAP6Ec, dgip2lmxu } = process.env;
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: 'Cloudinary not configured on server' });
    }

    // Build formdata for unsigned or signed upload
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `upload_${timestamp}`;
    const payload = new URLSearchParams();
    payload.append('file', `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    payload.append('timestamp', String(timestamp));
    payload.append('public_id', publicId);

    // If you want to use signed uploads, compute signature here using the API secret.
    // For simplicity we assume an unsigned preset is configured on Cloudinary and use upload_preset.
    if (process.env.CLOUDINARY_UPLOAD_PRESET) payload.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

    const cloudUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const r = await axios.post(cloudUrl, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return res.json(r.data);
  } catch (err) {
    console.error('Upload error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Upload failed', details: err?.message || err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
