import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './api/firebase';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not signed in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);
  return user;
}
