// cloudinary.js
export async function uploadToCloudinary({ file, base64 }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();
  if (file) form.append('file', file);
  else if (base64) form.append('file', base64);
  else throw new Error('No file or base64 provided for upload');

  form.append('upload_preset', uploadPreset);

  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Cloudinary upload failed');
  return json;
}
// cloudinary.js
// Simple upload helper using unsigned Cloudinary uploads.
// Requires environment variables: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export async function uploadToCloudinary({ file, base64 }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();
  if (file) form.append('file', file);
  else if (base64) form.append('file', base64);
  else throw new Error('No file or base64 provided for upload');

  form.append('upload_preset', uploadPreset);

  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Cloudinary upload failed');
  return json;
}
