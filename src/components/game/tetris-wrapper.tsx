"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const TetrisClient = dynamic(() => import('./tetris'), { ssr: false });

export default function TetrisWrapper() {
  return <TetrisClient />;
}
