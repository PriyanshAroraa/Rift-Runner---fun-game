import React from 'react';
import { Play, Trophy, Settings, Zap } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  highScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20 text-white">
      <div className="text-center mb-12 animate-pulse">
        <h1 className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 font-display drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]">
          RIFT RUNNER
        </h1>
        <h2 className="text-4xl font-bold tracking-widest text-white mt-2 font-display">
          CHAOS REMIX
        </h2>
      </div>

      <div className="flex flex-col gap-6 w-64">
        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl skew-x-[-10deg] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
        >
          <div className="flex items-center justify-center gap-2 skew-x-[10deg]">
            <Play className="w-6 h-6 fill-black" />
            START RUN
          </div>
        </button>

        <button className="group relative px-8 py-3 border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-bold text-lg skew-x-[-10deg] transition-all">
          <div className="flex items-center justify-center gap-2 skew-x-[10deg]">
            <Trophy className="w-5 h-5" />
            CHALLENGES
          </div>
        </button>

        <button className="group relative px-8 py-3 border border-gray-600 text-gray-400 hover:border-white hover:text-white font-bold text-lg skew-x-[-10deg] transition-all">
          <div className="flex items-center justify-center gap-2 skew-x-[10deg]">
            <Settings className="w-5 h-5" />
            SETTINGS
          </div>
        </button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm font-mono tracking-widest mb-2">HIGH SCORE</p>
        <p className="text-3xl font-bold text-yellow-400 drop-shadow-md">{highScore.toLocaleString()}</p>
      </div>

      <div className="absolute bottom-8 flex gap-8 text-xs text-gray-600 font-mono">
        <span className="flex items-center gap-1"><span className="border border-gray-600 px-1 rounded">SPACE</span> JUMP</span>
        <span className="flex items-center gap-1"><span className="border border-gray-600 px-1 rounded">S</span> SWITCH WORLD</span>
      </div>
    </div>
  );
};

export default MainMenu;
