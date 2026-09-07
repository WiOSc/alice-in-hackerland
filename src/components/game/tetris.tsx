"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Pixel size for rendering

// Tetromino definitions
type TetrominoType = 0 | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
type TetrominoShape = (TetrominoType | 0)[][];

const TETROMINOS: Record<TetrominoType, { shape: TetrominoShape, color: string }> = {
  0: { shape: [[0]], color: 'transparent' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: '#00f0f0',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: '#0000f0',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: '#f0a000',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: '#f0f000',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: '#00f000',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: '#a000f0',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: '#f00000',
  },
};

type BoardCell = [TetrominoType, string]; // [type, state ('clear' or 'merged')]
type Board = BoardCell[][];

const randomTetromino = (): { shape: TetrominoShape, color: string, type: TetrominoType } => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)] as TetrominoType;
  return { ...TETROMINOS[randTetromino], type: randTetromino };
};

const createBoard = (): Board =>
  Array.from(Array(ROWS), () =>
    new Array(COLS).fill([0, 'clear'])
  );

export default function Tetris() {
  const [board, setBoard] = useState<Board>(createBoard());
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const [player, setPlayer] = useState<{
    pos: { x: number, y: number };
    tetromino: TetrominoShape;
    type: TetrominoType;
    collided: boolean;
  }>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    type: 0 as TetrominoType,
    collided: false,
  });

  const [score, setScore] = useState(0);
  const [rowsCleared, setRowsCleared] = useState(0);
  const [level, setLevel] = useState(1);

  // References for game loop
  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Sound placeholders (if they want to add them later)
  const playDropSound = () => {};
  const playClearSound = () => {};

  const updatePlayerPos = ({ x, y, collided }: { x: number, y: number, collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    const nextTetromino = randomTetromino();
    setPlayer({
      pos: { x: COLS / 2 - 2, y: 0 },
      tetromino: nextTetromino.shape,
      type: nextTetromino.type,
      collided: false,
    });
  }, []);

  const checkCollision = (playerObj: typeof player, boardData: Board, { x: moveX, y: moveY }: { x: number, y: number }) => {
    for (let y = 0; y < playerObj.tetromino.length; y++) {
      for (let x = 0; x < playerObj.tetromino[y].length; x++) {
        if (playerObj.tetromino[y][x] !== 0) {
          if (
            !boardData[y + playerObj.pos.y + moveY] ||
            !boardData[y + playerObj.pos.y + moveY][x + playerObj.pos.x + moveX] ||
            boardData[y + playerObj.pos.y + moveY][x + playerObj.pos.x + moveX][1] !== 'clear'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const sweepRows = useCallback((newBoard: Board) => {
    let clearedCount = 0;
    const sweptBoard = newBoard.reduce((ack, row) => {
      if (row.findIndex(cell => cell[0] === 0) === -1) {
        clearedCount += 1;
        ack.unshift(new Array(COLS).fill([0, 'clear']));
        return ack;
      }
      ack.push(row);
      return ack;
    }, [] as Board);
    
    if (clearedCount > 0) {
      playClearSound();
      const linePoints = [0, 40, 100, 300, 1200];
      setScore(prev => prev + linePoints[clearedCount] * level);
      setRowsCleared(prev => prev + clearedCount);
      if ((rowsCleared + clearedCount) >= level * 10) {
        setLevel(prev => prev + 1);
        setDropTime(1000 / (level + 1) + 200);
      }
    }

    return sweptBoard;
  }, [level, rowsCleared]);

  useEffect(() => {
    if (!isStarted) return;

    const updateBoard = (prevBoard: Board): Board => {
      // Flush the board
      const newBoard: Board = prevBoard.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // Draw the tetromino
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [
              value as TetrominoType,
              player.collided ? 'merged' : 'clear',
            ];
          }
        });
      });

      // Check for collision
      if (player.collided) {
        resetPlayer();
        return sweepRows(newBoard);
      }
      return newBoard;
    };

    setBoard(prev => updateBoard(prev));
  }, [player, resetPlayer, sweepRows, isStarted]);

  const drop = () => {
    if (checkCollision(player, board, { x: 0, y: 1 })) {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    } else {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    }
  };

  const dropLoop = useCallback((time: number) => {
    if (dropTime) {
      if (time - lastUpdateRef.current > dropTime) {
        drop();
        lastUpdateRef.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(dropLoop);
  }, [dropTime, player, board]);

  useEffect(() => {
    if (isStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(dropLoop);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [dropLoop, isStarted, gameOver]);


  const movePlayer = (dir: number) => {
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const startGame = () => {
    setBoard(createBoard());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setIsStarted(true);
    setScore(0);
    setLevel(1);
    setRowsCleared(0);
  };

  const rotate = (matrix: TetrominoShape, dir: number): TetrominoShape => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (matrix: TetrominoShape, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const move = (e: React.KeyboardEvent) => {
    if (!gameOver && isStarted) {
      if (e.key === 'ArrowLeft') {
        movePlayer(-1);
      } else if (e.key === 'ArrowRight') {
        movePlayer(1);
      } else if (e.key === 'ArrowDown') {
        drop();
      } else if (e.key === 'ArrowUp') {
        playerRotate(player.tetromino, 1);
      } else if (e.key === ' ') {
        // Hard drop
        let newY = 0;
        while (!checkCollision(player, board, { x: 0, y: newY + 1 })) {
          newY += 1;
        }
        updatePlayerPos({ x: 0, y: newY, collided: true });
        playDropSound();
      }
    }
  };

  // Keyboard handler for window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      move(e as unknown as React.KeyboardEvent);
    };
    
    if (isStarted && !gameOver) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, player, board]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Wonderland theming elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 pointer-events-none select-none">♠</div>
      <div className="absolute bottom-10 right-10 text-6xl text-[var(--aih-red)] opacity-20 pointer-events-none select-none">♥</div>
      <div className="absolute top-1/4 right-20 text-4xl opacity-20 pointer-events-none select-none">♣</div>
      <div className="absolute bottom-1/3 left-20 text-4xl text-[var(--aih-red)] opacity-20 pointer-events-none select-none">♦</div>
      
      <div className="mb-6 flex flex-col items-center">
        <h1 className="aih-display text-4xl mb-2 text-[#ece7d8] drop-shadow-[0_0_10px_rgba(236,231,216,0.3)] tracking-wide uppercase aih-glitch" data-text="WONDERLAND TETRIS">
          WONDERLAND TETRIS
        </h1>
        <p className="aih-mono text-sm text-[var(--aih-green)]">Fall down the rabbit hole...</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Game Board */}
        <div 
          className="relative border-4 border-[#3a352a] rounded-sm p-1 bg-[#0b0b0d]/80 shadow-[0_0_30px_rgba(200,30,56,0.15)] overflow-hidden"
          style={{
            width: `${COLS * BLOCK_SIZE}px`,
            height: `${ROWS * BLOCK_SIZE}px`,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(236,231,216,0.02) 25%, transparent 25%, transparent 75%, rgba(236,231,216,0.02) 75%, rgba(236,231,216,0.02)), repeating-linear-gradient(45deg, rgba(236,231,216,0.02) 25%, transparent 25%, transparent 75%, rgba(236,231,216,0.02) 75%, rgba(236,231,216,0.02))`,
            backgroundPosition: `0 0, ${BLOCK_SIZE/2}px ${BLOCK_SIZE/2}px`,
            backgroundSize: `${BLOCK_SIZE}px ${BLOCK_SIZE}px`
          }}
        >
          {board.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className="absolute transition-all duration-[50ms]"
                style={{
                  top: `${y * BLOCK_SIZE}px`,
                  left: `${x * BLOCK_SIZE}px`,
                  width: `${BLOCK_SIZE}px`,
                  height: `${BLOCK_SIZE}px`,
                  backgroundColor: cell[0] === 0 ? 'transparent' : TETROMINOS[cell[0]].color,
                  border: cell[0] === 0 ? '1px solid rgba(236, 231, 216, 0.05)' : '2px solid rgba(0, 0, 0, 0.3)',
                  boxShadow: cell[0] === 0 ? 'none' : `inset 0 0 10px rgba(255, 255, 255, 0.4), 0 0 5px ${TETROMINOS[cell[0]].color}`,
                  borderRadius: cell[0] === 0 ? '0' : '4px',
                }}
              />
            ))
          )}

          {/* Overlays */}
          {!isStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <button 
                onClick={startGame}
                className="aih-btn text-lg py-3 px-8 uppercase font-bold tracking-wider"
              >
                Drink Me (Start)
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-md border-2 border-[var(--aih-red)]">
              <h2 className="aih-display text-4xl text-[var(--aih-red)] mb-4 uppercase drop-shadow-[0_0_10px_rgba(200,30,56,0.8)]">Off With Your Head!</h2>
              <p className="text-[#ece7d8] mb-6 text-xl">Score: <span className="font-bold aih-mono">{score}</span></p>
              <button 
                onClick={startGame}
                className="aih-btn px-6 py-2 uppercase tracking-wider"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="flex flex-col gap-4 w-full md:w-48 aih-mono">
          <div className="aih-card text-center py-4">
            <h3 className="text-[#8b867d] text-xs uppercase mb-1">Score</h3>
            <p className="text-2xl text-[var(--aih-green)] drop-shadow-[0_0_5px_rgba(63,157,114,0.5)]">{score}</p>
          </div>
          <div className="aih-card text-center py-4">
            <h3 className="text-[#8b867d] text-xs uppercase mb-1">Level</h3>
            <p className="text-2xl text-[#ece7d8]">{level}</p>
          </div>
          <div className="aih-card text-center py-4">
            <h3 className="text-[#8b867d] text-xs uppercase mb-1">Lines</h3>
            <p className="text-2xl text-[#ece7d8]">{rowsCleared}</p>
          </div>

          <div className="mt-8 text-xs text-[#8b867d] leading-relaxed">
            <p className="mb-2 uppercase font-bold text-[#ece7d8]">Controls</p>
            <ul className="space-y-1">
              <li><span className="text-[var(--aih-red)]">↑</span> Rotate</li>
              <li><span className="text-[var(--aih-red)]">← →</span> Move</li>
              <li><span className="text-[var(--aih-red)]">↓</span> Soft Drop</li>
              <li><span className="text-[var(--aih-red)]">SPACE</span> Hard Drop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
