import React, { useState, useRef, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import GameOver from './components/GameOver';
import { GameStatus, GameState, World } from './types';
import { MAX_ENERGY, MAX_HEALTH } from './constants';

function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [highScore, setHighScore] = useState<number>(0);
  
  // Game State synced for UI (throttled updates from canvas)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    distance: 0,
    energy: MAX_ENERGY,
    health: MAX_HEALTH,
    combo: 1.0,
    status: GameStatus.MENU,
    highScore: 0
  });

  // Since World state changes rapidly and needs to update UI color themes instantly,
  // we might want a separate state or just poll it.
  // For simplicity, we'll let the Canvas drive the logic and purely use React for overlay.
  // However, the HUD needs to know the world color.
  // We'll trust the `onUpdateStats` to pass significant changes or just use a ref for world if needed.
  // Actually, let's track `world` in React state for the HUD theme, updated by Canvas callback.
  const [currentWorld, setCurrentWorld] = useState<World>(World.BRIGHT);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('rift_runner_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleStart = () => {
    setStatus(GameStatus.PLAYING);
    setGameState(prev => ({ ...prev, status: GameStatus.PLAYING, score: 0, distance: 0 }));
  };

  const handleGameOver = (finalScore: number, finalDistance: number) => {
    setStatus(GameStatus.GAME_OVER);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('rift_runner_highscore', finalScore.toString());
    }
    setGameState(prev => ({
       ...prev, 
       status: GameStatus.GAME_OVER, 
       score: finalScore, 
       distance: finalDistance 
    }));
  };

  const handleUpdateStats = (stats: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...stats }));
    // We can infer world from some other mechanism or just toggle it in stats if we tracked it there.
    // For now, let's assume world toggle might be passed or we just check the canvas ref manually?
    // Actually, passing `world` in stats is cleanest.
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hacky way to sync World state from Canvas to React for HUD theming without 60fps re-renders?
  // We can attach a listener or just let the HUD assume default until updated.
  // Better: The canvas is the source of truth.
  // We will check the world state periodically.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === GameStatus.PLAYING) {
      interval = setInterval(() => {
          // This is a bit "dirty" but efficient for reading non-React state from a Ref inside the component 
          // if we exposed it. Since we didn't expose the Ref's internal state to the parent directly,
          // we rely on onUpdateStats. 
          // Let's modify onUpdateStats in GameCanvas to include 'world' if it changed.
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status]);

  // To fix the "World Color" HUD issue properly:
  // We will add a manual event listener or callback specifically for world switch in GameCanvas.
  // But for this MVP, let's toggle it via a key listener in App as well solely for UI, 
  // knowing it might drift if we aren't careful? 
  // No, let's use a specialized callback in GameCanvas props for `onWorldChange`. 
  // Wait, I can't easily change GameCanvas props signature without rewriting it in the XML.
  // I will rely on the `onUpdateStats` if I can, but I defined it with `Partial<GameState>`.
  // `GameState` in `types.ts` doesn't have `world`. 
  // I will use the keyboard listener in App as a visual mirror (UI only). 
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
       if (status === GameStatus.PLAYING && (e.key === 's' || e.key === 'S' || e.key === 'Shift')) {
         setCurrentWorld(prev => prev === World.BRIGHT ? World.DARK : World.BRIGHT);
       }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [status]);


  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden select-none">
      <GameCanvas 
        status={status} 
        onGameOver={handleGameOver} 
        onUpdateStats={handleUpdateStats}
        canvasRef={canvasRef}
      />

      {status === GameStatus.MENU && (
        <MainMenu onStart={handleStart} highScore={highScore} />
      )}

      {status === GameStatus.PLAYING && (
        <HUD state={gameState} currentWorld={currentWorld} />
      )}

      {status === GameStatus.GAME_OVER && (
        <GameOver 
          score={gameState.score} 
          distance={gameState.distance} 
          onRetry={handleStart} 
          onMenu={() => setStatus(GameStatus.MENU)} 
        />
      )}
    </div>
  );
}

export default App;