'use client';
import { useState } from 'react';
import { assignApisRoundRobin, unassignAllApis } from '@/lib/firestore/apis';

export default function AssignApisPanel() {
  const [assignStatus, setAssignStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [assignMessage, setAssignMessage] = useState('');

  const [unassignStep, setUnassignStep] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>('idle');
  const [unassignMessage, setUnassignMessage] = useState('');

  async function handleAssign() {
    setAssignStatus('loading');
    setAssignMessage('Assigning APIs...');
    try {
      const result = await assignApisRoundRobin();
      setAssignStatus('success');
      setAssignMessage(`Assigned APIs to ${result.teamsAssigned} teams using ${result.apisUsed} APIs (round robin).`);
    } catch (err: any) {
      setAssignStatus('error');
      setAssignMessage(err.message ?? 'Something went wrong');
    }
  }

  async function handleUnassignConfirm() {
    setUnassignStep('loading');
    setUnassignMessage('Removing all assignments...');
    try {
      const result = await unassignAllApis();
      setUnassignStep('success');
      setUnassignMessage(`Unassigned ${result.teamsUnassigned} teams successfully.`);
    } catch (err: any) {
      setUnassignStep('error');
      setUnassignMessage(err.message ?? 'Something went wrong');
    }
  }

  return (
    <div className="aih-card">
      <p className="aih-sub" style={{ marginTop: 0 }}>
        Distributes all added APIs across every team evenly, in round-robin order.
      </p>

      {/* Assign */}
      <button className="aih-submit aih-mono" onClick={handleAssign} disabled={assignStatus === 'loading'}>
        {assignStatus === 'loading' ? 'Assigning...' : 'Assign APIs to All Teams'}
      </button>
      {assignMessage && (
        <div className={`aih-feedback aih-mono ${assignStatus}`} style={{ marginTop: '1rem' }}>
          {assignMessage}
        </div>
      )}

      {/* Unassign — two-step */}
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(139,134,125,0.2)', paddingTop: '1.5rem' }}>
        <p className="aih-sub" style={{ marginTop: 0 }}>
          Danger zone — removes all API assignments from every team.
        </p>

        {unassignStep === 'idle' && (
          <button
            className="aih-submit aih-mono"
            style={{ background: 'rgba(180,40,40,0.15)', borderColor: 'rgba(200,60,60,0.4)', color: '#f87171' }}
            onClick={() => { setUnassignStep('confirm'); setUnassignMessage(''); }}
          >
            Unassign All APIs
          </button>
        )}

        {unassignStep === 'confirm' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="aih-mono" style={{ color: '#f87171', fontSize: '13px' }}>
              Are you sure? This cannot be undone.
            </span>
            <button
              className="aih-submit aih-mono"
              style={{ background: 'rgba(180,40,40,0.25)', borderColor: 'rgba(200,60,60,0.6)', color: '#f87171' }}
              onClick={handleUnassignConfirm}
            >
              Yes, Unassign All
            </button>
            <button
              className="aih-submit aih-mono"
              style={{ background: 'transparent', borderColor: 'rgba(139,134,125,0.4)', color: '#8b867d' }}
              onClick={() => setUnassignStep('idle')}
            >
              Cancel
            </button>
          </div>
        )}

        {unassignStep === 'loading' && (
          <div className="aih-feedback aih-mono pending" style={{ marginTop: '0.5rem' }}>
            {unassignMessage}
          </div>
        )}

        {(unassignStep === 'success' || unassignStep === 'error') && (
          <>
            <div className={`aih-feedback aih-mono ${unassignStep}`} style={{ marginTop: '0.5rem' }}>
              {unassignMessage}
            </div>
            <button
              className="aih-submit aih-mono"
              style={{ marginTop: '0.75rem', background: 'rgba(180,40,40,0.15)', borderColor: 'rgba(200,60,60,0.4)', color: '#f87171' }}
              onClick={() => { setUnassignStep('idle'); setUnassignMessage(''); }}
            >
              Unassign All APIs
            </button>
          </>
        )}
      </div>
    </div>
  );
}