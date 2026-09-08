'use client';
import { useState, useEffect } from 'react';
import { listTeams, resetTeamPassword, updateTeamPoints, toggleTeamQualified } from '@/lib/firestore/teams';

export default function TeamManager() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ uid: string; msg: string; type: string } | null>(null);
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState('');

  async function loadTeams() {
    setLoading(true);
    try {
      const data = await listTeams();
      setTeams(data);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadTeams(); }, []);

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

  return (
    <div className="aih-table-wrap" style={{ marginTop: '1rem' }}>
      <table className="aih-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Points</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.uid}>
              <td>{t.teamName}</td>
              <td style={{ fontSize: '12px' }}>{t.email}</td>
              <td style={{ fontSize: '12px' }}>{t.password}</td>
              <td>{t.points}</td>
              <td>
                <span style={{ color: t.qualified ? 'var(--aih-green)' : 'var(--aih-red)' }}>
                  {t.qualified ? 'Qualified' : 'Disqualified'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button className="aih-table-btn" onClick={() => handleResetPassword(t.uid)}>
                    Reset Password
                  </button>
                  {editingPoints === t.uid ? (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <input
                        className="aih-mono"
                        type="number"
                        value={pointsInput}
                        onChange={(e) => setPointsInput(e.target.value)}
                        style={{ width: '60px', background: 'rgba(236,231,216,0.03)', border: '1px solid rgba(139,134,125,0.3)', color: '#ece7d8', padding: '0.25rem', fontSize: '12px' }}
                      />
                      <button className="aih-table-btn" onClick={() => handleUpdatePoints(t.uid)}>Set</button>
                      <button className="aih-table-btn" onClick={() => { setEditingPoints(null); setPointsInput(''); }}>X</button>
                    </div>
                  ) : (
                    <button className="aih-table-btn" onClick={() => { setEditingPoints(t.uid); setPointsInput(String(t.points)); }}>
                      Update Points
                    </button>
                  )}
                  <button className="aih-table-btn" onClick={() => handleToggleQualified(t.uid, t.qualified)}>
                    {t.qualified ? 'Disqualify' : 'Qualify'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {feedback && (
        <div className={`aih-feedback aih-mono ${feedback.type}`} style={{ display: 'block', marginTop: '1rem' }}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}