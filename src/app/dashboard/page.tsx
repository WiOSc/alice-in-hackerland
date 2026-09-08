import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/admin';
import CreateTeamForm from '@/components/admin/create-team-form';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    redirect('/login');
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(session);
  } catch {
    redirect('/login');
  }

  return (
    <section className="aih-scope">
      <div className="aih-scanlines"></div>
      
      <svg className="aih-suits" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g style={{ filter: 'blur(14px)' }} opacity="0.05">
          <path d="M500 60 C 380 170, 300 250, 380 340 C 430 390, 480 380, 500 330 C 520 380, 570 390, 620 340 C 700 250, 620 170, 500 60 Z" fill="#ece7d8" transform="rotate(-8 500 300)" />
        </g>
        <g transform="translate(180,120) rotate(-16) scale(2.0)" opacity="0.06" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}>
          <path d="M50 5 C 20 30, 5 47.5, 22.5 65 C 32.5 75, 45 72.5, 50 62.5 C 55 72.5, 67.5 75, 77.5 65 C 95 47.5, 80 30, 50 5 Z" fill="#ece7d8" />
          <path d="M50 59 L59 82.5 L41 82.5 Z" fill="#ece7d8" />
        </g>
      </svg>
      
      <div className="aih-vignette"></div>

      <div className="aih-inner">
        <div className="aih-topbar aih-mono">
          <span className="code">VT26-E035</span>
          <span className="status">
            <span className="aih-dot"></span>
            {decoded.role} access
          </span>
        </div>

        <div className="aih-main" style={{ alignItems: 'flex-start', textAlign: 'left', padding: '2rem 0' }}>
          <h1 className="aih-display" style={{ fontSize: '40px' }}>Dashboard</h1>
          
          {decoded.role === 'admin' && (
            <div style={{ width: '100%', maxWidth: '34rem' }}>
              <p className="aih-sub" style={{ marginBottom: '1.5rem' }}>Create a new team account.</p>
              <CreateTeamForm />
            </div>
          )}
          
          {decoded.role === 'team' && (
            <div className="aih-card">
              <p className="aih-mono" style={{ color: 'var(--aih-green)' }}>Welcome, team member.</p>
              <p className="aih-sub" style={{ marginTop: '0.5rem' }}>Team ID: {decoded.teamId ?? 'N/A'}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}