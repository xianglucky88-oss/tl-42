import { useState, useCallback, useRef, useEffect } from 'react';
import type { DialogueOption, DialogueResponse, Guest } from '../types/guest';
import { useGameStore } from '../store/useGameStore';
import type { TextSpeed } from '../types/game';

const TEXT_SPEED_MS: Record<TextSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 400,
};

export interface DialogueState {
  isActive: boolean;
  guestId?: string;
  guestName?: string;
  guestAvatar?: string;
  currentText: string;
  currentSpeaker: 'player' | 'guest';
  currentOptionId?: string;
  options: DialogueOption[];
  availableOptions: DialogueOption[];
  showOptions: boolean;
  response?: string;
  clueFound: boolean;
  isEnded: boolean;
  history: Array<{ text: string; speaker: 'player' | 'guest' }>;
  isTyping: boolean;
  lastEffect?: {
    reputation?: number;
    clueId?: string;
    unlocksStory?: string;
    mood?: number;
    money?: number;
  };
}

export interface StartDialogueParams {
  guest: Guest;
  unlockedClueIds: string[];
  reputation: number;
}

export function useDialogue() {
  const [dialogueState, setDialogueState] = useState<DialogueState>({
    isActive: false,
    currentText: '',
    currentSpeaker: 'guest',
    options: [],
    availableOptions: [],
    showOptions: false,
    clueFound: false,
    isEnded: false,
    history: [],
    isTyping: false,
  });

  const filterOptions = useCallback((options: DialogueOption[], unlockedClueIds: string[], reputation: number) => {
    return options.filter(opt => {
      if (opt.requiredClueId && !unlockedClueIds.includes(opt.requiredClueId)) {
        return false;
      }
      if (opt.requiredReputation && reputation < opt.requiredReputation) {
        return false;
      }
      return true;
    });
  }, []);

  const startDialogue = useCallback((params: StartDialogueParams) => {
    const { guest, unlockedClueIds, reputation } = params;
    
    const availableOptions = filterOptions(guest.dialogueOptions || [], unlockedClueIds, reputation);

    setDialogueState({
      isActive: true,
      guestId: guest.id,
      guestName: guest.name,
      guestAvatar: guest.avatar,
      currentText: `「你好，${guest.name}。欢迎来到百年酒店。」`,
      currentSpeaker: 'player',
      options: guest.dialogueOptions || [],
      availableOptions,
      showOptions: true,
      clueFound: false,
      isEnded: false,
      history: [{ text: `你好，${guest.name}。欢迎来到百年酒店。`, speaker: 'player' }],
      isTyping: false,
    });
  }, [filterOptions]);

  const selectOption = useCallback((option: DialogueOption): DialogueResponse | undefined => {
    const response = option.responses[0];
    const speed = useGameStore.getState().settings.textSpeed;
    const delay = TEXT_SPEED_MS[speed];
    
    setDialogueState(prev => ({
      ...prev,
      currentText: option.text,
      currentSpeaker: 'player',
      currentOptionId: option.id,
      history: [...prev.history, { text: option.text, speaker: 'player' }],
      isTyping: true,
      showOptions: false,
      lastEffect: response?.effect,
      clueFound: !!response?.effect?.clueId,
    }));

    setTimeout(() => {
      if (response) {
        setDialogueState(prev => ({
          ...prev,
          currentText: response.text,
          currentSpeaker: 'guest',
          response: response.text,
          history: [...prev.history, { text: response.text, speaker: 'guest' }],
          isTyping: false,
          isEnded: true,
        }));
      }
    }, delay);

    return response;
  }, []);

  const showResponse = useCallback((response: DialogueResponse, onComplete?: () => void) => {
    const speed = useGameStore.getState().settings.textSpeed;
    const delay = TEXT_SPEED_MS[speed] + 500;

    setDialogueState(prev => ({
      ...prev,
      currentText: response.text,
      currentSpeaker: 'guest',
      response: response.text,
      clueFound: !!response.effect?.clueId,
      history: [...prev.history, { text: response.text, speaker: 'guest' }],
      isTyping: true,
      lastEffect: response.effect,
    }));

    setTimeout(() => {
      setDialogueState(prev => ({ ...prev, isTyping: false }));
      onComplete?.();
    }, delay);
  }, []);

  const endDialogue = useCallback(() => {
    setDialogueState({
      isActive: false,
      currentText: '',
      currentSpeaker: 'player',
      options: [],
      availableOptions: [],
      showOptions: false,
      clueFound: false,
      isEnded: false,
      history: [],
      isTyping: false,
    });
  }, []);

  const updateAvailableOptions = useCallback((unlockedClueIds: string[], reputation: number) => {
    setDialogueState(prev => {
      const available = filterOptions(prev.options, unlockedClueIds, reputation);
      return { ...prev, availableOptions: available };
    });
  }, [filterOptions]);

  return {
    dialogueState,
    startDialogue,
    selectOption,
    showResponse,
    endDialogue,
    updateAvailableOptions,
  };
}
