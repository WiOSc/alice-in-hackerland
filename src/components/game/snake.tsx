"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = 'UP';
const BASE_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const directionRef = useRef(direction);
  directionRef.current = direction;

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const reset = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (gameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
        case 'p':
        case 'P':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (directionRef.current) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Wall collision
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];
        
        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, BASE_SPEED - score * 3);
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, gameOver, isPaused, food, score, generateFood]);

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      background: '#0b0b0d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
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

      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: '#ece7d8', width: '100%' }}>
          <div>
            <Link href="/games" style={{ color: '#8b867d', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              ← Arena
            </Link>
            <h1 style={{ margin: '5px 0 0', fontSize: '1.5rem', textTransform: 'uppercase', color: '#c81e38', fontFamily: "'Unbounded', sans-serif" }}>
              SNAKE ♠
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#8b867d', textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{score}</div>
          </div>
        </div>

        <div style={{
          position: 'relative',
          width: 'min(90vw, 400px)',
          height: 'min(90vw, 400px)',
          background: '#050507',
          border: '1px solid rgba(139,134,125,0.2)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}>
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(139,134,125,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(139,134,125,0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`,
            pointerEvents: 'none'
          }} />

          {/* Food */}
          <div style={{
            gridColumn: food.x + 1,
            gridRow: food.y + 1,
            background: '#c81e38',
            boxShadow: '0 0 10px rgba(200,30,56,0.5)',
            margin: '1px'
          }} />

          {/* Snake */}
          {snake.map((segment, i) => (
            <div key={i} style={{
              gridColumn: segment.x + 1,
              gridRow: segment.y + 1,
              background: i === 0 ? '#4ade80' : '#22c55e',
              border: '1px solid #16a34a',
              margin: '1px',
              opacity: i === 0 ? 1 : 0.8
            }} />
          ))}

          {/* Overlays */}
          {gameOver && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(11,11,13,0.85)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(200,30,56,0.3)'
            }}>
              <div style={{ color: '#c81e38', fontSize: '1.5rem', fontFamily: "'Unbounded', sans-serif", marginBottom: '5px' }}>GAME OVER</div>
              <div style={{ color: '#8b867d', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '20px' }}>Visa Expired</div>
              <button onClick={reset} style={{
                background: '#c81e38', color: '#0b0b0d',
                border: 'none', padding: '10px 20px',
                fontFamily: 'inherit', fontWeight: 'bold', textTransform: 'uppercase',
                cursor: 'pointer'
              }}>Retry</button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', width: '200px', margin: '0 auto' }}>
          <div />
          <button onClick={() => setDirection('UP')} style={controlBtnStyle}>↑</button>
          <div />
          <button onClick={() => setDirection('LEFT')} style={controlBtnStyle}>←</button>
          <button onClick={() => setDirection('DOWN')} style={controlBtnStyle}>↓</button>
          <button onClick={() => setDirection('RIGHT')} style={controlBtnStyle}>→</button>
        </div>
      </div>
    </div>
  );
}

const controlBtnStyle = {
  background: 'rgba(236,231,216,0.05)',
  border: '1px solid rgba(139,134,125,0.2)',
  color: '#8b867d',
  padding: '15px 0',
  cursor: 'pointer',
  fontFamily: 'inherit',
  touchAction: 'manipulation'
};
