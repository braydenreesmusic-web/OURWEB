import * as Firebase from './firebase';
import { signOut } from 'firebase/auth';

// Minimal compatibility shim for the original `base44` client surface.
// Implements: base44.auth.me(), base44.auth.logout(), base44.entities.<Name> with list/create/update/delete,
// and base44.integrations.Core.UploadFile / InvokeLLM.

function makeEntity(name) {
  const colRef = (dbRef) => Firebase.collection(Firebase.db, name);

  async function list(order = undefined, take = undefined) {
    try {
      let q = Firebase.collection(Firebase.db, name);
      const clauses = [];
      if (order) {
        const desc = order.startsWith('-');
        const field = desc ? order.slice(1) : order;
        clauses.push(Firebase.orderBy(field, desc ? 'desc' : 'asc'));
      }
      if (take) {
        clauses.push(Firebase.limit(take));
      }
      if (clauses.length) q = Firebase.query(Firebase.collection(Firebase.db, name), ...clauses);
      const snap = await Firebase.getDocs(q);
      const items = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      return items;
    } catch (err) {
      console.error(`Error listing ${name}:`, err);
      return [];
    }
  }

    async function create(data = {}) {
      try {
        const payload = { ...data, created_date: Firebase.serverTimestamp() };
        const ref = await Firebase.addDoc(Firebase.collection(Firebase.db, name), payload);
        return { id: ref.id, ...payload };
      } catch (err) {
        console.error(`Error creating ${name}:`, err);
        throw err;
      }
    }

    async function update(id, data = {}) {
      try {
        const dRef = Firebase.doc(Firebase.db, name, id);
        await Firebase.updateDoc(dRef, { ...data, updated_date: Firebase.serverTimestamp() });
        return { id, ...data };
      } catch (err) {
        console.error(`Error updating ${name}/${id}:`, err);
        throw err;
      }
    }

    async function remove(id) {
      try {
        const dRef = Firebase.doc(Firebase.db, name, id);
        await Firebase.deleteDoc(dRef);
        return { id };
      } catch (err) {
        console.error(`Error deleting ${name}/${id}:`, err);
        throw err;
      }
    }

    return { list, create, update, delete: remove };
  }

  // Known entities used across the app. Additional entity names will be handled by the proxy.
  const knownEntities = [
    'Bookmark','DailyCheckIn','DateIdea','Event','Insight','ListeningSession',
    'LocationShare','MemoryPin','Music','Note','Photo','Playlist','RelationshipData',
    'SharedTask','User','Video','UserPresence'
  ];

  const entities = {};
  knownEntities.forEach(n => { entities[n] = makeEntity(n); });

  const entitiesProxy = new Proxy(entities, {
    get(target, prop) {
      if (prop in target) return target[prop];
      const name = String(prop);
      const val = makeEntity(name);
      target[name] = val;
      return val;
    }
  });

  async function me() {
    try {
      return await Firebase.getCurrentUser();
    } catch (err) {
      console.error('auth.me error:', err);
      return null;
    }
  }

  async function logout() {
    try {
      await signOut(Firebase.auth);
    } catch (err) {
      console.error('logout error:', err);
    }
  }

  async function uploadFile({ file, base64 } = {}) {
    // Prefer server proxy if available, otherwise fallback to unsigned Cloudinary
    try {
      if (typeof window !== 'undefined') {
        const form = new FormData();
        if (file) form.append('file', file);
        else if (base64) form.append('file', base64);
        else throw new Error('No file provided');
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error('Server upload failed');
        return await res.json();
      }
    } catch (err) {
      console.warn('Server upload failed, falling back to client Cloudinary:', err?.message || err);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured');
    return await uploadToCloudinary({ file, base64 });
  }

  async function invokeLLM(payload = {}) {
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('LLM invocation failed');
      return await res.json();
    } catch (err) {
      console.error('InvokeLLM error:', err);
      throw err;
    }
  }

  export const base44 = {
    auth: { me, logout },
    entities: entitiesProxy,
    integrations: { Core: { UploadFile: uploadFile, InvokeLLM: invokeLLM } }
  };

  export default base44;
