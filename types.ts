export enum World {
  BRIGHT = 'BRIGHT',
  DARK = 'DARK'
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum ObstacleType {
  SPIKE = 'SPIKE',
  WALL = 'WALL',
  ENEMY = 'ENEMY',
  GAP = 'GAP' // Logic handled by platform management, but type kept for ref
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  vy: number;
  isGrounded: boolean;
  isDashing: boolean;
  dashTimer: number;
  invincibleTimer: number;
  world: World;
}

export interface Obstacle extends Entity {
  type: ObstacleType;
  world: World | 'BOTH';
  active: boolean; // For enemies that can be killed
  passed: boolean; // For scoring
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface GameState {
  score: number;
  distance: number;
  energy: number;
  health: number;
  combo: number;
  status: GameStatus;
  highScore: number;
}
