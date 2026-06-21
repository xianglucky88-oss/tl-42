import type { MinigameDefinition, MinigameType } from '../types/minigame';

export const MINIGAME_DEFINITIONS: Record<MinigameType, MinigameDefinition> = {
  rock_paper_scissors: {
    id: 'rock_paper_scissors',
    name: '猜拳对决',
    description: '经典的石头剪刀布游戏，三局两胜制。观察对手的习惯，找出制胜之道！',
    icon: '✊✌️🖐️',
    type: 'table',
    difficulty: 'easy',
    minBet: 10,
    maxBet: 100,
    baseReward: { money: 2, reputation: 1, affinity: 5 },
    affinityGain: 5,
    availablePhases: ['morning', 'afternoon', 'evening'],
  },
  blackjack: {
    id: 'blackjack',
    name: '21点扑克',
    description: '经典的21点扑克牌游戏，尽可能接近21点但不要超过。运气与策略的完美结合！',
    icon: '🃏',
    type: 'table',
    difficulty: 'medium',
    minBet: 20,
    maxBet: 200,
    baseReward: { money: 2.5, reputation: 2, affinity: 8 },
    affinityGain: 8,
    availablePhases: ['afternoon', 'evening'],
  },
  slot_machine: {
    id: 'slot_machine',
    name: '幸运老虎机',
    description: '拉动拉杆，让三个转盘转动起来！匹配相同的符号赢取大奖，纯运气游戏！',
    icon: '🎰',
    type: 'arcade',
    difficulty: 'easy',
    minBet: 5,
    maxBet: 50,
    baseReward: { money: 5, reputation: 1, affinity: 3 },
    affinityGain: 3,
    availablePhases: ['morning', 'afternoon', 'evening'],
  },
  memory: {
    id: 'memory',
    name: '记忆翻牌',
    description: '翻开卡牌找到配对，考验你的记忆力！用最少的步数完成配对获得高分。',
    icon: '🃏🎴',
    type: 'table',
    difficulty: 'medium',
    minBet: 15,
    maxBet: 150,
    baseReward: { money: 2, reputation: 3, affinity: 10 },
    affinityGain: 10,
    availablePhases: ['morning', 'afternoon', 'evening'],
  },
};

export const SLOT_SYMBOLS = [
  { symbol: '🍒', name: '樱桃', multiplier: 2 },
  { symbol: '🍋', name: '柠檬', multiplier: 3 },
  { symbol: '🍊', name: '橙子', multiplier: 4 },
  { symbol: '🍇', name: '葡萄', multiplier: 5 },
  { symbol: '💎', name: '钻石', multiplier: 10 },
  { symbol: '7️⃣', name: '幸运7', multiplier: 20 },
  { symbol: '⭐', name: '星星', multiplier: 15 },
  { symbol: '🎰', name: '老虎机', multiplier: 50 },
];

export const MEMORY_CARD_ICONS = [
  '🎈', '🎁', '🎀', '🎊', '🎉', '🎄', '🎃', '🎭',
  '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻',
];

export const RPS_CHOICES = [
  { id: 'rock', name: '石头', icon: '✊', beats: 'scissors' },
  { id: 'scissors', name: '剪刀', icon: '✌️', beats: 'paper' },
  { id: 'paper', name: '布', icon: '🖐️', beats: 'rock' },
];

export const CARD_SUITS = ['♠️', '♥️', '♣️', '♦️'];
export const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function getCardValue(rank: string): number {
  if (rank === 'A') return 11;
  if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
  return parseInt(rank);
}

export function calculateHandValue(hand: { rank: string; suit: string }[]): number {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    value += getCardValue(card.rank);
    if (card.rank === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}
