export type GuestMood = 'happy' | 'content' | 'neutral' | 'frustrated' | 'angry';
export type GuestNeedStatus = 'unmet' | 'partial' | 'met' | 'exceeded';

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
  dialogues: any[];
}

export interface GuestSchedule {
  guestId: string;
  morning: string;
  afternoon: string;
  evening: string;
}
