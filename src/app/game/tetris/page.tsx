import React from 'react';
import Tetris from '@/components/game/tetris';

export const metadata = {
  title: 'Wonderland Tetris - WIOS Platform',
  description: 'An Alice in Wonderland themed Tetris game for the WIOS Platform.',
};

export default function TetrisPage() {
  return (
    <div className="aih-scope min-h-screen flex items-center justify-center relative">
      <div className="aih-scanlines"></div>
      <div className="aih-vignette"></div>
      
      <div className="aih-inner w-full flex flex-col items-center justify-center relative z-10">
        <Tetris />
      </div>
    </div>
  );
}
