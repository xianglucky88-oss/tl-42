import { useState, useCallback } from 'react';
import type { DialogueOption, DialogueResponse } from '../types/guest';

export interface DialogueState {
  isActive: boolean;
  guestId?: string;
  guestName?: string;
  guestAvatar?: string;
  currentText: string;
  currentLine?: string;
  currentSpeaker: 'player' | 'guest';
  currentOptionId?: string;
  availableOptions: DialogueOption[];
  options: DialogueOption[];
  showOptions: boolean;
  response?: string;
  clueFound: boolean;
  isEnded: boolean;
  history: Array<{ text: string; speaker: 'player' | 'guest' }>;
  isTyping: boolean;
}

export interface Dialogue {
  id: string;
  guestId: string;
  guestName: string;
  guestAvatar: string;
  lines: string[];
  options: DialogueOption[];
}

export function useDialogue() {
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [dialogueState, setDialogueState] = useState<DialogueState>({
    isActive: false,
    currentText: '',
    currentSpeaker: 'player',
    availableOptions: [],
    options: [],
    showOptions: false,
    clueFound: false,
    isEnded: false,
    history: [],
    isTyping: false,
  });

  const startDialogue = useCallback((dialogue: Dialogue) => {
    setCurrentDialogue(dialogue);
    setDialogueState({
      isActive: true,
      guestId: dialogue.guestId,
      guestName: dialogue.guestName,
      guestAvatar: dialogue.guestAvatar,
      currentText: '',
      currentLine: dialogue.lines[0],
      currentSpeaker: 'guest',
      availableOptions: dialogue.options,
      options: dialogue.options,
      showOptions: true,
      clueFound: false,
      isEnded: false,
      history: [],
      isTyping: false,
    });
  }, []);

  const selectOption = useCallback((option: DialogueOption) => {
    setDialogueState(prev => ({
      ...prev,
      currentText: option.text,
      currentSpeaker: 'player',
      currentOptionId: option.id,
      history: [...prev.history, { text: option.text, speaker: 'player' as const }],
      isTyping: true,
      showOptions: false,
    }));

    setTimeout(() => {
      const response = option.responses[0];
      if (response) {
        setDialogueState(prev => ({
          ...prev,
          currentText: response.text,
          currentSpeaker: 'guest',
          response: response.text,
          clueFound: !!response.effect?.clueId,
          history: [...prev.history, { text: response.text, speaker: 'guest' as const }],
          isTyping: false,
          isEnded: !response.nextOptionId,
        }));
      }
    }, 1500);
  }, []);

  const showResponse = useCallback((response: DialogueResponse, onComplete?: () => void) => {
    setDialogueState(prev => ({
      ...prev,
      currentText: response.text,
      currentSpeaker: 'guest',
      response: response.text,
      clueFound: !!response.effect?.clueId,
      history: [...prev.history, { text: response.text, speaker: 'guest' as const }],
      isTyping: true,
    }));

    setTimeout(() => {
      setDialogueState(prev => ({ ...prev, isTyping: false }));
      onComplete?.();
    }, 2000);
  }, []);

  const endDialogue = useCallback(() => {
    setCurrentDialogue(null);
    setDialogueState({
      isActive: false,
      currentText: '',
      currentSpeaker: 'player',
      availableOptions: [],
      options: [],
      showOptions: false,
      clueFound: false,
      isEnded: false,
      history: [],
      isTyping: false,
    });
  }, []);

  const updateOptions = useCallback((options: DialogueOption[], unlockedClueIds: string[], reputation: number) => {
    const available = options.filter(opt => {
      if (opt.requiredClueId && !unlockedClueIds.includes(opt.requiredClueId)) {
        return false;
      }
      if (opt.requiredReputation && reputation < opt.requiredReputation) {
        return false;
      }
      return true;
    });

    setDialogueState(prev => ({ ...prev, availableOptions: available, options: available }));
  }, []);

  return {
    currentDialogue,
    dialogueState,
    startDialogue,
    selectOption,
    showResponse,
    endDialogue,
    updateOptions,
  };
}
