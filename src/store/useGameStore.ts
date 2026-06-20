import { create } from 'zustand';
import type { GameState, GameSettings, DayPhase, GamePhase } from '../types/game';

interface GameStore extends GameState {
  actions: {
    startNewGame: () => void;
    setGamePhase: (phase: GamePhase) => void;
    setDayPhase: (phase: DayPhase) => void;
    nextPhase: () => void;
    nextDay: () => void;
    togglePause: () => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    setActiveEvent: (eventId?: string) => void;
    setActiveDialogue: (dialogueId?: string) => void;
    resetGame: () => void;
  };
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  textSpeed: 'normal',
  pixelScale: 1,
  crtEffect: true,
  autoSave: true,
  difficulty: 'normal',
};

export const useGameStore = create<GameStore>((set, get) => ({
  currentDay: 1,
  currentPhase: 'morning',
  gamePhase: 'start',
  isPaused: false,
  settings: defaultSettings,
  activeEventId: undefined,
  activeDialogueId: undefined,

  actions: {
    startNewGame: () => {
      set({
        currentDay: 1,
        currentPhase: 'morning',
        gamePhase: 'playing',
        isPaused: false,
        activeEventId: undefined,
        activeDialogueId: undefined,
      });
    },

    setGamePhase: (phase) => set({ gamePhase: phase }),

    setDayPhase: (phase) => set({ currentPhase: phase }),

    nextPhase: () => {
      const phases: DayPhase[] = ['morning', 'afternoon', 'evening'];
      const currentIndex = phases.indexOf(get().currentPhase);
      if (currentIndex < phases.length - 1) {
        set({ currentPhase: phases[currentIndex + 1] });
      } else {
        set({
          currentDay: get().currentDay + 1,
          currentPhase: 'morning',
        });
      }
    },

    nextDay: () => {
      set({
        currentDay: get().currentDay + 1,
        currentPhase: 'morning',
      });
    },

    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

    updateSettings: (newSettings) =>
      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

    setActiveEvent: (eventId) => set({ activeEventId: eventId }),

    setActiveDialogue: (dialogueId) => set({ activeDialogueId: dialogueId }),

    resetGame: () => {
      set({
        currentDay: 1,
        currentPhase: 'morning',
        gamePhase: 'start',
        isPaused: false,
        settings: defaultSettings,
        activeEventId: undefined,
        activeDialogueId: undefined,
      });
    },
  },
}));

export const useCurrentDay = () => useGameStore((state) => state.currentDay);
export const useCurrentPhase = () => useGameStore((state) => state.currentPhase);
export const useGamePhase = () => useGameStore((state) => state.gamePhase);
export const useGameSettings = () => useGameStore((state) => state.settings);
export const useGameActions = () => useGameStore((state) => state.actions);
