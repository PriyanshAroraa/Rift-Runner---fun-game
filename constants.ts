import { World } from './types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

// Physics
export const GRAVITY = 0.9;
export const JUMP_FORCE = -16;
export const RUN_SPEED_BASE = 8; // Pixels per frame approx
export const MAX_RUN_SPEED = 16;
export const GROUND_Y = CANVAS_HEIGHT - 100;
export const CEILING_Y = 0;

// Player
export const PLAYER_SIZE = 40;
export const MAX_HEALTH = 3;
export const MAX_ENERGY = 100;
export const DASH_COST = 25;
export const DASH_DURATION = 15; // Frames
export const DASH_SPEED_MULT = 2.5;
export const SWITCH_COOLDOWN = 10; // Frames

// Colors
export const COLORS = {
  [World.BRIGHT]: {
    background: '#e0f7fa', // Very light cyan/white
    backgroundGradient: ['#ffffff', '#e0f7fa'],
    primary: '#00FFFF', // Electric Cyan
    secondary: '#FF1493', // Neon Pink
    ground: '#222',
    obstacle: '#FF0055',
    text: '#000'
  },
  [World.DARK]: {
    background: '#0a0a0a', // Obsidian
    backgroundGradient: ['#0a0a0a', '#1a0510'],
    primary: '#4B0082', // Deep Purple
    secondary: '#DC143C', // Crimson
    ground: '#444',
    obstacle: '#FF0000',
    text: '#FFF'
  }
};

export const SPAWN_RATE_INITIAL = 90; // Frames between spawns
