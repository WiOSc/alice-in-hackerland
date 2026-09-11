'use client';
import { useState, useEffect } from 'react';
import { listTeams, resetTeamPassword, updateTeamPoints, toggleTeamQualified } from '@/lib/firestore/teams';
import { listApis, assignApiToTeam } from '@/lib/firestore/apis';

export default function TeamManager() {
  const [teams, setTeams] = useState<any[]>([]);
  const [allApis, setAllApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ uid: string; msg: string; type: string } | null>(null);
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [changingPs, setChangingPs] = useState<string | null>(null);
  const [selectedApiId, setSelectedApiId] = useState<string>('');
  const [psLoading, setPsLoading] = useState(false);

  async function loadTeams() {
    setLoading(true);
    try {
      const [teamData, apiData] = await Promise.all([listTeams(), listApis()]);
      setTeams(teamData);
      setAllApis(apiData);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadTeams(); }, []);

  async function handleChangePs(uid: string) {
    if (!selectedApiId) return;
    setPsLoading(true);
    try {
      await assignApiToTeam(uid, selectedApiId);
      setFeedback({ uid, msg: 'Problem statement updated.', type: 'success' });
      setChangingPs(null);
      setSelectedApiId('');
      loadTeams();
    } catch (err: any) {
      setFeedback({ uid, msg: err.message ?? 'Failed to update PS', type: 'error' });
    }
    setPsLoading(false);
  }

  async function handleResetPassword(uid: string) {
    try {
      const result = await resetTeamPassword(uid);
      setFeedback({ uid, msg: `New password: ${result.newPassword}`, type: 'success' });
    } catch (err: any) {
      setFeedback({ uid, msg: err.message ?? 'Failed', type: 'error' });
    }
  }

  async function handleUpdatePoints(uid: string) {
    const pts = parseInt(pointsInput, 10);
    if (isNaN(pts)) return;
    try {
      await updateTeamPoints(uid, pts);
      setFeedback({ uid, msg: `Points set to ${pts}`, type: 'success' });
      setEditingPoints(null);
      setPointsInput('');
      loadTeams();
    } catch (err: any) {
      setFeedback({ uid, msg: err.message ?? 'Failed', type: 'error' });
    }
  }

  async function handleToggleQualified(uid: string, current: boolean) {
    try {
      await toggleTeamQualified(uid, !current);
      setFeedback({ uid, msg: `Team ${!current ? 'qualified' : 'disqualified'}`, type: 'success' });
      loadTeams();
    } catch (err: any) {
      setFeedback({ uid, msg: err.message ?? 'Failed', type: 'error' });
    }
  }

  if (loading) {
    return <p className="aih-mono" style={{ marginTop: '1rem', color: 'var(--aih-green)' }}>Loading teams...</p>;
  }

  if (teams.length === 0) {
    return <p className="aih-sub" style={{ marginTop: '1rem' }}>No teams found.</p>;
  }

  const assigned = teams.filter(t => t.assignedApi).length;

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div className="aih-mono" style={{ fontSize: '12px', color: 'rgba(236,231,216,0.5)' }}>
          Total teams: <span style={{ color: '#ece7d8' }}>{teams.length}</span>
        </div>
        <div className="aih-mono" style={{ fontSize: '12px', color: 'rgba(236,231,216,0.5)' }}>
          API assigned: <span style={{ color: assigned === teams.length ? 'var(--aih-green)' : 'var(--aih-red)' }}>{assigned} / {teams.length}</span>
        </div>
        <div className="aih-mono" style={{ fontSize: '12px', color: 'rgba(236,231,216,0.5)' }}>
          Qualified: <span style={{ color: 'var(--aih-green)' }}>{teams.filter(t => t.qualified).length}</span>
          {' / '}
          <span style={{ color: 'var(--aih-red)' }}>{teams.filter(t => !t.qualified).length} DQ</span>
        </div>
      </div>

      <div className="aih-table-wrap">
        <table className="aih-table">
          <thead>
            <tr>
              <th style={{ width: '24px' }}></th>
              <th>Team</th>
              <th>Email</th>
              <th>Password</th>
              <th>Points</th>
              <th>Status</th>
              <th>PS Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <>
                <tr
                  key={t.uid}
                  style={{ cursor: t.assignedApi ? 'pointer' : 'default' }}
                  onClick={() => t.assignedApi && setExpandedRow(expandedRow === t.uid ? null : t.uid)}
                >
                  {/* Expand chevron */}
                  <td style={{ textAlign: 'center', color: 'rgba(236,231,216,0.35)', fontSize: '10px', userSelect: 'none' }}>
                    {t.assignedApi ? (expandedRow === t.uid ? '▼' : '▶') : '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{t.teamName}</td>
                  <td style={{ fontSize: '11px', color: 'rgba(236,231,216,0.65)' }}>{t.email}</td>
                  <td style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{t.password}</td>
                  <td style={{ textAlign: 'center' }}>{t.points}</td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: t.qualified ? 'rgba(0,200,100,0.1)' : 'rgba(200,50,50,0.1)',
                      color: t.qualified ? 'var(--aih-green)' : 'var(--aih-red)',
                      border: `1px solid ${t.qualified ? 'rgba(0,200,100,0.25)' : 'rgba(200,50,50,0.25)'}`,
                    }}>
                      {t.qualified ? 'Active' : 'DQ'}
                    </span>
                  </td>
                  <td>
                    {t.assignedApi
                      ? <span style={{ fontSize: '11px', color: 'var(--aih-green)', cursor: 'pointer' }}>
                          ✓ {t.assignedApi.api ?? ''}
                        </span>
                      : <span style={{ fontSize: '11px', color: 'rgba(236,231,216,0.3)' }}>—</span>
                    }
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <button className="aih-table-btn" onClick={() => handleResetPassword(t.uid)}>
                        Reset Pwd
                      </button>
                      {editingPoints === t.uid ? (
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <input
                            className="aih-mono"
                            type="number"
                            value={pointsInput}
                            onChange={(e) => setPointsInput(e.target.value)}
                            style={{ width: '55px', background: 'rgba(236,231,216,0.03)', border: '1px solid rgba(139,134,125,0.3)', color: '#ece7d8', padding: '0.2rem', fontSize: '11px' }}
                          />
                          <button className="aih-table-btn" onClick={() => handleUpdatePoints(t.uid)}>Set</button>
                          <button className="aih-table-btn" onClick={() => { setEditingPoints(null); setPointsInput(''); }}>✕</button>
                        </div>
                      ) : (
                        <button className="aih-table-btn" onClick={() => { setEditingPoints(t.uid); setPointsInput(String(t.points)); }}>
                          Set Pts
                        </button>
                      )}
                      <button className="aih-table-btn" onClick={() => handleToggleQualified(t.uid, t.qualified)}
                        style={{ color: t.qualified ? 'var(--aih-red)' : 'var(--aih-green)' }}>
                        {t.qualified ? 'Disqualify' : 'Qualify'}
                      </button>
                      <button className="aih-table-btn" onClick={() => {
                        setChangingPs(changingPs === t.uid ? null : t.uid);
                        setSelectedApiId(t.assignedApi?.id ?? '');
                        setExpandedRow(null);
                      }}>
                        Change PS
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded PS details row */}
                {expandedRow === t.uid && t.assignedApi && (
                  <tr key={`${t.uid}-expanded`} style={{ background: 'rgba(236,231,216,0.02)' }}>
                    <td colSpan={8} style={{ padding: '0.75rem 1.25rem 1rem 2.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 2rem', maxWidth: '700px' }}>
                        <div>
                          <div className="aih-mono" style={{ fontSize: '10px', color: 'rgba(236,231,216,0.4)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Problem Statement Name</div>
                          <div style={{ fontSize: '13px', color: '#ece7d8', fontWeight: 500 }}>{t.assignedApi.apiName}</div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div className="aih-mono" style={{ fontSize: '10px', color: 'rgba(236,231,216,0.4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>API Link</div>
                          <a 
                            href={t.assignedApi.api} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="aih-mono" 
                            style={{ fontSize: '12px', color: 'var(--aih-green)', textDecoration: 'underline', wordBreak: 'break-all' }}
                          >
                            {t.assignedApi.api}
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Change PS picker row */}
                {changingPs === t.uid && (
                  <tr key={`${t.uid}-change-ps`} style={{ background: 'rgba(236,231,216,0.015)' }}>
                    <td colSpan={8} style={{ padding: '0.75rem 1.25rem 1rem 2.5rem' }}>
                      <div className="aih-mono" style={{ fontSize: '10px', color: 'rgba(236,231,216,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Select New Problem Statement</div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          className="aih-mono"
                          value={selectedApiId}
                          onChange={(e) => setSelectedApiId(e.target.value)}
                          style={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(139,134,125,0.35)',
                            color: '#ece7d8',
                            padding: '0.4rem 0.6rem',
                            fontSize: '12px',
                            borderRadius: '4px',
                            minWidth: '320px',
                            maxWidth: '480px',
                          }}
                        >
                          <option value="">-- choose a PS --</option>
                          {allApis.map((a) => (
                            <option key={a.id} value={a.id}>{a.apiName}</option>
                          ))}
                        </select>
                        <button
                          className="aih-table-btn"
                          disabled={!selectedApiId || psLoading}
                          onClick={() => handleChangePs(t.uid)}
                          style={{ color: 'var(--aih-green)' }}
                        >
                          {psLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          className="aih-table-btn"
                          onClick={() => { setChangingPs(null); setSelectedApiId(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {feedback && (
        <div className={`aih-feedback aih-mono ${feedback.type}`} style={{ display: 'block', marginTop: '1rem' }}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}