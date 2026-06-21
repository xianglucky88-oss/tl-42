import { useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useHotelStore } from '../store/useHotelStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useGuestStore } from '../store/useGuestStore';
import { useStoryStore } from '../store/useStoryStore';
import { useScheduleStore } from '../store/useScheduleStore';
import type { DayPhase } from '../types/game';
import type { GuestNeed } from '../types/guest';
import { getDifficultyConfig } from '../utils/formula';

export function useGameLoop() {
  const currentDay = useGameStore((state) => state.currentDay);
  const currentPhase = useGameStore((state) => state.currentPhase);

  const nextPhase = useCallback(() => {
    const gameState = useGameStore.getState();
    const guestState = useGuestStore.getState();
    const employeeState = useEmployeeStore.getState();
    const inventoryState = useInventoryStore.getState();
    const hotelState = useHotelStore.getState();
    const storyState = useStoryStore.getState();
    const scheduleState = useScheduleStore.getState();

    if (scheduleState.schedules.length === 0) {
      scheduleState.initSchedules(employeeState.employees.map(e => e.id));
    }

    const phases: DayPhase[] = ['morning', 'afternoon', 'evening'];
    const currentIndex = phases.indexOf(gameState.currentPhase);

    console.log(`[GameLoop] 第${gameState.currentDay}天 ${gameState.currentPhase} 结束`);

    const guests = guestState.currentGuests;
    const employees = employeeState.employees;

    let phaseConsumption: Record<string, number> = {};

    guests.forEach(guest => {
      guest.needs.forEach(need => {
        if (need.status === 'met' && need.requiredItems) {
          need.requiredItems.forEach(itemId => {
            const item = inventoryState.items.find(i => i.id === itemId);
            if (item && item.dailyConsumption > 0) {
              phaseConsumption[itemId] = (phaseConsumption[itemId] || 0) + Math.ceil(item.dailyConsumption / 3);
            }
          });
        }
      });
    });

    if (Object.keys(phaseConsumption).length > 0) {
      inventoryState.actions.consumeItems(phaseConsumption);
    }

    if (currentIndex < 2) {
      employees.forEach(emp => {
        if (emp.assignedArea && emp.assignedArea !== 'unassigned') {
          const drain = emp.assignedArea === 'maintenance' ? 8 : 
                        emp.assignedArea === 'rooms' ? 6 : 4;
          employeeState.actions.updateEmployeeStamina(emp.id, -drain);
        }
      });
    }

    const diffConfig = getDifficultyConfig(gameState.settings.difficulty);

    guests.forEach(guest => {
      let patienceChange = 0;
      let satisfactionChange = 0;

      guest.needs.forEach(need => {
        if (need.status === 'unmet') {
          patienceChange -= need.urgency * diffConfig.patienceDecay;
          satisfactionChange -= need.urgency * diffConfig.satisfactionDecay;
        } else if (need.status === 'met') {
          satisfactionChange += need.urgency * 1;
        } else if (need.status === 'exceeded') {
          satisfactionChange += need.urgency * 2;
        }
      });

      patienceChange = Math.round(patienceChange);
      satisfactionChange = Math.round(satisfactionChange);

      if (patienceChange !== 0) {
        guestState.actions.updateGuestPatience(guest.id, patienceChange);
      }
      if (satisfactionChange !== 0) {
        guestState.actions.updateGuestSatisfaction(guest.id, satisfactionChange);
      }
    });

    if (currentIndex < phases.length - 1) {
      const nextPhaseValue = phases[currentIndex + 1];
      gameState.actions.setDayPhase(nextPhaseValue);
      
      console.log(`[GameLoop] 第${gameState.currentDay}天 ${nextPhaseValue} 开始`);

      if (nextPhaseValue === 'morning') {
        inventoryState.actions.checkPendingDeliveries(gameState.currentDay);
        employeeState.actions.restAllEmployees();
      }

      if (nextPhaseValue === 'afternoon') {
        guests.forEach(guest => {
          const afternoonObs = guest.observations.find(o => o.time === 'afternoon' && !o.discovered);
          if (afternoonObs && Math.random() > 0.5) {
            guestState.actions.addObservation(guest.id, afternoonObs.id);
            if (afternoonObs.clueId) {
              storyState.discoverClue(afternoonObs.clueId, 'observation', gameState.currentDay);
            }
          }
        });
      }

      if (nextPhaseValue === 'evening') {
        guests.forEach(guest => {
          const eveningObs = guest.observations.find(o => o.time === 'evening' && !o.discovered);
          if (eveningObs && Math.random() > 0.4) {
            guestState.actions.addObservation(guest.id, eveningObs.id);
            if (eveningObs.clueId) {
              storyState.discoverClue(eveningObs.clueId, 'observation', gameState.currentDay);
            }
          }
        });
      }
    } else {
      console.log(`[GameLoop] 第${gameState.currentDay}天结束，开始结算`);

      const diffConfig = getDifficultyConfig(gameState.settings.difficulty);

      let dayIncome = 0;
      let dayExpense = 0;
      let reputationChange = 0;

      const occupiedRooms = hotelState.rooms.filter(r => r.isOccupied);
      const roomIncome = occupiedRooms.reduce((sum, room) => sum + room.price, 0);
      dayIncome += roomIncome;

      guests.forEach(guest => {
        if (guest.paid) {
          dayIncome += guest.totalBill;
        }
        if (diffConfig.tipChance > 0 && guest.satisfaction >= 80 && Math.random() < diffConfig.tipChance) {
          const tip = Math.floor(guest.totalBill * 0.1);
          dayIncome += tip;
        }
      });

      dayIncome = Math.floor(dayIncome * diffConfig.incomeMultiplier);

      const salaries = employees.reduce((sum, e) => sum + (e.dailyWage || e.salary || 50), 0);
      dayExpense += salaries;

      let dailyConsumptionCost = 0;
      inventoryState.items.forEach(item => {
        if (item.dailyConsumption > 0) {
          dailyConsumptionCost += item.dailyConsumption * item.unitPrice;
        }
      });
      dayExpense += dailyConsumptionCost;

      const maintenanceCost = 100;
      dayExpense += maintenanceCost;

      dayExpense = Math.floor(dayExpense * diffConfig.expenseMultiplier);

      let avgSatisfaction = 50;
      if (guests.length > 0) {
        avgSatisfaction = guests.reduce((sum, g) => sum + g.satisfaction, 0) / guests.length;
      }

      const baseReputationChange = Math.round((avgSatisfaction - 50) / 10);
      if (baseReputationChange >= 0) {
        reputationChange = Math.round(baseReputationChange * diffConfig.reputationGainMultiplier);
      } else {
        reputationChange = Math.round(baseReputationChange * diffConfig.reputationLossMultiplier);
      }

      const profit = dayIncome - dayExpense;

      hotelState.actions.updateMoney(profit);
      hotelState.actions.updateReputation(reputationChange);
      hotelState.actions.updateRating();

      const dailyStats = {
        day: gameState.currentDay,
        income: dayIncome,
        expense: dayExpense,
        profit,
        guestsServed: guests.length,
        reputationChange,
        events: [],
      };
      hotelState.actions.addDailyStats(dailyStats);

      console.log(`[GameLoop] 第${gameState.currentDay}天结算: 收入¥${dayIncome}, 支出¥${dayExpense}, 利润¥${profit}, 声望变化${reputationChange >= 0 ? '+' : ''}${reputationChange}`);

      const scheduleState = useScheduleStore.getState();

      scheduleState.schedules.forEach(schedule => {
        const shiftedSlots = [...schedule.slots.slice(1), 'unassigned' as const];
        scheduleState.setWeekSchedule(schedule.employeeId, shiftedSlots);
      });

      const newDay = gameState.currentDay + 1;
      gameState.actions.nextDay();

      console.log(`[GameLoop] 第${newDay}天开始`);

      const scheduleDayOffset = 0;
      const dayAssignments = scheduleState.getDayAssignments(scheduleDayOffset);
      const scheduleBonuses = scheduleState.calculateBonuses();

      const hasAnySchedule = dayAssignments.some(a => a.assignment !== 'unassigned');

      if (hasAnySchedule) {
        console.log(`[GameLoop] 自动应用第${newDay}天排班，共${dayAssignments.length}名员工`);
        for (const { employeeId, assignment } of dayAssignments) {
          employeeState.applyDaySchedule(employeeId, assignment);
        }
        employeeState.applyScheduleBonuses(scheduleBonuses);
      } else {
        employeeState.actions.restAllEmployees();
      }

      const departingGuests = guestState.actions.getTodaysDepartures(gameState.currentDay);
      departingGuests.forEach(guest => {
        if (!guest.isCheckOut) {
          guestState.actions.checkoutGuest(guest.id);
        }
      });

      inventoryState.actions.checkPendingDeliveries(newDay);
      storyState.checkForUnlocks();
    }
  }, []);

  const nextDay = useCallback(() => {
    const gameState = useGameStore.getState();
    if (gameState.currentPhase === 'evening') {
      nextPhase();
    } else {
      const phases: DayPhase[] = ['morning', 'afternoon', 'evening'];
      const currentIndex = phases.indexOf(gameState.currentPhase as DayPhase);
      const remainingSteps = phases.length - 1 - currentIndex;
      for (let i = 0; i < remainingSteps + 1; i++) {
        nextPhase();
      }
    }
  }, [nextPhase]);

  const meetGuestNeed = useCallback((guestId: string, needId: string): boolean => {
    const guestState = useGuestStore.getState();
    const inventoryState = useInventoryStore.getState();
    const hotelState = useHotelStore.getState();
    const storyState = useStoryStore.getState();
    const gameState = useGameStore.getState();

    const guest = guestState.actions.getGuestById(guestId);
    if (!guest) return false;

    const need = guest.needs.find((n: GuestNeed) => n.id === needId);
    if (!need || need.status === 'met') return false;

    if (need.requiredItems && need.requiredItems.length > 0) {
      for (const itemId of need.requiredItems) {
        const item = inventoryState.items.find((i: any) => i.id === itemId);
        if (!item || item.quantity <= 0) {
          console.log(`[GameLoop] 无法满足需求: ${itemId} 库存不足`);
          return false;
        }
      }

      const consumption: Record<string, number> = {};
      need.requiredItems.forEach(itemId => {
        consumption[itemId] = 1;
      });
      inventoryState.actions.consumeItems(consumption);
    }

    guestState.actions.updateNeedStatus(guestId, needId, 'met');

    if (need.reward) {
      if (need.reward.reputation) {
        hotelState.actions.updateReputation(need.reward.reputation);
      }
      if (need.reward.money) {
        hotelState.actions.updateMoney(need.reward.money);
      }
      if (need.reward.clueId) {
        storyState.discoverClue(need.reward.clueId, 'guest_need', gameState.currentDay);
      }
    }

    const satisfactionGain = need.urgency * 5;
    guestState.actions.updateGuestSatisfaction(guestId, satisfactionGain);

    console.log(`[GameLoop] 满足需求成功: ${need.description}, 声望+${need.reward?.reputation || 0}, 满意度+${satisfactionGain}`);

    return true;
  }, []);

  const applyDialogueEffect = useCallback((guestId: string, effect: {
    mood?: number;
    reputation?: number;
    clueId?: string;
    unlocksStory?: string;
    money?: number;
  }) => {
    console.log('[GameLoop] 应用对话效果:', effect);

    const hotelState = useHotelStore.getState();
    const storyState = useStoryStore.getState();
    const guestState = useGuestStore.getState();
    const gameState = useGameStore.getState();

    if (effect.reputation) {
      hotelState.actions.updateReputation(effect.reputation);
    }

    if (effect.money) {
      hotelState.actions.updateMoney(effect.money);
    }

    if (effect.clueId) {
      storyState.discoverClue(effect.clueId, 'dialogue', gameState.currentDay);
      guestState.actions.unlockClueForGuest(guestId, effect.clueId);
    }

    if (effect.unlocksStory) {
      storyState.unlockStoryFragment(effect.unlocksStory, gameState.currentDay);
    }

    if (effect.mood) {
      guestState.actions.updateGuestSatisfaction(guestId, effect.mood);
    }
  }, []);

  const addRandomGuest = useCallback(() => {
    const hotelState = useHotelStore.getState();
    const guestState = useGuestStore.getState();
    const gameState = useGameStore.getState();

    const availableRooms = hotelState.rooms.filter(r => !r.isOccupied);
    if (availableRooms.length === 0) {
      console.log('[GameLoop] 没有空房间了');
      return null;
    }

    const pool = guestState.guestPool || [];
    if (pool.length === 0) return null;

    const randomGuest = pool[Math.floor(Math.random() * pool.length)];
    if (!randomGuest) return null;

    const newGuest = {
      ...randomGuest,
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      arrivalDay: gameState.currentDay,
      departureDay: gameState.currentDay + (randomGuest.stayDuration || 1),
      currentDayOfStay: 1,
      isCheckOut: false,
      totalBill: 0,
      paid: false,
      satisfaction: 50 + Math.floor(Math.random() * 30),
      patience: randomGuest.maxPatience || 100,
      observations: randomGuest.observations.map(o => ({ ...o, discovered: false })),
      unlockedClues: [],
      status: 'checking_in' as const,
      secret: { ...randomGuest.secret, discovered: false },
      needs: randomGuest.needs.map(n => ({ ...n, status: 'unmet' as const, met: false })),
    };

    guestState.actions.addGuest(newGuest);

    setTimeout(() => {
      guestState.actions.updateGuest(newGuest.id, { status: 'staying' });
    }, 1000);

    return newGuest;
  }, []);

  const addObservation = useCallback((guestId: string, observationId: string) => {
    const guestState = useGuestStore.getState();
    const storyState = useStoryStore.getState();
    const gameState = useGameStore.getState();

    const guest = guestState.actions.getGuestById(guestId);
    if (!guest) return;

    const observation = guest.observations?.find((o: any) => o.id === observationId);
    if (!observation || observation.discovered) return;

    guestState.actions.discoverObservation(guestId, observationId);

    if (observation.clueId) {
      storyState.discoverClue(observation.clueId, 'observation', gameState.currentDay);
      guestState.actions.unlockClueForGuest(guestId, observation.clueId);
      console.log(`[GameLoop] 观察发现线索: ${observation.clueId}`);
    }

    console.log(`[GameLoop] 发现观察: ${observation.description}`);
  }, []);

  return {
    currentDay,
    currentPhase,
    nextPhase,
    nextDay,
    meetGuestNeed,
    applyDialogueEffect,
    addRandomGuest,
    addObservation,
  };
}
