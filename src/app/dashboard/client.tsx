'use client';
import { useState } from 'react';
import Link from 'next/link';
import CreateTeamForm from '@/components/admin/create-team-form';
import TeamManager from '@/components/admin/team-manager';
import ApiManager from '@/components/admin/api-manager';
import AdminTicketManager from '@/components/admin/ticket-manager';
import CreateTicket from '@/components/tickets/create-ticket';
import MyTicketList from '@/components/tickets/ticket-list';

type Tab = 'create-team' | 'team-management' | 'apis' | 'admin-tickets';

const adminTabs: { key: Tab; label: string }[] = [
  { key: 'create-team', label: 'Create Team' },
  { key: 'team-management', label: 'Teams' },
  { key: 'apis', label: 'APIs' },
  { key: 'admin-tickets', label: 'Tickets' },
];

type TeamTab = 'view-api' | 'new-ticket' | 'my-tickets';

const teamTabs: { key: TeamTab; label: string }[] = [
  { key: 'view-api', label: 'View APIs' },
  { key: 'new-ticket', label: 'New Ticket' },
  { key: 'my-tickets', label: 'My Tickets' },
];

export default function DashboardClient({ decoded }: { decoded: any }) {
  const [adminTab, setAdminTab] = useState<Tab>('create-team');
  const [teamTab, setTeamTab] = useState<TeamTab>('view-api');

  const renderNavButtons = (tabs: { key: string; label: string }[], activeTab: string, setTab: (t: any) => void) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '220px', flexShrink: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`aih-tab aih-mono ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setTab(tab.key)}
            style={{ 
              textAlign: 'left', 
              padding: '0.75rem 1rem', 
              borderBottom: 'none',
              borderLeft: activeTab === tab.key ? '2px solid var(--aih-red)' : '2px solid transparent',
              background: activeTab === tab.key ? 'rgba(236,231,216,0.03)' : 'transparent',
              width: '100%'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

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
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '72rem', marginBottom: '2.5rem' }}>
            <h1 className="aih-display" style={{ fontSize: '40px', margin: 0 }}>Dashboard</h1>
            <Link href="/dashboard/leaderboard" className="aih-btn aih-mono" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View Leaderboard</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', maxWidth: '72rem', gap: '2.5rem' }}>
            
            {/* Sidebar Navbar */}
            <div style={{ borderRight: '1px solid rgba(139,134,125,0.15)', paddingRight: '1rem', minHeight: '50vh' }}>
              {decoded.role === 'admin' 
                ? renderNavButtons(adminTabs, adminTab, setAdminTab)
                : renderNavButtons(teamTabs, teamTab, setTeamTab)
              }
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, maxWidth: '52rem' }}>
              {decoded.role === 'admin' && (
                <>
                  {adminTab === 'create-team' && (
                    <div>
                      <p className="aih-sub" style={{ marginBottom: '1.5rem', marginTop: 0 }}>Create a new team account.</p>
                      <CreateTeamForm />
                    </div>
                  )}
                  {adminTab === 'team-management' && <TeamManager />}
                  {adminTab === 'apis' && <ApiManager />}
                  {adminTab === 'admin-tickets' && <AdminTicketManager />}
                </>
              )}

              {decoded.role === 'team' && (
                <>
                  {teamTab === 'new-ticket' && (
                    <div>
                      <p className="aih-sub" style={{ marginBottom: '1.5rem', marginTop: 0 }}>Submit a support ticket.</p>
                      <CreateTicket />
                    </div>
                  )}
                  {teamTab === 'my-tickets' && <MyTicketList />}
                  {teamTab === 'view-api' && (
                    <div>
                      <p className="aih-sub" style={{ marginTop: 0 }}>View and manage your API keys.</p>
                      <div className="aih-card" style={{ marginTop: '1.5rem' }}>
                        <p className="aih-mono text-white/60">API management module coming soon.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}