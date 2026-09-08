"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const ROWS = 10;
const COLS = 10;
const MINES = 15;

export default function MinesweeperGame() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flags, setFlags] = useState(MINES);

  const initializeGrid = useCallback(() => {
    let newGrid: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < ROWS && c + j >= 0 && c + j < COLS) {
                if (newGrid[r + i][c + j].isMine) count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWin(false);
    setFlags(MINES);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const revealCell = (r: number, c: number) => {
    if (gameOver || win || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    let newGrid = [...grid.map(row => [...row])];

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
      setGameOver(true);
      return;
    }

    // Flood fill algorithm
    const stack = [[r, c]];
    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      if (!newGrid[currR][currC].isRevealed) {
        newGrid[currR][currC].isRevealed = true;
        if (newGrid[currR][currC].neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const nextR = currR + i;
              const nextC = currC + j;
              if (nextR >= 0 && nextR < ROWS && nextC >= 0 && nextC < COLS && !newGrid[nextR][nextC].isRevealed && !newGrid[nextR][nextC].isFlagged) {
                stack.push([nextR, nextC]);
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);

    // Check win condition
    let unrevealedSafe = 0;
    newGrid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.isRevealed) unrevealedSafe++;
    }));

    if (unrevealedSafe === 0) {
      setWin(true);
    }
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || win || grid[r][c].isRevealed) return;

    let newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[r][c];

    if (!cell.isFlagged && flags > 0) {
      cell.isFlagged = true;
      setFlags(f => f - 1);
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlags(f => f + 1);
    }
    
    setGrid(newGrid);
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
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '20px', width: 'min(90vw, 400px)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#ece7d8' }}>
          <div>
            <Link href="/games" style={{ color: '#8b867d', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              ← Arena
            </Link>
            <h1 style={{ margin: '5px 0 0', fontSize: '1.5rem', textTransform: 'uppercase', color: '#3f9d72', fontFamily: "'Unbounded', sans-serif" }}>
              MINESWEEPER ♦
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#8b867d', textTransform: 'uppercase' }}>Flags</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{flags}</div>
          </div>
        </div>

        <div style={{
          position: 'relative',
          background: '#050507',
          border: '1px solid rgba(139,134,125,0.2)',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '1px',
          backgroundClip: 'padding-box',
          backgroundColor: 'rgba(139,134,125,0.2)',
        }}>
          {grid.map((row, r) => row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => revealCell(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              style={{
                aspectRatio: '1',
                background: cell.isRevealed ? '#0b0b0d' : 'rgba(236,231,216,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (cell.isRevealed || gameOver || win) ? 'default' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: cell.isMine ? '#c81e38' : ['#3b82f6', '#22c55e', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#000', '#888'][cell.neighborMines - 1],
              }}
            >
              {cell.isRevealed && cell.isMine && '✕'}
              {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && cell.neighborMines}
              {!cell.isRevealed && cell.isFlagged && <span style={{ color: '#eab308' }}>⚑</span>}
            </div>
          )))}

          {(gameOver || win) && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(11,11,13,0.85)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${win ? '#3f9d72' : '#c81e38'}`
            }}>
              <div style={{ color: win ? '#3f9d72' : '#c81e38', fontSize: '1.5rem', fontFamily: "'Unbounded', sans-serif", marginBottom: '5px' }}>
                {win ? 'VISA EXTENDED' : 'GAME OVER'}
              </div>
              <button onClick={initializeGrid} style={{
                background: win ? '#3f9d72' : '#c81e38', color: '#0b0b0d',
                border: 'none', padding: '10px 20px', marginTop: '20px',
                fontFamily: 'inherit', fontWeight: 'bold', textTransform: 'uppercase',
                cursor: 'pointer'
              }}>Play Again</button>
            </div>
          )}
        </div>
        
        <p style={{ textAlign: 'center', color: '#8b867d', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Left click to step. Right click to flag.
        </p>
      </div>
    </div>
  );
}
