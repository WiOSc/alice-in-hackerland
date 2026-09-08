"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const GRID_SIZE = 4;
type Grid = (number | null)[][];

const getEmptyGrid = (): Grid => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const addRandomTile = (grid: Grid): Grid => {
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return grid;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(getEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Use ref to avoid stale closures in event listeners
  const gridRef = useRef(grid);
  const scoreRef = useRef(score);
  const gameOverRef = useRef(gameOver);
  
  useEffect(() => {
    gridRef.current = grid;
    scoreRef.current = score;
    gameOverRef.current = gameOver;
  }, [grid, score, gameOver]);

  const initGame = useCallback(() => {
    let newGrid = getEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOverRef.current) return;

    const currentGrid = gridRef.current;
    let newGrid = getEmptyGrid();
    let scoreAdded = 0;
    let moved = false;

    // Helper to process a single line (row or column)
    const processLine = (line: (number | null)[]) => {
      // Remove nulls
      let filtered = line.filter(val => val !== null) as number[];
      // Merge
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          scoreAdded += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      // Pad with nulls
      while (filtered.length < GRID_SIZE) filtered.push(null as any);
      return filtered;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < GRID_SIZE; r++) {
        let row = currentGrid[r];
        if (direction === 'RIGHT') row = [...row].reverse();
        
        let newRow = processLine(row);
        if (direction === 'RIGHT') newRow = newRow.reverse();
        
        newGrid[r] = newRow;
        if (currentGrid[r].join(',') !== newGrid[r].join(',')) moved = true;
      }
    } else { // UP or DOWN
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = [currentGrid[0][c], currentGrid[1][c], currentGrid[2][c], currentGrid[3][c]];
        if (direction === 'DOWN') col = col.reverse();
        
        let newCol = processLine(col);
        if (direction === 'DOWN') newCol = newCol.reverse();
        
        for (let r = 0; r < GRID_SIZE; r++) {
          newGrid[r][c] = newCol[r];
          if (currentGrid[r][c] !== newGrid[r][c]) moved = true;
        }
      }
    }

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(s => s + scoreAdded);

      // Check game over
      let canMove = false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c] === null) canMove = true;
          if (c < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r][c + 1]) canMove = true;
          if (r < GRID_SIZE - 1 && newGrid[r][c] === newGrid[r + 1][c]) canMove = true;
        }
      }
      if (!canMove) {
        setGameOver(true);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': move('UP'); break;
        case 'ArrowDown': move('DOWN'); break;
        case 'ArrowLeft': move('LEFT'); break;
        case 'ArrowRight': move('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const getTileColor = (val: number | null) => {
    if (!val) return 'rgba(236,231,216,0.02)';
    const colors: Record<number, string> = {
      2: '#1a1a2e',
      4: '#16213e',
      8: '#0f3460',
      16: '#e94560',
      32: '#c81e38',
      64: '#f97316',
      128: '#eab308',
      256: '#22c55e',
      512: '#06b6d4',
      1024: '#3b82f6',
      2048: '#a855f7'
    };
    return colors[val] || '#a855f7';
  };

  const getTextColor = (val: number | null) => {
    if (!val) return 'transparent';
    return val <= 8 ? '#8b867d' : '#ece7d8';
  };

  // Touch handlers for mobile swipes
  const touchStart = useRef<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.current.x;
    const dy = touchEnd.y - touchStart.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStart.current = null;
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100dvh',
      background: '#0b0b0d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      position: 'relative',
      padding: '20px'
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(to bottom, rgba(236,231,216,0.025) 0px, rgba(236,231,216,0.025) 1px, transparent 1px, transparent 3px)',
        mixBlendMode: 'overlay',
        zIndex: 1,
      }} />

      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '20px', width: 'min(90vw, 400px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#ece7d8' }}>
          <div>
            <Link href="/games" style={{ color: '#8b867d', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              ← Arena
            </Link>
            <h1 style={{ margin: '5px 0 0', fontSize: '1.5rem', textTransform: 'uppercase', color: '#ece7d8', fontFamily: "'Unbounded', sans-serif" }}>
              2048 ♣
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#8b867d', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</div>
          </div>
        </div>

        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
          position: 'relative',
          background: '#050507',
          border: '1px solid rgba(139,134,125,0.2)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '8px',
          padding: '8px',
          touchAction: 'none' // Prevent scrolling while playing on mobile
        }}>
          {grid.map((row, r) => row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                aspectRatio: '1',
                background: getTileColor(val),
                border: `1px solid ${val ? 'rgba(236,231,216,0.1)' : 'rgba(139,134,125,0.1)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: val && val >= 1000 ? '1.5rem' : '2rem',
                color: getTextColor(val),
                transition: 'all 0.15s ease-in-out',
                borderRadius: '4px'
              }}
            >
              {val}
            </div>
          )))}

          {gameOver && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(11,11,13,0.85)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(200,30,56,0.3)',
              zIndex: 10
            }}>
              <div style={{ color: '#c81e38', fontSize: '1.5rem', fontFamily: "'Unbounded', sans-serif", marginBottom: '5px' }}>GAME OVER</div>
              <div style={{ color: '#8b867d', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '20px' }}>No Moves Left</div>
              <button onClick={initGame} style={{
                background: '#ece7d8', color: '#0b0b0d',
                border: 'none', padding: '10px 20px',
                fontFamily: 'inherit', fontWeight: 'bold', textTransform: 'uppercase',
                cursor: 'pointer'
              }}>Retry</button>
            </div>
          )}
        </div>
        
        <p style={{ textAlign: 'center', color: '#8b867d', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Use Arrow Keys or Swipe
        </p>
      </div>
    </div>
  );
}
