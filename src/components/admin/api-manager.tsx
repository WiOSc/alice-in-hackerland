'use client';
import { useState, useEffect } from 'react';
import { addApi, listApis, updateApi, deleteApi } from '@/lib/firestore/apis';

export default function ApiManager() {
  const [api, setApi] = useState('');
  const [apiName, setApiName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [apis, setApis] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editApi, setEditApi] = useState('');
  const [editApiName, setEditApiName] = useState('');
  const [editProblemStatement, setEditProblemStatement] = useState('');

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

  function startEdit(a: any) {
    setEditingId(a.id);
    setEditApi(a.api);
    setEditApiName(a.apiName);
    setEditProblemStatement(a.problemStatement);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditApi('');
    setEditApiName('');
    setEditProblemStatement('');
  }

  async function handleUpdate(id: string) {
    try {
      await updateApi(id, editApi, editApiName, editProblemStatement);
      cancelEdit();
      loadApis();
    } catch (err: any) {
      alert(err.message ?? 'Failed to update API');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this API? This cannot be undone.')) return;
    try {
      await deleteApi(id);
      loadApis();
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete API');
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apis.map((a) => (
                editingId === a.id ? (
                  <tr key={a.id}>
                    <td><input className="aih-mono" value={editApiName} onChange={(e) => setEditApiName(e.target.value)} style={{ width: '100%', background: 'rgba(236,231,216,0.03)', border: '1px solid rgba(139,134,125,0.3)', color: '#ece7d8', padding: '0.25rem', fontSize: '12px' }} /></td>
                    <td><input className="aih-mono" value={editApi} onChange={(e) => setEditApi(e.target.value)} style={{ width: '100%', background: 'rgba(236,231,216,0.03)', border: '1px solid rgba(139,134,125,0.3)', color: '#ece7d8', padding: '0.25rem', fontSize: '12px' }} /></td>
                    <td><input className="aih-mono" value={editProblemStatement} onChange={(e) => setEditProblemStatement(e.target.value)} style={{ width: '100%', background: 'rgba(236,231,216,0.03)', border: '1px solid rgba(139,134,125,0.3)', color: '#ece7d8', padding: '0.25rem', fontSize: '12px' }} /></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <button className="aih-table-btn" onClick={() => handleUpdate(a.id)}>Save</button>
                        <button className="aih-table-btn" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={a.id}>
                    <td>{a.apiName}</td>
                    <td style={{ fontSize: '12px' }}>{a.api}</td>
                    <td>{a.problemStatement}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <button className="aih-table-btn" onClick={() => startEdit(a)}>Edit</button>
                        <button className="aih-table-btn" onClick={() => handleDelete(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}