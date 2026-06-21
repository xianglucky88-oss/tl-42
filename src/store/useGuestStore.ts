import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Guest, GuestMood, GuestNeedStatus } from '../types/guest';
import { GUEST_POOL, generateDailyGuests } from '../data/guests';
import { useHotelStore } from './useHotelStore';

interface GuestStore {
  currentGuests: Guest[];
  guests: Guest[];
  guestPool: Guest[];
  meetNeed: (guestId: string, needId: string) => void;
  addObservation: (guestId: string, observationId: string) => void;
  addGuest: (guest: Guest) => void;
  actions: {
    addGuest: (guest: Guest) => void;
    removeGuest: (guestId: string) => void;
    updateGuest: (guestId: string, updates: Partial<Guest>) => void;
    updateGuestMood: (guestId: string, mood: GuestMood) => void;
    updateGuestSatisfaction: (guestId: string, amount: number) => void;
    updateGuestPatience: (guestId: string, amount: number) => void;
    updateNeedStatus: (guestId: string, needId: string, status: GuestNeedStatus) => void;
    meetNeed: (guestId: string, needId: string) => void;
    addObservation: (guestId: string, observationId: string) => void;
    discoverObservation: (guestId: string, observationId: string) => void;
    unlockClueForGuest: (guestId: string, clueId: string) => void;
    addToGuestBill: (guestId: string, amount: number) => void;
    payBill: (guestId: string) => void;
    checkoutGuest: (guestId: string) => void;
    generateGuestsForDay: (day: number) => Guest[];
    processDailyGuestNeeds: () => void;
    getGuestById: (guestId: string) => Guest | undefined;
    getTodaysArrivals: (day: number) => Guest[];
    getTodaysDepartures: (day: number) => Guest[];
    resetGuests: () => void;
  };
}

export const useGuestStore = create<GuestStore>((set, get) => {
  const addGuest = (guest: Guest) => {
    const hotelRooms = useHotelStore.getState().rooms;
    const availableRoom = hotelRooms.find((r) => !r.isOccupied);
    
    if (availableRoom) {
      useHotelStore.getState().actions.assignGuestToRoom(guest.id, availableRoom.id);
      const updatedGuest = {
        ...guest,
        roomNumber: availableRoom.number,
        totalBill: availableRoom.price * (guest.stayDuration || 0),
      };
      set((state) => ({ currentGuests: [...state.currentGuests, updatedGuest], guests: [...state.currentGuests, updatedGuest] }));
    }
  };

  const meetNeed = (guestId: string, needId: string) => {
    set((state) => ({
      currentGuests: state.currentGuests.map((guest) => {
        if (guest.id !== guestId) return guest;
        return {
          ...guest,
          needs: guest.needs.map((need) =>
            need.id === needId ? { ...need, status: 'met' as GuestNeedStatus, met: true } : need
          ),
        };
      }),
      guests: state.currentGuests.map((guest) => {
        if (guest.id !== guestId) return guest;
        return {
          ...guest,
          needs: guest.needs.map((need) =>
            need.id === needId ? { ...need, status: 'met' as GuestNeedStatus, met: true } : need
          ),
        };
      }),
    }));
  };

  const addObservation = (guestId: string, observationId: string) => {
    set((state) => ({
      currentGuests: state.currentGuests.map((guest) => {
        if (guest.id !== guestId) return guest;
        return {
          ...guest,
          observations: guest.observations.map((obs) =>
            obs.id === observationId ? { ...obs, discovered: true } : obs
          ),
        };
      }),
      guests: state.currentGuests.map((guest) => {
        if (guest.id !== guestId) return guest;
        return {
          ...guest,
          observations: guest.observations.map((obs) =>
            obs.id === observationId ? { ...obs, discovered: true } : obs
          ),
        };
      }),
    }));
  };

  return {
    currentGuests: [],
    guests: [],
    guestPool: [...GUEST_POOL],
    addGuest,
    meetNeed,
    addObservation,

    actions: {
      addGuest,
      meetNeed,
      addObservation,
      removeGuest: (guestId) => {
        useHotelStore.getState().actions.checkoutGuest(guestId);
        set((state) => ({
          currentGuests: state.currentGuests.filter((g) => g.id !== guestId),
          guests: state.currentGuests.filter((g) => g.id !== guestId),
        }));
      },

      updateGuest: (guestId, updates) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, ...updates } : guest
          ),
          guests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, ...updates } : guest
          ),
        })),

      updateGuestMood: (guestId, mood) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, mood } : guest
          ),
          guests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, mood } : guest
          ),
        })),

      updateGuestSatisfaction: (guestId, amount) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) =>
            guest.id === guestId
              ? { ...guest, satisfaction: Math.max(0, Math.min(100, guest.satisfaction + amount)) }
              : guest
          ),
          guests: state.currentGuests.map((guest) =>
            guest.id === guestId
              ? { ...guest, satisfaction: Math.max(0, Math.min(100, guest.satisfaction + amount)) }
              : guest
          ),
        })),

      updateGuestPatience: (guestId, amount) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) =>
            guest.id === guestId
              ? { ...guest, patience: Math.max(0, Math.min(100, guest.patience + amount)) }
              : guest
          ),
          guests: state.currentGuests.map((guest) =>
            guest.id === guestId
              ? { ...guest, patience: Math.max(0, Math.min(100, guest.patience + amount)) }
              : guest
          ),
        })),

      updateNeedStatus: (guestId, needId, status) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            return {
              ...guest,
              needs: guest.needs.map((need) =>
                need.id === needId ? { ...need, status, met: status === 'met' } : need
              ),
            };
          }),
          guests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            return {
              ...guest,
              needs: guest.needs.map((need) =>
                need.id === needId ? { ...need, status, met: status === 'met' } : need
              ),
            };
          }),
        })),

      discoverObservation: (guestId, observationId) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            return {
              ...guest,
              observations: guest.observations.map((obs) =>
                obs.id === observationId ? { ...obs, isDiscovered: true } : obs
              ),
            };
          }),
          guests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            return {
              ...guest,
              observations: guest.observations.map((obs) =>
                obs.id === observationId ? { ...obs, isDiscovered: true } : obs
              ),
            };
          }),
        })),

      unlockClueForGuest: (guestId, clueId) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            if (guest.unlockedClues.includes(clueId)) return guest;
            return {
              ...guest,
              unlockedClues: [...guest.unlockedClues, clueId],
            };
          }),
          guests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            if (guest.unlockedClues.includes(clueId)) return guest;
            return {
              ...guest,
              unlockedClues: [...guest.unlockedClues, clueId],
            };
          }),
        })),

      addToGuestBill: (guestId, amount) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, totalBill: guest.totalBill + amount } : guest
          ),
          guests: state.currentGuests.map((guest) =>
            guest.id === guestId ? { ...guest, totalBill: guest.totalBill + amount } : guest
          ),
        })),

      payBill: (guestId) => {
        const guest = get().currentGuests.find((g) => g.id === guestId);
        if (guest && !guest.paid) {
          useHotelStore.getState().actions.updateMoney(guest.totalBill);
          set((state) => ({
            currentGuests: state.currentGuests.map((g) =>
              g.id === guestId ? { ...g, paid: true } : g
            ),
            guests: state.currentGuests.map((g) =>
              g.id === guestId ? { ...g, paid: true } : g
            ),
          }));
        }
      },

      checkoutGuest: (guestId) => {
        const guest = get().currentGuests.find((g) => g.id === guestId);
        if (guest) {
          if (!guest.paid) {
            get().actions.payBill(guestId);
          }
          const satisfactionBonus = guest.satisfaction > 70 ? 5 : guest.satisfaction > 50 ? 2 : guest.satisfaction > 30 ? 0 : -5;
          useHotelStore.getState().actions.updateReputation(satisfactionBonus);
          get().actions.removeGuest(guestId);
        }
      },

      generateGuestsForDay: (day) => {
        return generateDailyGuests(day);
      },

      processDailyGuestNeeds: () => {
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) => {
            let patienceChange = 0;
            let satisfactionChange = 0;
            let mood: GuestMood = guest.mood;

            guest.needs.forEach((need) => {
              if (need.status === 'unmet') {
                patienceChange -= need.urgency * 2;
                satisfactionChange -= need.urgency * 3;
              } else if (need.status === 'met') {
                satisfactionChange += need.urgency * 2;
              } else if (need.status === 'exceeded') {
                satisfactionChange += need.urgency * 4;
              }
            });

            const newPatience = Math.max(0, Math.min(100, guest.patience + patienceChange));
            const newSatisfaction = Math.max(0, Math.min(100, guest.satisfaction + satisfactionChange));

            if (newSatisfaction >= 80) mood = 'happy';
            else if (newSatisfaction >= 60) mood = 'content';
            else if (newSatisfaction >= 40) mood = 'neutral';
            else if (newSatisfaction >= 20) mood = 'frustrated';
            else mood = 'angry';

            return {
              ...guest,
              currentDayOfStay: (guest.currentDayOfStay || 0) + 1,
              patience: newPatience,
              satisfaction: newSatisfaction,
              mood,
            };
          }),
        }));
        set((state) => ({ guests: [...state.currentGuests] }));
      },

      getGuestById: (guestId) => {
        return get().currentGuests.find((g) => g.id === guestId);
      },

      getTodaysArrivals: (day) => {
        return get().currentGuests.filter((g) => g.arrivalDay === day);
      },

      getTodaysDepartures: (day) => {
        return get().currentGuests.filter((g) => g.departureDay === day && !g.isCheckOut);
      },

      resetGuests: () => {
        set({ currentGuests: [], guests: [], guestPool: [...GUEST_POOL] });
      },
    },
  };
});

export const useCurrentGuests = () => useGuestStore((state) => state.currentGuests);
export const useGuestById = (id: string) =>
  useGuestStore(
    useShallow((state) => state.currentGuests.find((g) => g.id === id))
  );
export const useGuestActions = () => useGuestStore((state) => state.actions);
