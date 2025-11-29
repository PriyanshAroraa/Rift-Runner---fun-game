import React from 'react';
import { GameState, World } from '../types';
import { Heart, Zap } from 'lucide-react';
import { COLORS } from '../constants';

interface HUDProps {
  state: GameState;
  currentWorld: World;
}

const HUD: React.FC<HUDProps> = ({ state, currentWorld }) => {
  const isBright = currentWorld === World.BRIGHT;
  const themeColor = isBright ? 'text-cyan-400' : 'text-purple-500';
  const borderColor = isBright ? 'border-cyan-400' : 'border-purple-500';

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Health */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Heart 
              key={i} 
              className={`w-8 h-8 ${i < state.health ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-800 fill-gray-900'}`} 
            />
          ))}
        </div>

        {/* Score & Distance */}
        <div className="text-center">
          <div className="text-4xl font-black italic text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            {state.distance}<span className="text-sm text-gray-400 ml-1">m</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            SCORE: {state.score}
          </div>
        </div>

        {/* Energy Bar */}
        <div className="w-48">
          <div className="flex justify-between text-xs font-bold text-white mb-1">
            <span className="flex items-center gap-1"><Zap size={14} /> ENERGY</span>
            <span>{state.energy}%</span>
          </div>
          <div className="h-4 bg-gray-900 border border-gray-700 skew-x-[-12deg] overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-yellow-400 to-red-500 transition-all duration-100 ease-out`}
              style={{ width: `${state.energy}%` }}
            />
          </div>
        </div>
      </div>

      {/* World Indicator / Combo */}
      <div className="flex justify-between items-end">
        <div className={`
          border-l-4 pl-4 py-2 transition-colors duration-300
          ${borderColor}
        `}>
          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">CURRENT DIMENSION</p>
          <h2 className={`text-2xl font-black uppercase ${themeColor}`}>
            {currentWorld}
          </h2>
        </div>

        {state.combo > 1 && (
           <div className="flex flex-col items-end animate-bounce">
             <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] italic">
               x{state.combo.toFixed(1)}
             </span>
             <span className="text-sm font-bold text-yellow-500 tracking-widest uppercase">COMBO</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
