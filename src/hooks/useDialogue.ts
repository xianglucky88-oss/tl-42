import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  DialogueOption,
  DialogueResponse,
  Guest,
  DialogueBranchNode,
  BranchStatus,
} from '../types/guest';
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
  dialogueTree: DialogueBranchNode[];
  currentNodeId?: string;
  selectedPathIds: string[];
}

export interface StartDialogueParams {
  guest: Guest;
  unlockedClueIds: string[];
  reputation: number;
}

function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function buildDialogueTree(
  options: DialogueOption[],
  unlockedClueIds: string[],
  reputation: number,
  greetingText: string
): DialogueBranchNode[] {
  const now = Date.now();
  const greetingNode: DialogueBranchNode = {
    id: generateNodeId(),
    type: 'greeting',
    text: greetingText,
    speaker: 'player',
    timestamp: now,
    status: 'selected',
    children: [],
    depth: 0,
    isSelectedPath: true,
  };

  const optionNodes: DialogueBranchNode[] = options.map((opt) => {
    let status: BranchStatus = 'unexplored';
    if (opt.requiredClueId && !unlockedClueIds.includes(opt.requiredClueId)) {
      status = 'locked';
    } else if (opt.requiredReputation && reputation < opt.requiredReputation) {
      status = 'locked';
    } else {
      status = 'available';
    }

    const responseNodes: DialogueBranchNode[] = opt.responses.map((resp) => ({
      id: generateNodeId(),
      type: 'guest_response',
      text: resp.text,
      speaker: 'guest',
      timestamp: now,
      responseId: resp.id,
      status: status === 'available' ? 'available' : 'locked',
      effect: resp.effect,
      children: [],
      depth: 2,
      isSelectedPath: false,
    }));

    return {
      id: generateNodeId(),
      type: 'player_option',
      text: opt.text,
      speaker: 'player',
      timestamp: now,
      optionId: opt.id,
      status,
      requiredClueId: opt.requiredClueId,
      requiredReputation: opt.requiredReputation,
      children: responseNodes,
      parentId: greetingNode.id,
      depth: 1,
      isSelectedPath: false,
    };
  });

  greetingNode.children = optionNodes;
  return [greetingNode];
}

function markPathSelected(
  tree: DialogueBranchNode[],
  targetNodeId: string
): DialogueBranchNode[] {
  return tree.map((node) => {
    const newNode = { ...node, children: markPathSelected(node.children, targetNodeId) };
    if (node.id === targetNodeId) {
      newNode.status = 'selected';
      newNode.isSelectedPath = true;
    }
    const hasSelectedChild = newNode.children.some((c) => c.isSelectedPath);
    if (hasSelectedChild) {
      newNode.isSelectedPath = true;
    }
    return newNode;
  });
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
    dialogueTree: [],
    selectedPathIds: [],
  });

  const filterOptions = useCallback(
    (options: DialogueOption[], unlockedClueIds: string[], reputation: number) => {
      return options.filter((opt) => {
        if (opt.requiredClueId && !unlockedClueIds.includes(opt.requiredClueId)) {
          return false;
        }
        if (opt.requiredReputation && reputation < opt.requiredReputation) {
          return false;
        }
        return true;
      });
    },
    []
  );

  const startDialogue = useCallback((params: StartDialogueParams) => {
    const { guest, unlockedClueIds, reputation } = params;

    const availableOptions = filterOptions(
      guest.dialogueOptions || [],
      unlockedClueIds,
      reputation
    );
    const greetingText = `你好，${guest.name}。欢迎来到百年酒店。`;
    const dialogueTree = buildDialogueTree(
      guest.dialogueOptions || [],
      unlockedClueIds,
      reputation,
      greetingText
    );

    const greetingNodeId = dialogueTree[0]?.id;

    setDialogueState({
      isActive: true,
      guestId: guest.id,
      guestName: guest.name,
      guestAvatar: guest.avatar,
      currentText: `「${greetingText}」`,
      currentSpeaker: 'player',
      options: guest.dialogueOptions || [],
      availableOptions,
      showOptions: true,
      clueFound: false,
      isEnded: false,
      history: [{ text: greetingText, speaker: 'player' }],
      isTyping: false,
      dialogueTree,
      currentNodeId: greetingNodeId,
      selectedPathIds: greetingNodeId ? [greetingNodeId] : [],
    });
  }, [filterOptions]);

  const selectOption = useCallback(
    (option: DialogueOption): DialogueResponse | undefined => {
      const response = option.responses[0];
      const speed = useGameStore.getState().settings.textSpeed;
      const delay = TEXT_SPEED_MS[speed];

      setDialogueState((prev) => {
        const optionNode = prev.dialogueTree[0]?.children.find(
          (c) => c.optionId === option.id
        );
        const responseNode = optionNode?.children[0];
        const newSelectedPath = [...prev.selectedPathIds];
        let newTree = prev.dialogueTree;

        if (optionNode) {
          newSelectedPath.push(optionNode.id);
          newTree = markPathSelected(newTree, optionNode.id);
        }
        if (responseNode) {
          newSelectedPath.push(responseNode.id);
          newTree = markPathSelected(newTree, responseNode.id);
        }

        newTree = newTree.map((node) => ({
          ...node,
          children: node.children.map((child) =>
            child.optionId === option.id
              ? { ...child, status: 'selected' as BranchStatus, isSelectedPath: true }
              : child.status === 'available'
              ? child
              : child
          ),
        }));

        return {
          ...prev,
          currentText: option.text,
          currentSpeaker: 'player',
          currentOptionId: option.id,
          history: [...prev.history, { text: option.text, speaker: 'player' }],
          isTyping: true,
          showOptions: false,
          lastEffect: response?.effect,
          clueFound: !!response?.effect?.clueId,
          dialogueTree: newTree,
          currentNodeId: optionNode?.id,
          selectedPathIds: newSelectedPath,
        };
      });

      setTimeout(() => {
        if (response) {
          setDialogueState((prev) => {
            const optionNode = prev.dialogueTree[0]?.children.find(
              (c) => c.optionId === option.id
            );
            const responseNode = optionNode?.children[0];
            const newSelectedPath = [...prev.selectedPathIds];
            let newTree = prev.dialogueTree;

            if (responseNode) {
              if (!newSelectedPath.includes(responseNode.id)) {
                newSelectedPath.push(responseNode.id);
              }
              newTree = markPathSelected(newTree, responseNode.id);
            }

            return {
              ...prev,
              currentText: response.text,
              currentSpeaker: 'guest',
              response: response.text,
              history: [...prev.history, { text: response.text, speaker: 'guest' }],
              isTyping: false,
              isEnded: true,
              dialogueTree: newTree,
              currentNodeId: responseNode?.id,
              selectedPathIds: newSelectedPath,
            };
          });
        }
      }, delay);

      return response;
    },
    []
  );

  const showResponse = useCallback(
    (response: DialogueResponse, onComplete?: () => void) => {
      const speed = useGameStore.getState().settings.textSpeed;
      const delay = TEXT_SPEED_MS[speed] + 500;

      setDialogueState((prev) => ({
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
        setDialogueState((prev) => ({ ...prev, isTyping: false }));
        onComplete?.();
      }, delay);
    },
    []
  );

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
      dialogueTree: [],
      selectedPathIds: [],
    });
  }, []);

  const updateAvailableOptions = useCallback(
    (unlockedClueIds: string[], reputation: number) => {
      setDialogueState((prev) => {
        const available = filterOptions(prev.options, unlockedClueIds, reputation);
        const updatedTree: DialogueBranchNode[] = prev.dialogueTree.map((node) => ({
          ...node,
          children: node.children.map((child) => {
            if (child.type !== 'player_option') return child;
            let status: BranchStatus = child.status;
            if (child.status === 'selected') return child;
            if (
              child.requiredClueId &&
              !unlockedClueIds.includes(child.requiredClueId)
            ) {
              status = 'locked';
            } else if (
              child.requiredReputation &&
              reputation < child.requiredReputation
            ) {
              status = 'locked';
            } else {
              status = 'available';
            }
            return {
              ...child,
              status,
              children: child.children.map((resp) => ({
                ...resp,
                status: (status === 'available' ? 'available' : 'locked') as BranchStatus,
              })),
            };
          }),
        }));
        return { ...prev, availableOptions: available, dialogueTree: updatedTree };
      });
    },
    [filterOptions]
  );

  return {
    dialogueState,
    startDialogue,
    selectOption,
    showResponse,
    endDialogue,
    updateAvailableOptions,
  };
}
