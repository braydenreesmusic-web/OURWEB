import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../api/firebase';
import { Button } from '../Components/ui/button';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur border border-white/40 rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome back</h1>
        <p className="text-sm text-gray-600 mb-4">Sign in to continue</p>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <Button onClick={handleGoogle} disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
}
