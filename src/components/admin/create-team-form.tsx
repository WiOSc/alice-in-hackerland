'use client';
import { useState } from 'react';
import { createTeamAccount } from '@/lib/auth/create-team';

export default function CreateTeamForm() {
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('Creating team account...');
    try {
      const result = await createTeamAccount(email, teamId, teamName);
      setStatus('success');
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
    <form className="aih-card" onSubmit={handleSubmit}>
      <div className="aih-field">
        <label className="aih-mono">Team email</label>
        <input className="aih-mono" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="team@example.com" required />
      </div>
      <div className="aih-field">
        <label className="aih-mono">Team ID</label>
        <input className="aih-mono" type="text" value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team123" required />
      </div>
      <div className="aih-field">
        <label className="aih-mono">Team name</label>
        <input className="aih-mono" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. SQUAD-07" required />
      </div>

      <div 
        className={`aih-feedback aih-mono ${status !== 'idle' && status !== 'loading' ? status : status === 'loading' ? 'pending' : ''}`}
        style={{ display: status !== 'idle' ? 'block' : 'none' }}
      >
        {message}
      </div>

      <button className="aih-submit aih-mono" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Creating...' : 'Create team account'}
      </button>
    </form>
  );
}