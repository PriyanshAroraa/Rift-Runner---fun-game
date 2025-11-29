import React from 'react';
import { RotateCcw, Home } from 'lucide-react';

interface GameOverProps {
  score: number;
  distance: number;
  onRetry: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, distance, onRetry, onMenu }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-md z-30 text-white animate-in fade-in duration-300">
      <div className="text-center mb-10">
        <h1 className="text-7xl font-black text-red-500 tracking-tighter mb-2 font-display uppercase skew-y-[-2deg] drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
          RIFT COLLAPSED
        </h1>
        <p className="text-xl text-red-200 font-mono uppercase tracking-[0.5em]">Sync Failure Detected</p>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12 text-center">
        <div>
          <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Distance</p>
          <p className="text-4xl font-bold font-display">{distance}m</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm font-bold uppercase mb-1">Final Score</p>
          <p className="text-4xl font-bold font-display text-yellow-400">{score}</p>
        </div>
      </div>

      <div className="flex gap-6">
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-sm hover:bg-gray-200 transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          <RotateCcw size={20} />
          RETRY
        </button>
        <button 
          onClick={onMenu}
          className="flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-sm hover:bg-white/10 transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          <Home size={20} />
          MENU
        </button>
      </div>
    </div>
  );
};

export default GameOver;
