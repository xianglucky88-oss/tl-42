import { useState, useCallback } from 'react';
import type { DayPhase } from '../types/game';

export interface DailyCycleState {
  currentDay: number;
  currentPhase: DayPhase;
  phaseTimer: number;
  isPaused: boolean;
}

const PHASE_ORDER: DayPhase[] = ['morning', 'afternoon', 'evening'];
const PHASE_NAMES: Record<DayPhase, string> = {
  morning: '早晨',
  afternoon: '下午',
  evening: '傍晚',
};

export function useDailyCycle(initialDay = 1) {
  const [state, setState] = useState<DailyCycleState>({
    currentDay: initialDay,
    currentPhase: 'morning',
    phaseTimer: 0,
    isPaused: false,
  });

  const nextPhase = useCallback(() => {
    setState(prev => {
      const currentIndex = PHASE_ORDER.indexOf(prev.currentPhase);
      if (currentIndex < PHASE_ORDER.length - 1) {
        return {
          ...prev,
          currentPhase: PHASE_ORDER[currentIndex + 1],
          phaseTimer: 0,
        };
      } else {
        return {
          ...prev,
          currentDay: prev.currentDay + 1,
          currentPhase: 'morning',
          phaseTimer: 0,
        };
      }
    });
  }, []);

  const nextDay = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentDay: prev.currentDay + 1,
      currentPhase: 'morning',
      phaseTimer: 0,
    }));
  }, []);

  const setDay = useCallback((day: number) => {
    setState(prev => ({
      ...prev,
      currentDay: day,
      currentPhase: 'morning',
      phaseTimer: 0,
    }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const initDailyCycle = useCallback(() => {
    console.log('Daily cycle initialized');
  }, []);

  const getPhaseName = useCallback(() => {
    return PHASE_NAMES[state.currentPhase];
  }, [state.currentPhase]);

  const isMorning = state.currentPhase === 'morning';
  const isAfternoon = state.currentPhase === 'afternoon';
  const isEvening = state.currentPhase === 'evening';

  return {
    ...state,
    nextPhase,
    nextDay,
    setDay,
    pause,
    resume,
    togglePause,
    getPhaseName,
    isMorning,
    isAfternoon,
    isEvening,
    initDailyCycle,
  };
}
