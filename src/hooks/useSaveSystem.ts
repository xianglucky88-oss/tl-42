import { useCallback, useEffect } from 'react';
import { saveToStorage, loadFromStorage, clearStorage, hasSavedGame } from '../utils/storage';

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

const SAVE_VERSION = '1.0.0';
const AUTOSAVE_INTERVAL = 60000;

export function useSaveSystem(
  getState?: () => Omit<SaveData, 'timestamp' | 'version'>,
  onLoad?: (data: SaveData) => void
) {
  const saveGame = useCallback(() => {
    if (!getState) return;
    const state = getState();
    const saveData: SaveData = {
      ...state,
      timestamp: Date.now(),
      version: SAVE_VERSION,
    };
    saveToStorage(saveData);
    console.log('Game saved at', new Date().toLocaleTimeString());
  }, [getState]);

  const loadGame = useCallback((): SaveData | null => {
    const data = loadFromStorage<SaveData>();
    if (data) {
      if (data.version !== SAVE_VERSION) {
        console.warn('Save version mismatch, may cause issues');
      }
      onLoad?.(data);
      return data;
    }
    return null;
  }, [onLoad]);

  const deleteSave = useCallback(() => {
    clearStorage();
    console.log('Save deleted');
  }, []);

  const checkForSave = useCallback(() => {
    return hasSavedGame();
  }, []);

  const getLastSaveTime = useCallback(() => {
    const data = loadFromStorage<SaveData>();
    return data ? new Date(data.timestamp) : null;
  }, []);

  const initAutoSave = useCallback(() => {
    console.log('Auto-save initialized');
  }, []);

  useEffect(() => {
    if (!getState) return;
    const interval = setInterval(saveGame, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [saveGame, getState]);

  return {
    saveGame,
    loadGame,
    deleteSave,
    checkForSave,
    getLastSaveTime,
    initAutoSave,
  } as const;
}
