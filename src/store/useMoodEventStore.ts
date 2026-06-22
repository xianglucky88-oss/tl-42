import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { ActiveMoodEvent, MoodEvent, MoodEventChoice, MoodEventCooldown } from '../types/employee';
import type { Employee } from '../types/employee';
import { MOOD_EVENTS } from '../data/moodEvents';
import { useEmployeeStore } from './useEmployeeStore';
import { useHotelStore } from './useHotelStore';
import { weightedRandom } from '../utils/random';

interface MoodEventStore {
  activeEvents: ActiveMoodEvent[];
  cooldowns: MoodEventCooldown[];
  pendingEvent: ActiveMoodEvent | null;
  resolvedEvents: ActiveMoodEvent[];
  lastResultText: string | null;

  triggerMoodEvents: (employees: Employee[], currentDay: number) => ActiveMoodEvent[];
  resolveMoodEvent: (activeEventId: string, choiceId: string, currentDay: number) => void;
  dismissPending: () => void;
  isOnCooldown: (eventId: string, employeeId: string, currentDay: number) => boolean;
  getActiveEventsForEmployee: (employeeId: string) => ActiveMoodEvent[];
  resetMoodEvents: () => void;
}

export const useMoodEventStore = create<MoodEventStore>((set, get) => ({
  activeEvents: [],
  cooldowns: [],
  pendingEvent: null,
  resolvedEvents: [],
  lastResultText: null,

  isOnCooldown: (eventId, employeeId, currentDay) => {
    return get().cooldowns.some(
      c => c.eventId === eventId && c.employeeId === employeeId && c.untilDay > currentDay
    );
  },

  triggerMoodEvents: (employees, currentDay) => {
    const triggered: ActiveMoodEvent[] = [];
    const newCooldowns: MoodEventCooldown[] = [];

    for (const emp of employees) {
      const eligibleEvents = MOOD_EVENTS.filter(event => {
        if (get().isOnCooldown(event.id, emp.id, currentDay)) return false;
        if (event.applicableRoles && !event.applicableRoles.includes(emp.role)) return false;
        if (event.applicableTraits && !event.applicableTraits.some(t => emp.traits.includes(t))) return false;
        if (event.minMorale !== undefined && emp.morale < event.minMorale) return false;
        if (event.maxMorale !== undefined && emp.morale > event.maxMorale) return false;
        const hasActive = get().activeEvents.some(ae => ae.employeeId === emp.id && !ae.resolved);
        if (hasActive) return false;
        return true;
      });

      if (eligibleEvents.length === 0) continue;

      const eventCandidates: MoodEvent[] = [];
      const weights: number[] = [];

      for (const event of eligibleEvents) {
        if (Math.random() < event.probability) {
          eventCandidates.push(event);
          weights.push(event.severity === 'major' ? 1 : event.severity === 'moderate' ? 2 : 3);
        }
      }

      if (eventCandidates.length === 0) continue;

      const selectedEvent = weights.length === 1
        ? eventCandidates[0]
        : weightedRandom(eventCandidates, weights);

      const activeEvent: ActiveMoodEvent = {
        id: `mood_${Date.now()}_${emp.id}_${Math.random().toString(36).substr(2, 5)}`,
        eventId: selectedEvent.id,
        employeeId: emp.id,
        triggeredDay: currentDay,
        resolved: false,
      };

      triggered.push(activeEvent);
      newCooldowns.push({
        eventId: selectedEvent.id,
        employeeId: emp.id,
        untilDay: currentDay + selectedEvent.cooldownDays,
      });
    }

    if (triggered.length > 0) {
      set(state => ({
        activeEvents: [...state.activeEvents, ...triggered],
        cooldowns: [...state.cooldowns, ...newCooldowns],
        pendingEvent: triggered[0],
      }));
    }

    return triggered;
  },

  resolveMoodEvent: (activeEventId, choiceId, currentDay) => {
    const state = get();
    const activeEvent = state.activeEvents.find(ae => ae.id === activeEventId);
    if (!activeEvent || activeEvent.resolved) return;

    const moodEvent = MOOD_EVENTS.find(e => e.id === activeEvent.eventId);
    if (!moodEvent) return;

    const choice = moodEvent.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const employeeStore = useEmployeeStore.getState();
    const hotelStore = useHotelStore.getState();
    const emp = employeeStore.employees.find(e => e.id === activeEvent.employeeId);
    const empName = emp?.name || '员工';

    const effects = choice.effects;

    if (effects.morale) {
      employeeStore.actions.updateEmployeeMorale(activeEvent.employeeId, effects.morale);
    }
    if (effects.mood) {
      employeeStore.actions.updateEmployeeMood(
        activeEvent.employeeId,
        Math.max(0, Math.min(100, (emp?.mood || 50) + effects.mood))
      );
    }
    if (effects.stamina) {
      employeeStore.actions.updateEmployeeStamina(activeEvent.employeeId, effects.stamina);
    }
    if (effects.efficiency || effects.friendliness) {
      employeeStore.actions.updateEmployee(activeEvent.employeeId, {
        ...(effects.efficiency ? { efficiency: Math.max(0, Math.min(100, (emp?.efficiency || 50) + effects.efficiency)) } : {}),
        ...(effects.friendliness ? { friendliness: Math.max(0, Math.min(100, (emp?.friendliness || 50) + effects.friendliness)) } : {}),
      });
    }
    if (effects.money) {
      hotelStore.actions.updateMoney(effects.money);
    }
    if (effects.reputation) {
      hotelStore.actions.updateReputation(effects.reputation);
    }

    if (choice.sideEffects?.targetEmployeeId) {
      const targetId = choice.sideEffects.targetEmployeeId;
      if (choice.sideEffects.morale) {
        employeeStore.actions.updateEmployeeMorale(targetId, choice.sideEffects.morale);
      }
      if (choice.sideEffects.mood) {
        const targetEmp = employeeStore.employees.find(e => e.id === targetId);
        if (targetEmp) {
          employeeStore.actions.updateEmployeeMood(
            targetId,
            Math.max(0, Math.min(100, targetEmp.mood + choice.sideEffects.mood!))
          );
        }
      }
    } else if (choice.sideEffects?.morale || choice.sideEffects?.mood) {
      const otherEmployees = employeeStore.employees.filter(e => e.id !== activeEvent.employeeId);
      for (const other of otherEmployees) {
        if (choice.sideEffects!.morale) {
          employeeStore.actions.updateEmployeeMorale(other.id, choice.sideEffects!.morale);
        }
        if (choice.sideEffects!.mood) {
          employeeStore.actions.updateEmployeeMood(
            other.id,
            Math.max(0, Math.min(100, other.mood + choice.sideEffects!.mood!))
          );
        }
      }
    }

    const personalizedText = choice.resultText.replace(/\{employee\}/g, empName);

    set(state => ({
      activeEvents: state.activeEvents.map(ae =>
        ae.id === activeEventId ? { ...ae, resolved: true, chosenOptionId: choiceId } : ae
      ),
      resolvedEvents: [
        ...state.resolvedEvents,
        { ...activeEvent, resolved: true, chosenOptionId: choiceId },
      ],
      lastResultText: personalizedText,
    }));

    const remainingUnresolved = get().activeEvents.filter(
      ae => !ae.resolved && ae.id !== activeEventId
    );
    set({ pendingEvent: remainingUnresolved[0] || null });
  },

  dismissPending: () => {
    set({ lastResultText: null });
    const remainingUnresolved = get().activeEvents.filter(ae => !ae.resolved);
    set({ pendingEvent: remainingUnresolved[0] || null });
  },

  getActiveEventsForEmployee: (employeeId) => {
    return get().activeEvents.filter(ae => ae.employeeId === employeeId && !ae.resolved);
  },

  resetMoodEvents: () => {
    set({
      activeEvents: [],
      cooldowns: [],
      pendingEvent: null,
      resolvedEvents: [],
      lastResultText: null,
    });
  },
}));

export const useActiveMoodEvents = () =>
  useMoodEventStore(useShallow((state) => state.activeEvents.filter(ae => !ae.resolved)));

export const usePendingMoodEvent = () => useMoodEventStore((state) => state.pendingEvent);

export const useMoodEventResult = () => useMoodEventStore((state) => state.lastResultText);

export const useMoodEventActions = () => ({
  triggerMoodEvents: useMoodEventStore.getState().triggerMoodEvents,
  resolveMoodEvent: useMoodEventStore.getState().resolveMoodEvent,
  dismissPending: useMoodEventStore.getState().dismissPending,
  resetMoodEvents: useMoodEventStore.getState().resetMoodEvents,
  getActiveEventsForEmployee: useMoodEventStore.getState().getActiveEventsForEmployee,
});
