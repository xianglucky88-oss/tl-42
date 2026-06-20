export type ClueCategory = 'guest' | 'hotel' | 'history' | 'secret' | 'item' | 'document' | 'testimony' | 'observation' | 'memory';
export type StoryStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export type ClueRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Clue {
  id: string;
  title: string;
  description: string;
  category: ClueCategory;
  icon: string;
  discoveredDay: number;
  discoveredBy: string;
  relatedGuestIds: string[];
  relatedClueIds: string[];
  storyFragmentId?: string;
  isKey: boolean;
  notes: string;
  rarity: ClueRarity;
  discovered: boolean;
  isNew?: boolean;
  year?: number;
  location?: string;
  importance: number;
  storyContent?: string;
  unlockCondition?: string;
}

export interface StoryFragment {
  id: string;
  title: string;
  content: string;
  chapter: number;
  sequence: number;
  requiredClueIds: string[];
  unlockedDay?: number;
  isRead: boolean;
  isEnding: boolean;
  endingType?: 'good' | 'neutral' | 'bad' | 'secret';
  unlocked: boolean;
  description?: string;
  clueIds?: string[];
}

export interface HotelHistoryEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  isUnlocked: boolean;
  requiredClueIds: string[];
  importance: 'minor' | 'major' | 'critical';
}

export interface GuestSecret {
  id: string;
  guestId: string;
  title: string;
  fullStory: string;
  hints: string[];
  requiredClueIds: string[];
  isRevealed: boolean;
  impact: string;
}

export interface StoryProgress {
  currentChapter: number;
  totalClues: number;
  discoveredClues: number;
  unlockedFragments: string[];
  unlockedHistory: string[];
  unlockedStories: string[];
  totalStories: number;
  totalSecrets: number;
  revealedSecrets: string[];
  activeEnding?: string;
  discoveredSecrets: number;
}
