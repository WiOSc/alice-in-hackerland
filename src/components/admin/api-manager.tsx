'use client';
import { useState, useEffect } from 'react';
import { addApi, listApis } from '@/lib/firestore/apis';

export default function ApiManager() {
  const [api, setApi] = useState('');
  const [apiName, setApiName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [apis, setApis] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function loadApis() {
    try {
      const data = await listApis();
      setApis(data);
    } catch { /* ignore */ }
  }

  useEffect(() => { loadApis(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('Adding API...');
    try {
      await addApi(api, apiName, problemStatement);
      setStatus('success');
      setMessage('API added successfully.');
      setApi('');
      setApiName('');
      setProblemStatement('');
      loadApis();
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message ?? 'Something went wrong');
    }
  }

  return (
    <div>
      <form className="aih-card" onSubmit={handleSubmit}>
        <div className="aih-field">
          <label className="aih-mono">API</label>
          <input className="aih-mono" type="text" value={api} onChange={(e) => setApi(e.target.value)} placeholder="https://api.example.com/endpoint" required />
        </div>
        <div className="aih-field">
          <label className="aih-mono">API Name</label>
          <input className="aih-mono" type="text" value={apiName} onChange={(e) => setApiName(e.target.value)} placeholder="e.g. Weather API" required />
        </div>
        <div className="aih-field">
          <label className="aih-mono">Problem Statement</label>
          <input className="aih-mono" type="text" value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="e.g. Build a weather dashboard" required />
        </div>
        <div className={`aih-feedback aih-mono ${status === 'loading' ? 'pending' : status}`} style={{ display: status !== 'idle' ? 'block' : 'none' }}>
          {message}
        </div>
        <button className="aih-submit aih-mono" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Adding...' : 'Add API'}
        </button>
      </form>

      {apis.length > 0 && (
        <div className="aih-table-wrap" style={{ marginTop: '2rem' }}>
          <table className="aih-table">
            <thead>
              <tr>
                <th>API Name</th>
                <th>API</th>
                <th>Problem Statement</th>
              </tr>
            </thead>
            <tbody>
              {apis.map((a) => (
                <tr key={a.id}>
                  <td>{a.apiName}</td>
                  <td style={{ fontSize: '12px' }}>{a.api}</td>
                  <td>{a.problemStatement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}