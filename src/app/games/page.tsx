"use client";

import Link from 'next/link';

const games = [
  { id: 'tetris', name: 'Tetris', suit: '♠', label: 'Action', path: '/games/tetris', color: '#c81e38' },
  { id: 'snake', name: 'Snake', suit: '♠', label: 'Action', path: '/games/snake', color: '#c81e38' },
  { id: 'minesweeper', name: 'Minesweeper', suit: '♦', label: 'Intellect', path: '/games/minesweeper', color: '#3f9d72' },
  { id: '2048', name: '2048', suit: '♣', label: 'Teamwork', path: '/games/2048', color: '#ece7d8' },
];

export default function GamesHubPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0b0b0d',
      color: '#ece7d8',
      fontFamily: "'JetBrains Mono', monospace",
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(to bottom, rgba(236,231,216,0.025) 0px, rgba(236,231,216,0.025) 1px, transparent 1px, transparent 3px)',
        mixBlendMode: 'overlay',
        zIndex: 1,
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', zIndex: 2 }}>
        <header style={{ marginBottom: '40px', borderBottom: '1px solid rgba(139,134,125,0.2)', paddingBottom: '20px' }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '2rem',
            textTransform: 'uppercase',
            fontWeight: 800,
            margin: '0 0 10px 0',
            letterSpacing: '0.05em'
          }}>BORDERLAND <span style={{ color: '#c81e38' }}>ARENA</span></h1>
          <p style={{ color: '#8b867d', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8rem', margin: 0 }}>
            Choose your game. Survive.
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {games.map((game) => (
            <Link key={game.id} href={game.path} style={{ textDecoration: 'none' }}>
              <div style={{
                border: '1px solid rgba(139,134,125,0.2)',
                background: 'rgba(236,231,216,0.02)',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(236,231,216,0.05)';
                e.currentTarget.style.borderColor = game.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(236,231,216,0.02)';
                e.currentTarget.style.borderColor = 'rgba(139,134,125,0.2)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '3rem', lineHeight: 1, color: game.color }}>{game.suit}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    color: game.color,
                    border: `1px solid ${game.color}`,
                    padding: '4px 8px',
                    borderRadius: '2px'
                  }}>{game.label}</span>
                </div>
                <div>
                  <h2 style={{ 
                    fontFamily: "'Unbounded', sans-serif", 
                    fontSize: '1.25rem', 
                    margin: '10px 0 0 0',
                    color: '#ece7d8',
                    textTransform: 'uppercase'
                  }}>{game.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
