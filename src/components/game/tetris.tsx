"use client";

import React, { useEffect, useState } from 'react';
import Tetris from 'react-tetris';

export default function BorderlandTetris() {
  const [isClient, setIsClient] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    setIsClient(true);
    const calcSize = () => {
      // Board is 10 cols wide, we want it to fit nicely on screen
      // Game board occupies ~50% of viewport width on desktop, ~90% on mobile
      const vw = window.innerWidth;
      if (vw < 480) setFontSize(Math.floor((vw * 0.80) / 10 / 1.25));
      else if (vw < 768) setFontSize(Math.floor((vw * 0.60) / 10 / 1.25));
      else setFontSize(16);
    };
    calcSize();
    window.addEventListener('resize', calcSize);
    return () => window.removeEventListener('resize', calcSize);
  }, []);

  if (!isClient) return <div style={{ minHeight: '100vh', background: '#050505' }} />;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'ui-monospace, SFMono-Regular, monospace',
    }}>
      {/* Background card suits */}
      {['♠', '♥', '♣', '♦'].map((suit, i) => (
        <div key={suit} style={{
          position: 'absolute',
          fontSize: '120px',
          opacity: 0.05,
          pointerEvents: 'none',
          userSelect: 'none',
          color: i % 2 === 1 ? '#dc2626' : '#fff',
          top: i < 2 ? '10%' : undefined,
          bottom: i >= 2 ? '10%' : undefined,
          left: i % 2 === 0 ? '5%' : undefined,
          right: i % 2 === 1 ? '5%' : undefined,
        }}>{suit}</div>
      ))}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 10 }}>
        <h1 style={{
          fontFamily: 'Unbounded, ui-sans-serif, system-ui, sans-serif',
          fontSize: 'clamp(20px, 4vw, 40px)',
          fontWeight: 800,
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
          paddingBottom: '8px',
          borderBottom: '2px solid #dc2626',
          textShadow: '0 0 20px rgba(220,38,38,0.8)',
        }}>
          GAME: TETRIS
        </h1>
        <p style={{
          fontSize: '11px',
          color: '#dc2626',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginTop: '8px',
        }}>
          Difficulty: <span style={{ color: '#fff' }}>Queen of Spades ♠</span>
        </p>
      </div>

      {/* Game area — font-size drives block size via em units */}
      <div style={{ fontSize: `${fontSize}px`, zIndex: 10 }}>
        <Tetris
          keyboardControls={{
            down: 'MOVE_DOWN',
            left: 'MOVE_LEFT',
            right: 'MOVE_RIGHT',
            space: 'HARD_DROP',
            z: 'FLIP_COUNTERCLOCKWISE',
            x: 'FLIP_CLOCKWISE',
            up: 'FLIP_CLOCKWISE',
            p: 'TOGGLE_PAUSE',
            c: 'HOLD',
            shift: 'HOLD',
          }}
        >
          {({ HeldPiece, Gameboard, PieceQueue, points, linesCleared, level, state, controller }) => (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              
              {/* LEFT: Hold + Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '7em' }}>
                {/* Hold */}
                <div style={panelStyle}>
                  <div style={labelStyle}>Hold</div>
                  <HeldPiece />
                </div>

                {/* Stats */}
                {[
                  { label: 'Score', value: points, accent: '#dc2626' },
                  { label: 'Level', value: level, accent: '#fff' },
                  { label: 'Lines', value: linesCleared, accent: '#555' },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{
                    background: '#111',
                    borderLeft: `3px solid ${accent}`,
                    padding: '6px 8px',
                  }}>
                    <div style={{ ...labelStyle, marginBottom: '2px' }}>{label}</div>
                    <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 700 }}>{value}</div>
                  </div>
                ))}

                {/* Controls */}
                <div style={{ ...panelStyle, marginTop: '8px', fontSize: '0.6em', lineHeight: 1.8, color: '#666' }}>
                  <div style={{ ...labelStyle, color: '#aaa', marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>Controls</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Rotate</span><span style={{ color: '#dc2626' }}>↑/X</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Move</span><span style={{ color: '#dc2626' }}>←→</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Soft</span><span style={{ color: '#dc2626' }}>↓</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Drop</span><span style={{ color: '#dc2626' }}>SPC</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hold</span><span style={{ color: '#dc2626' }}>C</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pause</span><span style={{ color: '#dc2626' }}>P</span></div>
                </div>
              </div>

              {/* CENTER: Game Board */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  border: '3px solid #222',
                  background: '#000',
                  boxShadow: '0 0 40px rgba(220,38,38,0.2), inset 0 0 20px rgba(0,0,0,0.9)',
                  position: 'relative',
                }}>
                  <Gameboard />

                  {/* Game Over overlay */}
                  {state === 'LOST' && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.88)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 30,
                      border: '2px solid #dc2626',
                    }}>
                      <div style={{
                        fontFamily: 'Unbounded, ui-sans-serif, sans-serif',
                        fontSize: '1.4em', fontWeight: 800,
                        color: '#dc2626', textTransform: 'uppercase',
                        letterSpacing: '0.1em', marginBottom: '4px',
                        textShadow: '0 0 20px #dc2626',
                      }}>Game Over</div>
                      <div style={{ color: '#888', fontSize: '0.7em', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Visa Expired</div>
                      <button
                        onClick={controller.restart}
                        style={btnStyle}
                        onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
                      >
                        RETRY
                      </button>
                    </div>
                  )}

                  {/* Paused overlay */}
                  {state === 'PAUSED' && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.75)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 30,
                    }}>
                      <div style={{
                        fontFamily: 'Unbounded, ui-sans-serif, sans-serif',
                        fontSize: '1.4em', fontWeight: 800,
                        color: '#fff', textTransform: 'uppercase',
                        letterSpacing: '0.1em', marginBottom: '16px',
                      }}>PAUSED</div>
                      <button
                        onClick={controller.resume}
                        style={{ ...btnStyle, background: '#fff', color: '#000' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#ddd')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      >
                        RESUME
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile touch controls — below the board */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '4px',
                  marginTop: '8px',
                }}>
                  <div />
                  <button style={mobileBtn} onClick={controller.flipClockwise}>↻</button>
                  <div />
                  <button style={mobileBtn} onClick={controller.moveLeft}>←</button>
                  <button style={mobileBtn} onClick={controller.moveDown}>↓</button>
                  <button style={mobileBtn} onClick={controller.moveRight}>→</button>
                  <div />
                  <button style={{ ...mobileBtn, background: '#7f1d1d', fontSize: '1em' }} onClick={controller.hardDrop}>⇓</button>
                  <div />
                </div>
              </div>

              {/* RIGHT: Next queue */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '7em' }}>
                <div style={panelStyle}>
                  <div style={labelStyle}>Next</div>
                  <PieceQueue />
                </div>
              </div>

            </div>
          )}
        </Tetris>
      </div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #222',
  padding: '8px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.65em',
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontWeight: 700,
  marginBottom: '6px',
};

const btnStyle: React.CSSProperties = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  padding: '8px 20px',
  fontSize: '0.8em',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  cursor: 'pointer',
  transition: 'background 0.15s',
};

const mobileBtn: React.CSSProperties = {
  background: '#1c1c1c',
  color: '#fff',
  border: '1px solid #333',
  padding: '10px 0',
  fontSize: '0.9em',
  cursor: 'pointer',
  width: '100%',
};
