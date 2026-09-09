'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

export default function LoginForm({ expectedRole }: { expectedRole: 'admin' | 'team' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const isAdmin = expectedRole === 'admin';
  const emailLabel = isAdmin ? 'Admin Email' : 'Team Email / Code';
  const emailPlaceholder = isAdmin ? 'admin@example.com' : 'e.g. SQUAD-07';
  const invalidMsg = isAdmin ? 'Enter both an email and a password.' : 'Enter both a team code and a passkey.';
  const checkingMsg = isAdmin ? 'Checking credentials…' : 'Checking credentials…';
  const successMsg = isAdmin ? 'Verified. Redirecting to the dashboard…' : 'Team verified. Redirecting to the arena…';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setStatus('error');
      setMessage(invalidMsg);
      return;
    }

    setStatus('pending');
    setMessage(checkingMsg);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await cred.user.getIdTokenResult();

      if (idTokenResult.claims.role !== expectedRole) {
        await signOut(auth);
        setStatus('error');
        setMessage(`This login is for ${expectedRole}s only.`);
        return;
      }

      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idTokenResult.token }),
      });

      setStatus('success');
      setMessage(successMsg);
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch (err: any) {
      setStatus('error');
      setMessage('Invalid email or password');
    }
  }

  return (
    <form className="aih-card" onSubmit={handleLogin} noValidate>
      <div className="aih-field">
        <label className="aih-mono" htmlFor="teamCode">{emailLabel}</label>
        <input 
          className="aih-mono" 
          type="text" 
          id="teamCode" 
          placeholder={emailPlaceholder} 
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="aih-field">
        <label className="aih-mono" htmlFor="teamPass">Passkey</label>
        <input 
          className="aih-mono" 
          type="password" 
          id="teamPass" 
          placeholder="••••••••" 
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div 
        className={`aih-feedback aih-mono ${status !== 'idle' ? status : ''}`}
        style={{ display: status !== 'idle' ? 'block' : 'none' }}
      >
        {message}
      </div>

      <button 
        type="submit" 
        className="aih-submit aih-mono"
        disabled={status === 'pending' || status === 'success'}
      >
        {status === 'pending' ? 'Checking…' : status === 'success' ? 'Logged in' : 'Login'}
      </button>
    </form>
  );
}