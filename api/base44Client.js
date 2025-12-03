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
