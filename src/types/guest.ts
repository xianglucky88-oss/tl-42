export type GuestMood = 'happy' | 'content' | 'neutral' | 'frustrated' | 'angry';
export type GuestNeedStatus = 'unmet' | 'partial' | 'met' | 'exceeded';
export type SentimentPolarity = 'positive' | 'neutral' | 'negative';
export type HotelAttributeKey = 'room' | 'service' | 'food' | 'facilities' | 'location' | 'cleanliness';

export interface SatisfactionDimensions {
  room: number;
  service: number;
  food: number;
  facilities: number;
  location: number;
  cleanliness: number;
}

export interface SentimentKeyword {
  word: string;
  polarity: SentimentPolarity;
  weight: number;
  relatedAttribute?: HotelAttributeKey;
}

export interface HotelAttributeLevel {
  key: HotelAttributeKey;
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  description: string;
  icon: string;
}

export interface GuestReview {
  id: string;
  guestId: string;
  guestName: string;
  rating: number;
  content: string;
  keywords: SentimentKeyword[];
  dimensions: SatisfactionDimensions;
  overallSatisfaction: number;
  stayStartDay: number;
  stayEndDay: number;
  createdAt: number;
  isVIP: boolean;
  isBadReview: boolean;
  isResolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface GuestNeed {
  id: string;
  type: string;
  description: string;
  urgency: number;
  status: GuestNeedStatus;
  met: boolean;
  requiredItems?: string[];
  requiredAction?: string;
  reward?: {
    reputation?: number;
    money?: number;
    clueId?: string;
  };
}

export interface GuestObservation {
  id: string;
  description: string;
  time: 'morning' | 'afternoon' | 'evening';
  location: string;
  clueId?: string;
  discovered: boolean;
}

export type DialogueNodeType = 'greeting' | 'player_option' | 'guest_response';
export type BranchStatus = 'selected' | 'available' | 'locked' | 'unexplored';

export interface DialogueOption {
  id: string;
  text: string;
  requiredClueId?: string;
  requiredReputation?: number;
  responses: DialogueResponse[];
}

export interface DialogueResponse {
  id: string;
  text: string;
  nextOptionId?: string;
  effect?: {
    mood?: number;
    reputation?: number;
    clueId?: string;
    unlocksStory?: string;
  };
}

export interface DialogueBranchNode {
  id: string;
  type: DialogueNodeType;
  text: string;
  speaker: 'player' | 'guest';
  timestamp: number;
  optionId?: string;
  responseId?: string;
  status: BranchStatus;
  requiredClueId?: string;
  requiredReputation?: number;
  effect?: {
    mood?: number;
    reputation?: number;
    clueId?: string;
    unlocksStory?: string;
  };
  children: DialogueBranchNode[];
  parentId?: string;
  depth: number;
  isSelectedPath: boolean;
}

export interface DialogueHistoryRecord {
  id: string;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  day: number;
  timestamp: number;
  branches: DialogueBranchNode[];
  selectedPath: string[];
  discoveredClueIds: string[];
  reputationChanges: number;
  completed: boolean;
}

export interface GuestDialogueHistory {
  guestId: string;
  records: DialogueHistoryRecord[];
  allSelectedOptionIds: string[];
  allDiscoveredBranches: string[];
}

export interface Guest {
  id: string;
  name: string;
  occupation: string;
  avatar: string;
  portrait: string;
  description: string;
  age: number;
  personality: string[];
  stayDuration?: number;
  currentDayOfStay?: number;
  roomNumber?: number;
  patience: number;
  maxPatience: number;
  mood: GuestMood;
  satisfaction: number;
  totalBill: number;
  paid: boolean;
  needs: GuestNeed[];
  observations: GuestObservation[];
  dialogueOptions: DialogueOption[];
  secretId?: string;
  unlockedClues: string[];
  isCheckOut?: boolean;
  arrivalDay: number;
  departureDay: number;
  status: 'checking_in' | 'staying' | 'checking_out' | 'left';
  isVIP: boolean;
  background: string;
  preferredPrice: number;
  secret: { discovered: boolean; content: string };
  dialogues: unknown[];
  satisfactionDimensions: SatisfactionDimensions;
  sentimentKeywords: SentimentKeyword[];
}

export interface GuestSchedule {
  guestId: string;
  morning: string;
  afternoon: string;
  evening: string;
}
