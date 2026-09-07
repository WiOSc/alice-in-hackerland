"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import Tetris from 'react-tetris';

// ─── Sound Engine (Web Audio API) ─────────────────────────────────────────────
function useSoundEngine(enabled: boolean) {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    type: OscillatorType,
    duration: number,
    volume = 0.2,
    startFreq?: number
  ) => {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      const now = ac.currentTime;
      if (startFreq !== undefined) {
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(frequency, now + duration);
      } else {
        osc.frequency.setValueAtTime(frequency, now);
      }
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    } catch { /* audio not supported */ }
  }, [enabled, getCtx]);

  return useMemo(() => ({
    move:      () => playTone(220, 'square', 0.05, 0.1),
    rotate:    () => playTone(440, 'square', 0.07, 0.12, 280),
    softDrop:  () => playTone(180, 'square', 0.04, 0.08),
    hardDrop:  () => {
      playTone(180, 'square', 0.06, 0.2, 280);
      setTimeout(() => playTone(80, 'square', 0.1, 0.25), 60);
    },
    lineClear: (count: number) => {
      [440, 554, 659, 880].slice(0, Math.min(count + 1, 4)).forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.18, 0.3), i * 55);
      });
    },
    levelUp: () => {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.15, 0.45), i * 75);
      });
    },
    gameOver: () => {
      [392, 349, 311, 262].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sawtooth', 0.3, 0.4), i * 110);
      });
    },
  }), [playTone]);
}

// ─── Prevent arrow/space scroll ───────────────────────────────────────────────
function usePreventScrollKeys() {
  useEffect(() => {
    const KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ']);
    const prevent = (e: KeyboardEvent) => { if (KEYS.has(e.key)) e.preventDefault(); };
    window.addEventListener('keydown', prevent, { passive: false });
    return () => window.removeEventListener('keydown', prevent);
  }, []);
}

// ─── Responsive board font-size ───────────────────────────────────────────────
function useBoardFontSize() {
  const [fs, setFs] = React.useState(13);
  useEffect(() => {
    const update = () => {
      // Board = 10 cols × 1.25em + sidepanels (~5.5em×2) + gaps
      // Height: 20 rows × 1.25em = 25em, need header (~90px) + footer (~30px)
      const availH = window.innerHeight - 130;
      const availW = window.innerWidth - 20;
      const fromH = availH / 25;           // height constraint
      const fromW = availW / 24.5;         // width constraint (board + 2 panels + gaps)
      setFs(Math.floor(Math.max(8, Math.min(fromH, fromW, 20))));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return fs;
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Site palette: bg #0b0b0d · text #ece7d8 · red #c81e38 · green #3f9d72 · muted #8b867d
export default function BorderlandTetris() {
  const fontSize = useBoardFontSize();
  const [soundOn, setSoundOn] = React.useState(true);
  const sounds = useSoundEngine(soundOn);
  const prevLines = useRef(0);
  const prevLevel = useRef(6);
  const prevState = useRef<string>('PLAYING');

  usePreventScrollKeys();

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      overflow: 'hidden',
      background: '#0b0b0d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 8px',
      boxSizing: 'border-box',
      fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
      position: 'relative',
    }}>
      {/* Scanlines (same as main site) */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(to bottom, rgba(236,231,216,0.025) 0px, rgba(236,231,216,0.025) 1px, transparent 1px, transparent 3px)',
        mixBlendMode: 'overlay',
        zIndex: 1,
      }} />

      {/* Faint card suits */}
      {(['♠', '♥', '♣', '♦'] as const).map((suit, i) => (
        <div key={suit} style={{
          position: 'absolute',
          fontSize: 'clamp(60px, 14vw, 130px)',
          opacity: 0.04,
          pointerEvents: 'none',
          userSelect: 'none',
          color: i % 2 === 1 ? '#c81e38' : '#ece7d8',
          top: i < 2 ? '4%' : undefined,
          bottom: i >= 2 ? '4%' : undefined,
          left: i % 2 === 0 ? '2%' : undefined,
          right: i % 2 === 1 ? '2%' : undefined,
          lineHeight: 1,
          zIndex: 0,
        }}>{suit}</div>
      ))}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px', zIndex: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <h1 style={{
            fontFamily: "'Unbounded', ui-sans-serif, sans-serif",
            fontSize: 'clamp(13px, 3vw, 24px)',
            fontWeight: 800,
            color: '#ece7d8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: 0,
            paddingBottom: '4px',
            borderBottom: '1px solid rgba(139,134,125,0.3)',
          }}>GAME: TETRIS</h1>
          <button
            onClick={() => setSoundOn(v => !v)}
            style={{
              background: 'none',
              border: '1px solid rgba(139,134,125,0.3)',
              borderRadius: '2px',
              padding: '2px 7px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#8b867d',
              lineHeight: 1.4,
            }}
          >{soundOn ? '🔊' : '🔇'}</button>
        </div>
        <p style={{
          fontSize: 'clamp(8px, 1.6vw, 10px)',
          color: '#c81e38',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          margin: '4px 0 0',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Difficulty: <span style={{ color: '#8b867d' }}>Queen of Spades ♠</span>
        </p>
      </div>

      {/* Game area — font-size drives em-based block sizing */}
      <div style={{ fontSize: `${fontSize}px`, zIndex: 2, flexShrink: 0 }}>
        <Tetris
          keyboardControls={{
            down: 'MOVE_DOWN', left: 'MOVE_LEFT', right: 'MOVE_RIGHT',
            space: 'HARD_DROP', z: 'FLIP_COUNTERCLOCKWISE', x: 'FLIP_CLOCKWISE',
            up: 'FLIP_CLOCKWISE', p: 'TOGGLE_PAUSE', c: 'HOLD', shift: 'HOLD',
          }}
        >
          {({ HeldPiece, Gameboard, PieceQueue, points, linesCleared, level, state, controller }) => {
            // Sound triggers (run synchronously in render — safe since they're side-effect-only)
            if (typeof window !== 'undefined') {
              if (linesCleared !== prevLines.current) {
                const diff = linesCleared - prevLines.current;
                if (diff > 0) sounds.lineClear(Math.min(diff, 4));
                prevLines.current = linesCleared;
              }
              if (level !== prevLevel.current) { sounds.levelUp(); prevLevel.current = level; }
              if (state !== prevState.current && state === 'LOST') sounds.gameOver();
              prevState.current = state;
            }

            const ctrl = {
              ...controller,
              moveLeft:             () => { sounds.move();     controller.moveLeft(); },
              moveRight:            () => { sounds.move();     controller.moveRight(); },
              moveDown:             () => { sounds.softDrop(); controller.moveDown(); },
              hardDrop:             () => { sounds.hardDrop(); controller.hardDrop(); },
              flipClockwise:        () => { sounds.rotate();   controller.flipClockwise(); },
              flipCounterclockwise: () => { sounds.rotate();   controller.flipCounterclockwise(); },
            };

            return (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}>

                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em', width: '5.5em', flexShrink: 0 }}>
                  <SidePanel label="Hold"><HeldPiece /></SidePanel>
                  <Stat label="Score" value={points}       accent="#c81e38" />
                  <Stat label="Level" value={level}        accent="#ece7d8" />
                  <Stat label="Lines" value={linesCleared} accent="#3f9d72" />
                  {/* Keys cheatsheet */}
                  <div style={{
                    background: 'rgba(236,231,216,0.02)',
                    border: '1px solid rgba(139,134,125,0.18)',
                    padding: '0.45em 0.5em',
                    fontSize: '0.48em',
                    color: '#8b867d',
                    lineHeight: 1.9,
                    marginTop: '0.2em',
                  }}>
                    <div style={{ color: 'rgba(236,231,216,0.6)', marginBottom: '0.3em', borderBottom: '1px solid rgba(139,134,125,0.18)', paddingBottom: '0.25em', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Keys</div>
                    {[['↑/X','Rotate'],['←→','Move'],['↓','Soft'],['SPC','Drop'],['C','Hold'],['P','Pause']].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ color: '#c81e38' }}>{k}</span><span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOARD */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    border: '1px solid rgba(139,134,125,0.25)',
                    background: '#050507',
                    position: 'relative',
                  }}>
                    <Gameboard />

                    {state === 'LOST' && (
                      <Overlay>
                        <div style={{ ...overlayTitle, color: '#c81e38' }}>GAME OVER</div>
                        <div style={{ color: '#8b867d', fontSize: '0.45em', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.9em' }}>Visa Expired</div>
                        <Btn onClick={controller.restart} color="#c81e38">RETRY</Btn>
                      </Overlay>
                    )}
                    {state === 'PAUSED' && (
                      <Overlay>
                        <div style={{ ...overlayTitle, color: '#ece7d8' }}>PAUSED</div>
                        <Btn onClick={controller.resume} color="#3f9d72">RESUME</Btn>
                      </Overlay>
                    )}
                  </div>

                  {/* Touch controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '2px', marginTop: '3px' }}>
                    <TBtn onClick={ctrl.flipCounterclockwise}>↺</TBtn>
                    <TBtn onClick={ctrl.moveLeft}>←</TBtn>
                    <TBtn onClick={ctrl.moveDown}>↓</TBtn>
                    <TBtn onClick={ctrl.moveRight}>→</TBtn>
                    <TBtn onClick={ctrl.hardDrop} red>⇓</TBtn>
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ width: '5.5em', flexShrink: 0 }}>
                  <SidePanel label="Next"><PieceQueue /></SidePanel>
                </div>

              </div>
            );
          }}
        </Tetris>
      </div>

      <p style={{
        marginTop: '6px', fontSize: 'clamp(7px, 1.3vw, 9px)',
        color: 'rgba(139,134,125,0.5)', textTransform: 'uppercase',
        letterSpacing: '0.15em', zIndex: 2, flexShrink: 0,
      }}>
        Starts at Level 6 · Level up every 10 lines
      </p>
    </div>
  );
}

/* ── Sub-components ── */
function SidePanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(236,231,216,0.02)', border: '1px solid rgba(139,134,125,0.2)', padding: '0.45em 0.5em' }}>
      <div style={{ fontSize: '0.5em', color: '#8b867d', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.3em' }}>{label}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{
      background: 'rgba(236,231,216,0.02)',
      border: '1px solid rgba(139,134,125,0.2)',
      borderLeft: `2px solid ${accent}`,
      padding: '0.32em 0.5em',
    }}>
      <div style={{ fontSize: '0.48em', color: '#8b867d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ color: '#ece7d8', fontSize: '1em', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function TBtn({ onClick, children, red }: { onClick: () => void; children: React.ReactNode; red?: boolean }) {
  return (
    <button onClick={onClick} style={{
      background: red ? 'rgba(200,30,56,0.15)' : 'rgba(236,231,216,0.03)',
      color: red ? '#c81e38' : '#8b867d',
      border: `1px solid ${red ? 'rgba(200,30,56,0.3)' : 'rgba(139,134,125,0.2)'}`,
      padding: '0.55em 0', fontSize: '0.72em',
      cursor: 'pointer', width: '100%', lineHeight: 1,
      touchAction: 'manipulation', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(11,11,13,0.9)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 30,
      border: '1px solid rgba(139,134,125,0.25)',
    }}>{children}</div>
  );
}

function Btn({ onClick, children, color }: { onClick: () => void; children: React.ReactNode; color: string }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: '#0b0b0d',
      border: 'none', padding: '0.45em 1.1em',
      fontSize: '0.55em', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.15em',
      cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

/* ── Shared ── */
const overlayTitle: React.CSSProperties = {
  fontFamily: "'Unbounded', ui-sans-serif, sans-serif",
  fontSize: '0.85em', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  marginBottom: '0.25em',
};
