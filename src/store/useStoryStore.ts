import { create } from 'zustand';
import { useMemo } from 'react';
import type { Clue, StoryFragment, HotelHistoryEvent, GuestSecret, StoryProgress } from '../types/story';
import { ALL_CLUES, STORY_FRAGMENTS, HOTEL_HISTORY, GUEST_SECRETS, INITIAL_STORY_PROGRESS, INITIAL_CLUES } from '../data/stories';
import { useGameStore } from './useGameStore';

interface StoryStore {
  discoveredClues: Clue[];
  storyFragments: StoryFragment[];
  hotelHistory: HotelHistoryEvent[];
  guestSecrets: GuestSecret[];
  progress: StoryProgress;
  clues: Clue[];
  stories: StoryFragment[];
  storyProgress: StoryProgress;
  discoverClue: (clueId: string, discoveredBy: string, day: number) => Clue | undefined;
  hasClue: (clueId: string) => boolean;
  getClueById: (clueId: string) => Clue | undefined;
  unlockStoryFragment: (fragmentId: string, day: number) => StoryFragment | undefined;
  checkForUnlocks: () => void;
  markFragmentAsRead: (fragmentId: string) => void;
  markClueRead: (clueId: string) => void;
  unlockHistoryEvent: (historyId: string) => void;
  revealGuestSecret: (secretId: string) => GuestSecret | undefined;
  getFragmentById: (fragmentId: string) => StoryFragment | undefined;
  getHistoryById: (historyId: string) => HotelHistoryEvent | undefined;
  getSecretById: (secretId: string) => GuestSecret | undefined;
  getRelatedClues: (clueId: string) => Clue[];
  getCurrentChapterProgress: () => number;
  checkForEnding: () => StoryFragment | undefined;
  resetStory: () => void;
}

export const useStoryStore = create<StoryStore>((set, get) => ({
  discoveredClues: [...INITIAL_CLUES],
  storyFragments: [...STORY_FRAGMENTS],
  hotelHistory: [...HOTEL_HISTORY],
  guestSecrets: [...GUEST_SECRETS],
  progress: { ...INITIAL_STORY_PROGRESS },

  get clues() {
    const { discoveredClues } = get();
    const allClues = ALL_CLUES.map(clue => {
      const discovered = discoveredClues.find(dc => dc.id === clue.id);
      return discovered || { ...clue, discovered: false };
    });
    return allClues;
  },

  get stories() {
    return get().storyFragments;
  },

  get storyProgress() {
    return get().progress;
  },

  discoverClue: (clueId, discoveredBy, day) => {
    const { discoveredClues } = get();
    
    if (discoveredClues.some((c) => c.id === clueId)) {
      return undefined;
    }

    const clueTemplate = ALL_CLUES.find((c) => c.id === clueId);
    if (!clueTemplate) return undefined;

    const newClue: Clue = {
      ...clueTemplate,
      discoveredDay: day,
      discoveredBy,
      discovered: true,
      isNew: true,
    };

    set((state) => ({
      discoveredClues: [...state.discoveredClues, newClue],
      progress: {
        ...state.progress,
        discoveredClues: state.progress.discoveredClues + 1,
      },
    }));

    get().checkForUnlocks();
    return newClue;
  },

  hasClue: (clueId) => {
    return get().discoveredClues.some((c) => c.id === clueId);
  },

  getClueById: (clueId) => {
    return ALL_CLUES.find((c) => c.id === clueId);
  },

  unlockStoryFragment: (fragmentId, day) => {
    const { storyFragments, progress } = get();
    
    if (progress.unlockedFragments.includes(fragmentId)) {
      return undefined;
    }

    const fragment = storyFragments.find((f) => f.id === fragmentId);
    if (!fragment) return undefined;

    set((state) => ({
      storyFragments: state.storyFragments.map((f) =>
        f.id === fragmentId ? { ...f, unlockedDay: day, unlocked: true } : f
      ),
      progress: {
        ...state.progress,
        unlockedFragments: [...state.progress.unlockedFragments, fragmentId],
        currentChapter: fragment.chapter,
      },
    }));

    return fragment;
  },

  checkForUnlocks: () => {
    const { discoveredClues, storyFragments, hotelHistory, guestSecrets, progress } = get();
    const discoveredClueIds = discoveredClues.map((c) => c.id);

    storyFragments.forEach((fragment) => {
      if (!progress.unlockedFragments.includes(fragment.id)) {
        if (fragment.requiredClueIds.length > 1) return;

        const hasAllClues = fragment.requiredClueIds.every((clueId) =>
          discoveredClueIds.includes(clueId)
        );
        if (hasAllClues) {
          const gameState = useGameStore.getState();
          const currentDay = gameState.currentDay;
          get().unlockStoryFragment(fragment.id, currentDay);
        }
      }
    });

    hotelHistory.forEach((event) => {
      if (!event.isUnlocked && event.requiredClueIds.length > 0) {
        const hasAllClues = event.requiredClueIds.every((clueId) =>
          discoveredClueIds.includes(clueId)
        );
        if (hasAllClues) {
          get().unlockHistoryEvent(event.id);
        }
      }
    });

    guestSecrets.forEach((secret) => {
      if (!secret.isRevealed) {
        const hasAllClues = secret.requiredClueIds.every((clueId) =>
          discoveredClueIds.includes(clueId)
        );
        if (hasAllClues) {
          get().revealGuestSecret(secret.id);
        }
      }
    });
  },

  markFragmentAsRead: (fragmentId) => {
    set((state) => ({
      storyFragments: state.storyFragments.map((f) =>
        f.id === fragmentId ? { ...f, isRead: true } : f
      ),
    }));
  },

  markClueRead: (clueId) => {
    set((state) => ({
      discoveredClues: state.discoveredClues.map((c) =>
        c.id === clueId ? { ...c, isNew: false } : c
      ),
    }));
  },

  unlockHistoryEvent: (historyId) => {
    set((state) => ({
      hotelHistory: state.hotelHistory.map((h) =>
        h.id === historyId ? { ...h, isUnlocked: true } : h
      ),
      progress: {
        ...state.progress,
        unlockedHistory: [...state.progress.unlockedHistory, historyId],
      },
    }));
  },

  revealGuestSecret: (secretId) => {
    const secret = get().guestSecrets.find((s) => s.id === secretId);
    if (!secret || secret.isRevealed) return undefined;

    set((state) => ({
      guestSecrets: state.guestSecrets.map((s) =>
        s.id === secretId ? { ...s, isRevealed: true } : s
      ),
      progress: {
        ...state.progress,
        revealedSecrets: [...state.progress.revealedSecrets, secretId],
        discoveredSecrets: state.progress.discoveredSecrets + 1,
      },
    }));

    return secret;
  },

  getFragmentById: (fragmentId) => {
    return get().storyFragments.find((f) => f.id === fragmentId);
  },

  getHistoryById: (historyId) => {
    return get().hotelHistory.find((h) => h.id === historyId);
  },

  getSecretById: (secretId) => {
    return get().guestSecrets.find((s) => s.id === secretId);
  },

  getRelatedClues: (clueId) => {
    const clue = get().getClueById(clueId);
    if (!clue) return [];
    return get().discoveredClues.filter((c) => clue.relatedClueIds.includes(c.id));
  },

  getCurrentChapterProgress: () => {
    const { progress, storyFragments } = get();
    const currentChapterFragments = storyFragments.filter(
      (f) => f.chapter === progress.currentChapter && !f.isEnding
    );
    const unlockedInChapter = currentChapterFragments.filter((f) =>
      progress.unlockedFragments.includes(f.id)
    );
    return currentChapterFragments.length > 0
      ? Math.round((unlockedInChapter.length / currentChapterFragments.length) * 100)
      : 0;
  },

  checkForEnding: () => {
    const { storyFragments, progress } = get();
    return storyFragments.find(
      (f) => f.isEnding && 
      f.requiredClueIds.every((id) => get().hasClue(id)) &&
      !progress.unlockedFragments.includes(f.id)
    );
  },

  resetStory: () => {
    set({
      discoveredClues: [...INITIAL_CLUES],
      storyFragments: [...STORY_FRAGMENTS],
      hotelHistory: [...HOTEL_HISTORY],
      guestSecrets: [...GUEST_SECRETS],
      progress: { ...INITIAL_STORY_PROGRESS },
    });
  },
}));

export const useDiscoveredClues = () => useStoryStore((state) => state.discoveredClues);
export const useStoryFragments = () => useStoryStore((state) => state.storyFragments);
export const useHotelHistory = () => useStoryStore((state) => state.hotelHistory);
export const useGuestSecrets = () => useStoryStore((state) => state.guestSecrets);
export const useStoryProgressState = () => useStoryStore((state) => state.progress);

export const useClues = () => {
  const discoveredClues = useDiscoveredClues();
  return useMemo(() => {
    const allClues = ALL_CLUES.map(clue => {
      const discovered = discoveredClues.find(dc => dc.id === clue.id);
      return discovered || { ...clue, discovered: false };
    });
    return allClues;
  }, [discoveredClues]);
};

export const useStories = () => {
  const storyFragments = useStoryFragments();
  return storyFragments;
};
