import React from 'react';
import TetrisWrapper from '@/components/game/tetris-wrapper';

export const metadata = {
  title: 'Borderland Tetris — WIOS',
  description: 'Alice in Borderland themed Tetris game.',
};

export default function TetrisPage() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', position: 'relative' }}>
      <div className="aih-scanlines" />
      <TetrisWrapper />
    </div>
  );
}

