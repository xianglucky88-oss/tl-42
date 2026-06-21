import { useCallback, useEffect, useRef, useState } from 'react';
import { saveToStorage, loadFromStorage, clearStorage, hasSavedGame } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';
import { useHotelStore } from '../store/useHotelStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useGuestStore } from '../store/useGuestStore';
import { useStoryStore } from '../store/useStoryStore';

export interface SaveData {
  timestamp: number;
  version: string;
  gameState: unknown;
  hotelState: unknown;
  employeeState: unknown;
  inventoryState: unknown;
  guestState: unknown;
  storyState: unknown;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'error';

const SAVE_VERSION = '1.0.0';
const AUTOSAVE_INTERVAL = 60000;

let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null;
let autoSaveInitialized = false;

function pickSerializable<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'function') continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if (key === 'actions' || key === 'assignEmployee' || key === 'restAllEmployees' ||
          key === 'updateItemQuantity' || key === 'createOrder' || key === 'checkPendingDeliveries' ||
          key === 'meetNeed' || key === 'addObservation' || key === 'addGuest' ||
          key === 'discoverClue' || key === 'hasClue' || key === 'getClueById' ||
          key === 'unlockStoryFragment' || key === 'checkForUnlocks' || key === 'markFragmentAsRead' ||
          key === 'markClueRead' || key === 'unlockHistoryEvent' || key === 'revealGuestSecret' ||
          key === 'getFragmentById' || key === 'getHistoryById' || key === 'getSecretById' ||
          key === 'getRelatedClues' || key === 'getCurrentChapterProgress' || key === 'checkForEnding' ||
          key === 'resetStory') {
        continue;
      }
    }
    result[key] = value;
  }
  return result as Partial<T>;
}

function collectAllState(): Omit<SaveData, 'timestamp' | 'version'> {
  const gs = useGameStore.getState();
  const hs = useHotelStore.getState();
  const es = useEmployeeStore.getState();
  const invs = useInventoryStore.getState();
  const gus = useGuestStore.getState();
  const ss = useStoryStore.getState();

  return {
    gameState: pickSerializable({
      currentDay: gs.currentDay,
      currentPhase: gs.currentPhase,
      gamePhase: gs.gamePhase,
      isPaused: gs.isPaused,
      settings: gs.settings,
      activeEventId: gs.activeEventId,
      activeDialogueId: gs.activeDialogueId,
    }),
    hotelState: pickSerializable({
      name: hs.name,
      description: hs.description,
      foundedYear: hs.foundedYear,
      money: hs.money,
      reputation: hs.reputation,
      rating: hs.rating,
      rooms: hs.rooms,
      facilities: hs.facilities,
      hotel: hs.hotel,
      dailyStats: hs.dailyStats,
      dailyStatsHistory: hs.dailyStatsHistory,
    }),
    employeeState: pickSerializable({
      employees: es.employees,
    }),
    inventoryState: pickSerializable({
      items: invs.items,
      suppliers: invs.suppliers,
      orders: invs.orders,
    }),
    guestState: pickSerializable({
      currentGuests: gus.currentGuests,
      guests: gus.guests,
      guestPool: gus.guestPool,
    }),
    storyState: pickSerializable({
      discoveredClues: ss.discoveredClues,
      storyFragments: ss.storyFragments,
      hotelHistory: ss.hotelHistory,
      guestSecrets: ss.guestSecrets,
      progress: ss.progress,
    }),
  };
}

function restoreAllState(data: SaveData): void {
  if (data.gameState) {
    const gs = data.gameState as Record<string, unknown>;
    useGameStore.setState({
      currentDay: gs.currentDay as number,
      currentPhase: gs.currentPhase as never,
      gamePhase: gs.gamePhase as never,
      isPaused: gs.isPaused as boolean,
      settings: gs.settings as never,
      activeEventId: gs.activeEventId as string | undefined,
      activeDialogueId: gs.activeDialogueId as string | undefined,
    });
  }
  if (data.hotelState) {
    const hs = data.hotelState as Record<string, unknown>;
    useHotelStore.setState({
      name: hs.name as string,
      description: hs.description as string,
      foundedYear: hs.foundedYear as number,
      money: hs.money as number,
      reputation: hs.reputation as number,
      rating: hs.rating as number,
      rooms: hs.rooms as never,
      facilities: hs.facilities as never,
      hotel: hs.hotel as never,
      dailyStats: hs.dailyStats as never,
      dailyStatsHistory: hs.dailyStatsHistory as never,
    });
  }
  if (data.employeeState) {
    const es = data.employeeState as Record<string, unknown>;
    useEmployeeStore.setState({ employees: es.employees as never });
  }
  if (data.inventoryState) {
    const is = data.inventoryState as Record<string, unknown>;
    useInventoryStore.setState({
      items: is.items as never,
      orders: is.orders as never,
      suppliers: is.suppliers as never,
    });
  }
  if (data.guestState) {
    const gs = data.guestState as Record<string, unknown>;
    useGuestStore.setState({
      currentGuests: gs.currentGuests as never,
      guests: gs.guests as never,
      guestPool: gs.guestPool as never,
    });
  }
  if (data.storyState) {
    const ss = data.storyState as Record<string, unknown>;
    useStoryStore.setState({
      discoveredClues: ss.discoveredClues as never,
      storyFragments: ss.storyFragments as never,
      hotelHistory: ss.hotelHistory as never,
      guestSecrets: ss.guestSecrets as never,
      progress: ss.progress as never,
    });
  }
}

export function useSaveSystem(
  getState?: () => Omit<SaveData, 'timestamp' | 'version'>,
  onLoad?: (data: SaveData) => void
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetStatusAfterDelay = useCallback((delay = 2000) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setSaveStatus('idle');
      setSaveError(null);
    }, delay);
  }, []);

  const saveGame = useCallback(() => {
    try {
      setSaveStatus('saving');
      setSaveError(null);
      const state = getState ? getState() : collectAllState();
      const saveData: SaveData = {
        ...state,
        timestamp: Date.now(),
        version: SAVE_VERSION,
      };
      saveToStorage(saveData);
      setSaveStatus('saved');
      console.log('Game saved at', new Date().toLocaleTimeString());
      resetStatusAfterDelay();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '保存失败';
      setSaveStatus('error');
      setSaveError(msg);
      console.error('Failed to save game:', e);
      resetStatusAfterDelay(4000);
    }
  }, [getState, resetStatusAfterDelay]);

  const loadGame = useCallback((): SaveData | null => {
    try {
      setSaveStatus('loading');
      setSaveError(null);
      const data = loadFromStorage<SaveData>();
      if (data) {
        if (data.version !== SAVE_VERSION) {
          console.warn('Save version mismatch, may cause issues');
        }
        if (onLoad) {
          onLoad(data);
        } else {
          restoreAllState(data);
        }
        setSaveStatus('loaded');
        console.log('Save loaded and restored at', new Date().toLocaleTimeString());
        resetStatusAfterDelay();
        return data;
      }
      setSaveStatus('idle');
      return null;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '读取失败';
      setSaveStatus('error');
      setSaveError(msg);
      console.error('Failed to load game:', e);
      resetStatusAfterDelay(4000);
      return null;
    }
  }, [onLoad, resetStatusAfterDelay]);

  const deleteSave = useCallback(() => {
    try {
      clearStorage();
      console.log('Save deleted');
      setSaveStatus('idle');
      setSaveError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '删除失败';
      setSaveStatus('error');
      setSaveError(msg);
      console.error('Failed to delete save:', e);
      resetStatusAfterDelay(4000);
    }
  }, [resetStatusAfterDelay]);

  const checkForSave = useCallback(() => {
    return hasSavedGame();
  }, []);

  const getLastSaveTime = useCallback(() => {
    const data = loadFromStorage<SaveData>();
    return data ? new Date(data.timestamp) : null;
  }, []);

  const initAutoSave = useCallback(() => {
    if (autoSaveInitialized) return;
    autoSaveInitialized = true;
    console.log('Auto-save initialized');
  }, []);

  useEffect(() => {
    if (autoSaveIntervalId) return;

    const settings = useGameStore.getState().settings;
    if (!settings?.autoSave) return;

    autoSaveIntervalId = setInterval(() => {
      try {
        const state = getState ? getState() : collectAllState();
        const saveData: SaveData = {
          ...state,
          timestamp: Date.now(),
          version: SAVE_VERSION,
        };
        saveToStorage(saveData);
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
        autoSaveInitialized = false;
      }
    };
  }, [getState]);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveGame,
    loadGame,
    deleteSave,
    checkForSave,
    getLastSaveTime,
    initAutoSave,
    saveStatus,
    saveError,
  } as const;
}
