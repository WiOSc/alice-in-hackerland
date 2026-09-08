'use client';
import { useState, useEffect } from 'react';
import { listAllTickets, addTicketReply, closeTicket, resolveTicket } from '@/lib/firestore/tickets';

export default function AdminTicketManager() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [replyError, setReplyError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await listAllTickets();
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
      await addTicketReply(ticketId, replyText, 'admin');
      setReplyText('');
      setReplyStatus('idle');
      load();
    } catch (err: any) {
      setReplyStatus('error');
      setReplyError(err.message ?? 'Failed');
    }
  }

  async function handleClose(ticketId: string) {
    try {
      await closeTicket(ticketId);
      load();
    } catch { /* ignore */ }
  }

  async function handleResolve(ticketId: string) {
    try {
      await resolveTicket(ticketId);
      load();
    } catch { /* ignore */ }
  }

  if (loading) {
    return <p className="aih-mono" style={{ marginTop: '1rem', color: 'var(--aih-green)' }}>Loading tickets...</p>;
  }

  if (tickets.length === 0) {
    return <p className="aih-sub" style={{ marginTop: '1rem' }}>No tickets found.</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      {tickets.map((t) => (
        <div key={t.id} className="aih-card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="aih-mono" style={{ fontSize: '14px' }}>{t.subject}</span>
              <span className="aih-mono" style={{ fontSize: '11px', color: 'rgba(236,231,216,0.5)', marginLeft: '0.75rem' }}>
                {t.teamName}
              </span>
            </div>
            <span className="aih-mono" style={{ fontSize: '11px', color: t.status === 'open' ? 'var(--aih-green)' : 'var(--aih-red)' }}>
              {t.status.toUpperCase()}
            </span>
          </div>
          {expanded === t.id && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(139,134,125,0.2)', paddingTop: '1rem' }}>
              {t.messages.map((m: any, i: number) => (
                <div key={i} style={{ marginBottom: '0.75rem', fontSize: '13px' }}>
                  <span className="aih-mono" style={{ color: m.sender === 'admin' ? 'var(--aih-red)' : 'var(--aih-green)', fontSize: '11px' }}>
                    {m.sender === 'admin' ? 'Admin' : t.teamName}
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
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                    <button className="aih-table-btn" onClick={(e) => { e.stopPropagation(); handleReply(t.id); }} disabled={replyStatus === 'loading'}>
                      {replyStatus === 'loading' ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button className="aih-table-btn" onClick={(e) => { e.stopPropagation(); handleClose(t.id); }}>
                      Close
                    </button>
                    <button className="aih-table-btn" onClick={(e) => { e.stopPropagation(); handleResolve(t.id); }}>
                      Resolve
                    </button>
                  </div>
                  {replyStatus === 'error' && (
                    <p className="aih-mono" style={{ color: 'var(--aih-red)', fontSize: '11px', marginTop: '0.3rem' }}>{replyError}</p>
                  )}
                </div>
              )}
              {t.status !== 'open' && (
                <p className="aih-mono" style={{ color: 'rgba(236,231,216,0.5)', fontSize: '11px', marginTop: '0.5rem' }}>
                  This ticket is {t.status}.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}