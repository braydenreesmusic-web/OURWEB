// base44Client.js
import { getCurrentUser, db, serverTimestamp, collection, query, orderBy, limit, getDocs, addDoc, doc, updateDoc, deleteDoc, where } from './firebase';
import { uploadToCloudinary } from './cloudinary';

function parseOrder(orderStr = '-created_date') {
  if (!orderStr) return ['created_date', 'desc'];
  const dir = orderStr.startsWith('-') ? 'desc' : 'asc';
  const field = orderStr.replace(/^-/, '');
  return [field, dir];
}

async function listCollection(name, orderStr, lim) {
  const [field, dir] = parseOrder(orderStr);
  const colRef = collection(db, name);
  const constraints = [orderBy(field, dir)];
  if (lim) constraints.push(limit(lim));
  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function createInCollection(name, data) {
  const colRef = collection(db, name);
  const payload = { ...data, created_date: serverTimestamp() };
  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
}

async function updateInCollection(name, id, data) {
  const docRef = doc(db, name, id);
  await updateDoc(docRef, data);
  return { id, ...data };
}

async function deleteFromCollection(name, id) {
  const docRef = doc(db, name, id);
  await deleteDoc(docRef);
  return { id };
}

const Music = {
  list: (orderStr, lim) => listCollection('music', orderStr, lim),
  create: (data) => createInCollection('music', data),
  update: (id, data) => updateInCollection('music', id, data),
  delete: (id) => deleteFromCollection('music', id)
};

const Playlist = {
  list: (orderStr, lim) => listCollection('playlists', orderStr, lim),
  create: (data) => createInCollection('playlists', data),
  update: (id, data) => updateInCollection('playlists', id, data),
  delete: (id) => deleteFromCollection('playlists', id)
};

const ListeningSession = {
  list: (orderStr, lim) => listCollection('listening_sessions', orderStr, lim),
  create: (data) => createInCollection('listening_sessions', data),
  update: (id, data) => updateInCollection('listening_sessions', id, data),
  delete: (id) => deleteFromCollection('listening_sessions', id)
};

const DailyCheckIn = {
  list: (orderStr, lim) => listCollection('daily_checkins', orderStr, lim),
  create: (data) => createInCollection('daily_checkins', data),
  update: (id, data) => updateInCollection('daily_checkins', id, data),
  delete: (id) => deleteFromCollection('daily_checkins', id)
};

const Note = {
  list: (orderStr, lim) => listCollection('notes', orderStr, lim),
  create: (data) => createInCollection('notes', data),
  update: (id, data) => updateInCollection('notes', id, data),
  delete: (id) => deleteFromCollection('notes', id)
};

const RelationshipInsight = {
  list: (orderStr, lim) => listCollection('relationship_insights', orderStr, lim),
  create: (data) => createInCollection('relationship_insights', data),
  update: (id, data) => updateInCollection('relationship_insights', id, data),
  delete: (id) => deleteFromCollection('relationship_insights', id)
};

const Event = {
  list: (orderStr, lim) => listCollection('events', orderStr, lim),
  create: (data) => createInCollection('events', data),
  update: (id, data) => updateInCollection('events', id, data),
  delete: (id) => deleteFromCollection('events', id)
};

const Bookmark = {
  list: (orderStr, lim) => listCollection('bookmarks', orderStr, lim),
  create: (data) => createInCollection('bookmarks', data),
  update: (id, data) => updateInCollection('bookmarks', id, data),
  delete: (id) => deleteFromCollection('bookmarks', id)
};

const DateIdea = {
  list: (orderStr, lim) => listCollection('date_ideas', orderStr, lim),
  create: (data) => createInCollection('date_ideas', data),
  update: (id, data) => updateInCollection('date_ideas', id, data),
  delete: (id) => deleteFromCollection('date_ideas', id)
};

const SharedTask = {
  list: (orderStr, lim) => listCollection('shared_tasks', orderStr, lim),
  create: (data) => createInCollection('shared_tasks', data),
  update: (id, data) => updateInCollection('shared_tasks', id, data),
  delete: (id) => deleteFromCollection('shared_tasks', id)
};

const LocationShare = {
  list: (orderStr, lim) => listCollection('location_shares', orderStr, lim),
  create: (data) => createInCollection('location_shares', data),
  update: (id, data) => updateInCollection('location_shares', id, data),
  delete: (id) => deleteFromCollection('location_shares', id)
};

// Simple LLM invoke + file upload wrappers
async function invokeLLM({ prompt, response_json_schema } = {}) {
  const endpoint = process.env.NEXT_PUBLIC_LLM_ENDPOINT;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }

  // return small mocks for common schemas
  if (response_json_schema && response_json_schema.properties && response_json_schema.properties.suggestions) {
    return { suggestions: [
      "Thinking of you — can't wait to see you.",
      "You make my day so much better.",
      "Let’s plan a cozy dinner tonight.",
      "Hope your day is going well — I love you."
    ] };
  }

  if (response_json_schema && response_json_schema.properties && response_json_schema.properties.insights) {
    return { insights: [
      { type: 'communication_tip', title: 'Ask and Listen', content: 'Create space for open questions and listening.' },
      { type: 'date_suggestion', title: 'Picnic at Sunset', content: 'A short picnic can be a cozy low-effort date.' },
      { type: 'pattern', title: 'Weekly Rhythm', content: 'Try scheduling a weekly check-in to stay connected.' }
    ] };
  }

  return {};
}

async function uploadFile({ file }) {
  // If file is a File object or base64 string, pass to cloudinary helper
  if (!file) throw new Error('No file provided');
  const res = await uploadToCloudinary({ file });
  return { file_url: res.secure_url, raw: res };
}

const auth = { me: () => getCurrentUser() };

export const base44 = {
  auth,
  entities: {
    Music,
    Playlist,
    ListeningSession,
    DailyCheckIn,
    Note,
    RelationshipInsight,
    Event,
    Bookmark,
    DateIdea,
    SharedTask,
    LocationShare
  },
  uploadToCloudinary,
  integrations: {
    Core: {
      InvokeLLM: (opts) => invokeLLM(opts),
      UploadFile: (opts) => uploadFile(opts)
    }
  }
};

export default base44;
