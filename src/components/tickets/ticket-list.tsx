'use client';
import { useState, useEffect } from 'react';
import { listMyTickets, addTicketReply } from '@/lib/firestore/tickets';

export default function MyTicketList() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [replyError, setReplyError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await listMyTickets();
      setTickets(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleReply(ticketId: string) {
    if (!replyText.trim()) return;
    setReplyStatus('loading');
    setReplyError('');
    try {
      await addTicketReply(ticketId, replyText, 'user');
      setReplyText('');
      setReplyStatus('idle');
      load();
    } catch (err: any) {
      setReplyStatus('error');
      setReplyError(err.message ?? 'Failed');
    }
  }

  if (loading) {
    return <p className="aih-mono" style={{ marginTop: '1rem', color: 'var(--aih-green)' }}>Loading tickets...</p>;
  }

  if (tickets.length === 0) {
    return <p className="aih-sub" style={{ marginTop: '1rem' }}>No tickets submitted yet.</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {tickets.map((t) => (
        <div key={t.id} className="aih-card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="aih-mono" style={{ fontSize: '14px' }}>{t.subject}</span>
            <span className="aih-mono" style={{ fontSize: '11px', color: t.status === 'open' ? 'var(--aih-green)' : 'var(--aih-red)' }}>
              {t.status.toUpperCase()}
            </span>
          </div>
          {expanded === t.id && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(139,134,125,0.2)', paddingTop: '1rem' }}>
              {t.messages.map((m: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.75rem', fontSize: '13px' }}>
                  <span className="aih-mono" style={{ color: m.sender === 'admin' ? 'var(--aih-red)' : 'var(--aih-green)', fontSize: '11px' }}>
                    {m.sender === 'admin' ? 'Admin' : 'You'}
                  </span>
                  <p style={{ margin: '0.25rem 0 0', color: 'rgba(236,231,216,0.8)' }}>{m.text}</p>
                </div>
              ))}
              {t.status === 'open' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <textarea
                    className="aih-mono aih-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    className="aih-table-btn"
                    style={{ marginTop: '0.4rem' }}
                    onClick={(e) => { e.stopPropagation(); handleReply(t.id); }}
                    disabled={replyStatus === 'loading'}
                  >
                    {replyStatus === 'loading' ? 'Sending...' : 'Send Reply'}
                  </button>
                  {replyStatus === 'error' && (
                    <p className="aih-mono" style={{ color: 'var(--aih-red)', fontSize: '11px', marginTop: '0.3rem' }}>{replyError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}