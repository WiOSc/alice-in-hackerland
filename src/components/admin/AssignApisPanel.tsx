'use client';
import { useState } from 'react';
import { assignApisRoundRobin } from '@/lib/firestore/apis';

export default function AssignApisPanel() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleAssign() {
    setStatus('loading');
    setMessage('Assigning APIs...');
    try {
      const result = await assignApisRoundRobin();
      setStatus('success');
      setMessage(`Assigned APIs to ${result.teamsAssigned} teams using ${result.apisUsed} APIs (round robin).`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message ?? 'Something went wrong');
    }
  }

  return (
    <div className="aih-card">
      <p className="aih-sub" style={{ marginTop: 0 }}>
        Distributes all added APIs across every team evenly, in round-robin order.
      </p>
      <button className="aih-submit aih-mono" onClick={handleAssign} disabled={status === 'loading'}>
        {status === 'loading' ? 'Assigning...' : 'Assign APIs to All Teams'}
      </button>
      {message && (
        <div className={`aih-feedback aih-mono ${status}`} style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
    </div>
  );
}