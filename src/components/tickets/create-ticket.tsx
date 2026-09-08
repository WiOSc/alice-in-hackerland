'use client';
import { useState } from 'react';
import { createTicket } from '@/lib/firestore/tickets';

export default function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setFeedback('Submitting ticket...');
    try {
      await createTicket(subject, message);
      setStatus('success');
      setFeedback('Ticket submitted successfully.');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.message ?? 'Something went wrong');
    }
  }

  return (
    <form className="aih-card" onSubmit={handleSubmit}>
      <div className="aih-field">
        <label className="aih-mono">Subject</label>
        <input className="aih-mono" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. API not working" required />
      </div>
      <div className="aih-field">
        <label className="aih-mono">Message</label>
        <textarea
          className="aih-mono aih-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue..."
          rows={4}
          required
        />
      </div>
      <div className={`aih-feedback aih-mono ${status === 'loading' ? 'pending' : status}`} style={{ display: status !== 'idle' ? 'block' : 'none' }}>
        {feedback}
      </div>
      <button className="aih-submit aih-mono" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  );
}