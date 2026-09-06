'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm({ expectedRole }: { expectedRole: 'admin' | 'team' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await cred.user.getIdTokenResult();

      if (idTokenResult.claims.role !== expectedRole) {
        await signOut(auth);
        setError(`This login is for ${expectedRole}s only.`);
        return;
      }

      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idTokenResult.token }),
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p>{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}