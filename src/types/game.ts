export type GamePhase = 'start' | 'playing' | 'event' | 'dialogue' | 'ended';
export type DayPhase = 'morning' | 'afternoon' | 'evening';
export type AreaType = 'lobby' | 'rooms' | 'restaurant' | 'garden' | 'kitchen' | 'maintenance' | 'unassigned';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type TextSpeed = 'slow' | 'normal' | 'fast';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  textSpeed: TextSpeed;
  pixelScale: number;
  crtEffect: boolean;
  autoSave: boolean;
  difficulty: Difficulty;
}

export interface Room {
  id: string;
  number: number;
  type: 'single' | 'double' | 'suite';
  price: number;
  condition: number;
  isOccupied: boolean;
  guestId?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  condition: number;
  efficiency: number;
}

export interface DailyStats {
  day: number;
  income: number;
  expense: number;
  guestsServed: number;
  reputationChange: number;
  events: string[];
}

export interface GameState {
  currentDay: number;
  currentPhase: DayPhase;
  gamePhase: GamePhase;
  isPaused: boolean;
  settings: GameSettings;
  activeEventId?: string;
  activeDialogueId?: string;
}
