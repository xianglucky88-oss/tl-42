export type MinigameType = 'rock_paper_scissors' | 'blackjack' | 'slot_machine' | 'memory';
export type MinigameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'draw';
export type OpponentType = 'employee' | 'guest';

export interface MinigameReward {
  money?: number;
  reputation?: number;
  affinity?: number;
  clueId?: string;
  itemId?: string;
}

export interface MinigameDefinition {
  id: MinigameType;
  name: string;
  description: string;
  icon: string;
  type: 'arcade' | 'table';
  difficulty: 'easy' | 'medium' | 'hard';
  minBet: number;
  maxBet: number;
  baseReward: MinigameReward;
  affinityGain: number;
  availablePhases: ('morning' | 'afternoon' | 'evening')[];
}

export interface MinigameState {
  currentGame: MinigameType | null;
  status: MinigameStatus;
  bet: number;
  opponent: {
    type: OpponentType;
    id: string;
    name: string;
    avatar: string;
    skill: number;
  } | null;
  playerScore: number;
  opponentScore: number;
  gameData: Record<string, unknown>;
  rewards: MinigameReward | null;
  gameHistory: MinigameResult[];
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalMoneyWon: number;
  totalMoneyLost: number;
}

export interface MinigameResult {
  id: string;
  gameType: MinigameType;
  opponentName: string;
  opponentType: OpponentType;
  result: 'win' | 'loss' | 'draw';
  bet: number;
  reward: MinigameReward;
  timestamp: number;
  day: number;
}

export interface Opponent {
  id: string;
  type: OpponentType;
  name: string;
  avatar: string;
  skill: number;
  preferredGames: MinigameType[];
  affinity: number;
  maxAffinity: number;
  description: string;
  specialReward?: MinigameReward;
}
