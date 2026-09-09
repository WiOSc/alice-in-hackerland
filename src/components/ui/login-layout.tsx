import Link from 'next/link';

export function LoginLayoutUI({ children, role = 'team' }: { children: React.ReactNode; role?: 'admin' | 'team' }) {
  const eyebrow = role === 'admin' ? 'admin access' : 'team access';
  const heading = role === 'admin' ? 'Login as admin' : 'Login as a team';
  const sub = role === 'admin'
    ? 'Enter your admin email and password to manage the event.'
    : 'Enter the team code and passkey your squad was issued to reach the game arena.';

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
        <g transform="translate(820,470) rotate(9) scale(2.0)" opacity="0.06" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}>
          <circle cx="35" cy="35" r="18" fill="#ece7d8" />
          <circle cx="65" cy="35" r="18" fill="#ece7d8" />
          <circle cx="50" cy="55" r="20" fill="#ece7d8" />
          <path d="M45 70 L55 70 L60 95 L40 95 Z" fill="#ece7d8" />
        </g>
      </svg>

      <div className="aih-vignette"></div>

      <div className="aih-inner aih-inner-login">
        <div className="aih-topbar aih-mono">
          <span className="code">VT26-E035</span>
          <Link href="/" className="aih-back">← Back to event</Link>
        </div>

        <div className="aih-main aih-main-login">
          <p className="aih-eyebrow aih-eyebrow-login aih-mono">{eyebrow}</p>
          <h1 className="aih-display aih-display-login">{heading}</h1>
          <p className="aih-sub">{sub}</p>
          {children}
        </div>
      </div>
    </section>
  );
}