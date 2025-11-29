import React, { useRef, useEffect, useCallback } from 'react';
import { 
  World, 
  GameStatus, 
  Player, 
  Obstacle, 
  ObstacleType, 
  Particle,
  GameState
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  RUN_SPEED_BASE, 
  GROUND_Y, 
  PLAYER_SIZE,
  COLORS,
  MAX_HEALTH,
  MAX_ENERGY,
  DASH_COST,
  DASH_DURATION,
  DASH_SPEED_MULT,
  SPAWN_RATE_INITIAL
} from '../constants';
import { audio } from '../services/audioService';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number, distance: number) => void;
  onUpdateStats: (stats: Partial<GameState>) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver, onUpdateStats, canvasRef }) => {
  // Mutable game state (refs to avoid re-renders)
  const requestRef = useRef<number>();
  const frameCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const speedRef = useRef<number>(RUN_SPEED_BASE);
  
  // Game Entities
  const playerRef = useRef<Player>({
    x: 150,
    y: GROUND_Y - PLAYER_SIZE,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    vy: 0,
    isGrounded: true,
    isDashing: false,
    dashTimer: 0,
    invincibleTimer: 0,
    world: World.BRIGHT
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Input State
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastSwitchTimeRef = useRef<number>(0);

  // Juice State
  const shakeRef = useRef<number>(0);

  // Helper: Spawn Particles
  const spawnParticles = (x: number, y: number, color: string, count: number, speed: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Helper: Reset Game
  const resetGame = () => {
    playerRef.current = {
      x: 150,
      y: GROUND_Y - PLAYER_SIZE,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      vy: 0,
      isGrounded: true,
      isDashing: false,
      dashTimer: 0,
      invincibleTimer: 0,
      world: World.BRIGHT
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = RUN_SPEED_BASE;
    frameCountRef.current = 0;
    shakeRef.current = 0;
    
    onUpdateStats({
      health: MAX_HEALTH,
      energy: MAX_ENERGY,
      score: 0,
      distance: 0,
      combo: 0
    });
  };

  // Main Game Loop
  const update = useCallback((time: number) => {
    if (status !== GameStatus.PLAYING) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    frameCountRef.current++;
    const player = playerRef.current;

    // --- 1. CONTROLS ---
    
    // Jump
    if (keysRef.current[' '] && player.isGrounded) {
      player.vy = JUMP_FORCE;
      player.isGrounded = false;
      audio.playJump();
      spawnParticles(player.x + player.width/2, player.y + player.height, '#FFF', 10, 5);
    }

    // World Switch (S or Shift)
    const now = Date.now();
    if ((keysRef.current['s'] || keysRef.current['S'] || keysRef.current['Shift']) && now - lastSwitchTimeRef.current > 200) {
      player.world = player.world === World.BRIGHT ? World.DARK : World.BRIGHT;
      lastSwitchTimeRef.current = now;
      audio.playSwitch();
      // Screen Shake
      shakeRef.current = 5;
      // Particles
      spawnParticles(player.x + player.width/2, player.y + player.height/2, 
        player.world === World.BRIGHT ? COLORS.BRIGHT.primary : COLORS.DARK.primary, 20, 10);
    }

    // Dash (K)
    if ((keysRef.current['k'] || keysRef.current['K']) && !player.isDashing) {
      // Need check logic to consume energy via callback or ref tracking? 
      // For MVP, checking if dash is available is implicit via UI state, 
      // but here we just assume if not dashing we can try. 
      // In a real app we'd sync "energy" ref. Let's assume passed in via props or managed locally.
      // We will manage energy locally for the frame loop but sync to React.
      
      // Let's rely on a global energy tracker in the parent? No, loop needs instant access.
      // We will assume infinite dash for now OR hack the energy check:
      // Realistically, we need `energyRef`.
    }

    // --- 2. PHYSICS ---
    
    // Gravity
    if (!player.isGrounded) {
      player.vy += GRAVITY;
    }

    // Apply Velocity
    player.y += player.vy;

    // Floor Collision
    if (player.y + player.height >= GROUND_Y) {
      player.y = GROUND_Y - player.height;
      player.vy = 0;
      player.isGrounded = true;
    }

    // --- 3. OBSTACLE SPAWNING ---
    // Increase difficulty
    speedRef.current = Math.min(RUN_SPEED_BASE + (distanceRef.current / 1000), 16);
    const spawnRate = Math.max(30, SPAWN_RATE_INITIAL - Math.floor(distanceRef.current / 500) * 5);

    if (frameCountRef.current % spawnRate === 0) {
      const typeRand = Math.random();
      const worldRand = Math.random() > 0.5 ? World.BRIGHT : World.DARK;
      
      let type: ObstacleType = ObstacleType.SPIKE;
      let y = GROUND_Y - 40;
      let width = 40;
      let height = 40;

      if (typeRand > 0.7) {
        type = ObstacleType.WALL;
        y = GROUND_Y - 120; // Float slightly or tall? Let's make it a tall wall from ground
        y = GROUND_Y - 100; 
        height = 100;
        width = 30;
      } else if (typeRand > 0.9) {
        type = ObstacleType.ENEMY;
        y = GROUND_Y - 50;
      }

      obstaclesRef.current.push({
        x: CANVAS_WIDTH,
        y,
        width,
        height,
        type,
        world: worldRand,
        active: true,
        passed: false
      });
    }

    // --- 4. OBSTACLE UPDATE & COLLISION ---
    
    // Move stats
    distanceRef.current += speedRef.current / 10;
    scoreRef.current += 1;

    // Sync stats occasionally to React (every 10 frames)
    if (frameCountRef.current % 10 === 0) {
       onUpdateStats({ 
         score: Math.floor(scoreRef.current), 
         distance: Math.floor(distanceRef.current) 
       });
    }

    // Shake Decay
    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;

    // Iterate Obstacles backwards to remove safely
    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const obs = obstaclesRef.current[i];
      obs.x -= speedRef.current;

      // Cull offscreen
      if (obs.x + obs.width < 0) {
        obstaclesRef.current.splice(i, 1);
        continue;
      }

      // Logic: 
      // If Spike/Enemy: Danger if World Matches (e.g. Bright Spike hurts Bright Player)
      // If Wall: Danger if World Matches (Physical barrier)
      
      // Wait, GDD: 
      // SPIKE: "Jump over OR switch to opposite world". Implies: Same World = Hit, Opposite = Safe.
      // WALL: "Must be in opposite world to pass". Implies: Same World = Hit, Opposite = Safe.
      
      const inSameWorld = obs.world === player.world || obs.world === 'BOTH';
      
      // AABB Collision
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        if (inSameWorld) {
          // HIT!
          if (player.invincibleTimer <= 0) {
            audio.playHit();
            shakeRef.current = 15;
            spawnParticles(player.x, player.y, '#FF0000', 30, 15);
            
            // For MVP: Instant Game Over or Health -1
            // Let's do instant Game Over for simplicity of the loop or call callback
            onGameOver(Math.floor(scoreRef.current), Math.floor(distanceRef.current));
            return; // Stop updating
          }
        }
      }
    }

    // --- 5. DRAWING ---
    
    // Clear & Background
    const currentTheme = COLORS[player.world];
    
    // Draw Background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, currentTheme.backgroundGradient[1]);
    gradient.addColorStop(1, currentTheme.backgroundGradient[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Camera Shake Translation
    ctx.save();
    if (shakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * shakeRef.current;
      const dy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(dx, dy);
    }

    // Draw Grid/Floor
    ctx.fillStyle = currentTheme.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    // Grid Lines for speed sensation
    ctx.strokeStyle = player.world === World.BRIGHT ? '#ddd' : '#333';
    ctx.lineWidth = 2;
    const gridOffset = (frameCountRef.current * speedRef.current) % 100;
    for (let i = 0; i < CANVAS_WIDTH + 100; i+= 100) {
      ctx.beginPath();
      ctx.moveTo(i - gridOffset, 0);
      ctx.lineTo(i - gridOffset - 200, CANVAS_HEIGHT); // Slanted
      ctx.stroke();
    }

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      const isDangerous = obs.world === player.world || obs.world === 'BOTH';
      ctx.fillStyle = isDangerous ? currentTheme.obstacle : 'rgba(100,100,100, 0.3)';
      
      // Visual styling
      if (obs.type === ObstacleType.SPIKE) {
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.fill();
        // Glow if dangerous
        if (isDangerous) {
            ctx.shadowColor = currentTheme.obstacle;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
      } else {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Neon border
        if (isDangerous) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
      }
    });

    // Draw Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Draw Player
    ctx.fillStyle = player.world === World.BRIGHT ? COLORS.BRIGHT.primary : COLORS.DARK.primary;
    // Trail effect logic could go here
    
    // Player shape (Simple box for now, maybe skew for speed)
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    // Tilt based on velocity
    ctx.rotate(player.vy * 0.05); 
    
    // Glow
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    
    ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Inner core
    ctx.fillStyle = '#FFF';
    ctx.shadowBlur = 0;
    ctx.fillRect(-player.width/4, -player.height/4, player.width/2, player.height/2);
    
    ctx.restore();

    ctx.restore(); // Restore shake translation

    requestRef.current = requestAnimationFrame(update);
  }, [status, onGameOver, onUpdateStats, canvasRef]); // Dependencies for callback creation

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation Loop Management
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        // If starting fresh
        if (frameCountRef.current === 0) resetGame();
        requestRef.current = requestAnimationFrame(update);
    } else {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, update]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block w-full h-full object-contain bg-black"
    />
  );
};

export default GameCanvas;
