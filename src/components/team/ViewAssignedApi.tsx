'use client';
import { useState, useEffect } from 'react';
import { getMyAssignedApi } from '@/lib/firestore/apis';

export default function ViewAssignedApi() {
  const [api, setApi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssignedApi().then(setApi).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="aih-mono" style={{ color: 'var(--aih-green)' }}>Loading...</p>;
  }

  if (!api) {
    return (
      <div className="aih-card">
        <p className="aih-mono text-white/60">No API has been assigned to your team yet.</p>
      </div>
    );
  }

  return (
    <div className="aih-card">
      <p className="aih-sub" style={{ marginTop: 0, marginBottom: '1.5rem' }}>Your assigned API</p>
      <div className="aih-field">
        <label className="aih-mono">API Name</label>
        <p className="aih-mono">{api.apiName}</p>
      </div>
      <div className="aih-field">
        <label className="aih-mono">API Link</label>
        <a 
          href={api.api} 
          target="_blank" 
          rel="noopener noreferrer"
          className="aih-mono" 
          style={{ 
            fontSize: '13px', 
            color: 'var(--aih-green)', 
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
        >
          {api.api}
        </a>
      </div>
    </div>
  );
}