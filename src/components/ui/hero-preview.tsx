'use client';

import { useState, useRef, MouseEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function HeroPreview() {
  const [showJoker, setShowJoker] = useState(false);
  const [showRabbit, setShowRabbit] = useState(false);
  const lastTapRef = useRef<number>(0);
  const DOUBLE_TAP_MS = 350;

  const handlePrizeTap = (e: MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS) {
      e.preventDefault();
      setShowJoker(true);
      setTimeout(() => setShowJoker(false), 1600);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleTimeTap = () => {
    setShowRabbit((prev) => !prev);
  };

  useEffect(() => {
    const canvas = document.createElement('canvas');
    return () => {
      canvas.remove();
    };
  }, []);

  return (
    <section className="aih-scope">
      <div className="aih-scanlines"></div>

      <svg className="aih-suits" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g style={{ filter: 'blur(14px)' }} opacity="0.05">
          <path d="M500 60 C 380 170, 300 250, 380 340 C 430 390, 480 380, 500 330 C 520 380, 570 390, 620 340 C 700 250, 620 170, 500 60 Z" fill="#ece7d8" transform="rotate(-8 500 300)" />
        </g>
        <g transform="translate(230,150) rotate(-16) scale(2.6)" opacity="0.07" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}>
          <path d="M50 5 C 20 30, 5 47.5, 22.5 65 C 32.5 75, 45 72.5, 50 62.5 C 55 72.5, 67.5 75, 77.5 65 C 95 47.5, 80 30, 50 5 Z" fill="#ece7d8" />
          <path d="M50 59 L59 82.5 L41 82.5 Z" fill="#ece7d8" />
        </g>
        <g transform="translate(760,140) rotate(12) scale(2.1)" opacity="0.1" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }}>
          <path d="M50 5 L90 50 L50 95 L10 50 Z" fill="var(--aih-red)" />
        </g>
        <g transform="translate(260,440) rotate(-10) scale(1.9)" opacity="0.09" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))' }}>
          <path d="M50 85 C 20 60, 5 40, 5 25 C 5 10, 20 5, 32 12 C 40 17, 46 25, 50 32 C 54 25, 60 17, 68 12 C 80 5, 95 10, 95 25 C 95 40, 80 60, 50 85 Z" fill="var(--aih-red)" />
        </g>
        <g transform="translate(740,460) rotate(9) scale(2.3)" opacity="0.07" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}>
          <circle cx="35" cy="35" r="18" fill="#ece7d8" />
          <circle cx="65" cy="35" r="18" fill="#ece7d8" />
          <circle cx="50" cy="55" r="20" fill="#ece7d8" />
          <path d="M45 70 L55 70 L60 95 L40 95 Z" fill="#ece7d8" />
        </g>
      </svg>

      <div className="aih-vignette"></div>

      <div className="aih-inner">
        <div className="aih-topbar aih-mono">
          <span className="code">VT26-E035</span>
          <span className="status">
            <span className="aih-dot"></span>
            registrations open
            <span style={{ color: 'rgba(139,134,125,0.5)' }}>·</span>
            11–12 Sept 2026, VIT-AP, Amaravati
          </span>
        </div>

        <div className="aih-main">
          <div className="aih-copy">
            <p className="aih-eyebrow aih-mono">hackathon · game-based rounds</p>
            <h1 className="aih-display-hero aih-title-corrupt" id="mainTitle">
              <span>Alice in</span>
              <span className="aih-glitch" data-text="Hackerland">Hackerland</span>
            </h1>
            <p className="aih-tagline">
              Enter the game. Outsmart the system. Survive the code. Mystery APIs, escalating rounds, and only one team standing at the end.
            </p>
            <div className="aih-cta-row">
              <Link href="/login" className="aih-btn aih-mono">Login (team)</Link>
              <Link href="#" className="aih-link aih-mono">About this event →</Link>
            </div>
          </div>

          <dl className="aih-stats aih-mono">
            <div id="timeStat" style={{ position: 'relative', cursor: 'default' }} onClick={handleTimeTap}>
              <dt>time</dt>
              <dd>11:00 AM – 6:00 PM</dd>
              {showRabbit && (
                <div className="aih-rabbit-popup">
                  <Image src="/rabbit.jpg" alt="Rabbit" width={180} height={180} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '4px' }} />
                  <button className="aih-rabbit-close" onClick={(e) => { e.stopPropagation(); setShowRabbit(false); }}>✕</button>
                </div>
              )}
            </div>
            <div className="divider"><dt>venue</dt><dd>CB-303, 307, 321</dd></div>
            <div className="divider"><dt>team</dt><dd>2–3 members</dd></div>
            <div className="divider"><dt>entry</dt><dd>₹200</dd></div>
            <div className="divider" id="prizeStat" style={{ position: 'relative', cursor: 'default' }} onClick={handlePrizeTap}>
              <dt>prize pool</dt>
              <dd>₹25,000</dd>
              {showJoker && (
                <div className="aih-joker-popup aih-mono" aria-hidden="true">
                  <svg viewBox="0 0 100 100">
                    <path d="M50 32 L20 4 L34 34 Z" fill="#c81e38"/>
                    <path d="M30 32 L50 0 L70 32 Z" fill="#3f9d72"/>
                    <path d="M50 32 L80 4 L66 34 Z" fill="#c81e38"/>
                    <circle cx="50" cy="55" r="22" fill="#ece7d8" stroke="#16161a" strokeWidth="3"/>
                    <circle cx="42" cy="50" r="3" fill="#16161a"/>
                    <circle cx="58" cy="50" r="3" fill="#16161a"/>
                    <path d="M40 64 Q50 56 60 64" stroke="#16161a" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                  <span>No.</span>
                </div>
              )}
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
