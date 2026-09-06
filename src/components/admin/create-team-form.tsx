'use client';
import { useState } from 'react';
import { createTeamAccount } from '@/lib/auth/create-team';

export default function CreateTeamForm() {
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const result = await createTeamAccount(email, teamId, teamName);
      setStatus('done');
      setMessage(`Team account created. UID: ${result.uid}`);
      setEmail('');
      setTeamId('');
      setTeamName('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message ?? 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Team email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Team ID</label>
        <input type="text" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team123" required />
      </div>
      <div>
        <label>Team name</label>
        <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
      </div>
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating...' : 'Create team account'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}  //for testing 