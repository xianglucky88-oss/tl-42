import { create } from 'zustand';
import type { Room, Facility, DailyStats } from '../types/game';
import type { Employee } from '../types/employee';
import { INITIAL_HOTEL_DATA, INITIAL_ROOMS, INITIAL_FACILITIES, INITIAL_DAILY_STATS } from '../data/hotel';
import { calculateDailyIncome, calculateDailyExpense } from '../utils/formula';

interface HotelData {
  name: string;
  description: string;
  foundedYear: number;
  money: number;
  reputation: number;
  rating: number;
  rooms: Room[];
  facilities: Facility[];
}

interface HotelStore {
  name: string;
  description: string;
  foundedYear: number;
  money: number;
  reputation: number;
  rating: number;
  rooms: Room[];
  facilities: Facility[];
  hotel: HotelData;
  dailyStats: DailyStats;
  dailyStatsHistory: DailyStats[];
  actions: {
    updateMoney: (amount: number) => void;
    updateReputation: (amount: number) => void;
    updateRating: () => void;
    updateRoom: (roomId: string, updates: Partial<Room>) => void;
    updateFacility: (facilityId: string, updates: Partial<Facility>) => void;
    assignGuestToRoom: (guestId: string, roomId: string) => void;
    checkoutGuest: (guestId: string) => void;
    addDailyStats: (stats: DailyStats) => void;
    calculateDayEnd: (guests: unknown[], employees: unknown[], inventoryCost: number) => { income: number; expense: number; profit: number };
    resetHotel: () => void;
  };
}

export const useHotelStore = create<HotelStore>((set, get) => {
  const initialDailyStats: DailyStats = INITIAL_DAILY_STATS[0] || {
    day: 1,
    income: 0,
    expense: 0,
    guestsServed: 0,
    reputationChange: 0,
    events: [],
  };

  return {
    ...INITIAL_HOTEL_DATA,
    rooms: [...INITIAL_ROOMS],
    facilities: [...INITIAL_FACILITIES],
    hotel: {
      ...INITIAL_HOTEL_DATA,
      rooms: [...INITIAL_ROOMS],
      facilities: [...INITIAL_FACILITIES],
    },
    dailyStats: initialDailyStats,
    dailyStatsHistory: [...INITIAL_DAILY_STATS],

    actions: {
      updateMoney: (amount) =>
        set((state) => {
          const newMoney = Math.max(0, state.money + amount);
          return {
            money: newMoney,
            hotel: { ...state.hotel, money: newMoney },
          };
        }),

      updateReputation: (amount) =>
        set((state) => {
          const newReputation = Math.max(0, Math.min(100, state.reputation + amount));
          return {
            reputation: newReputation,
            hotel: { ...state.hotel, reputation: newReputation },
          };
        }),

      updateRating: () => {
        const { reputation } = get();
        let rating = 1;
        if (reputation >= 80) rating = 5;
        else if (reputation >= 65) rating = 4;
        else if (reputation >= 45) rating = 3;
        else if (reputation >= 25) rating = 2;
        set((state) => ({
          rating,
          hotel: { ...state.hotel, rating },
        }));
      },

      updateRoom: (roomId, updates) =>
        set((state) => {
          const newRooms = state.rooms.map((room) =>
            room.id === roomId ? { ...room, ...updates } : room
          );
          return {
            rooms: newRooms,
            hotel: { ...state.hotel, rooms: newRooms },
          };
        }),

      updateFacility: (facilityId, updates) =>
        set((state) => {
          const newFacilities = state.facilities.map((facility) =>
            facility.id === facilityId ? { ...facility, ...updates } : facility
          );
          return {
            facilities: newFacilities,
            hotel: { ...state.hotel, facilities: newFacilities },
          };
        }),

      assignGuestToRoom: (guestId, roomId) => {
        set((state) => {
          const newRooms = state.rooms.map((room) =>
            room.id === roomId ? { ...room, isOccupied: true, guestId } : room
          );
          return {
            rooms: newRooms,
            hotel: { ...state.hotel, rooms: newRooms },
          };
        });
      },

      checkoutGuest: (guestId) => {
        set((state) => {
          const newRooms = state.rooms.map((room) =>
            room.guestId === guestId ? { ...room, isOccupied: false, guestId: undefined } : room
          );
          return {
            rooms: newRooms,
            hotel: { ...state.hotel, rooms: newRooms },
          };
        });
      },

      addDailyStats: (stats) =>
        set((state) => ({
          dailyStats: stats,
          dailyStatsHistory: [...state.dailyStatsHistory, stats],
        })),

      calculateDayEnd: (guests, employees, inventoryCost) => {
        const { rooms } = get();
        const serviceQuality = 60;
        
        const income = calculateDailyIncome(
          rooms,
          guests as { roomNumber?: number; totalBill: number; paid: boolean }[],
          serviceQuality
        );
        
        const expense = calculateDailyExpense(
          employees as Employee[],
          inventoryCost,
          100
        );
        
        return {
          income,
          expense,
          profit: income - expense,
        };
      },

      resetHotel: () => {
        set({
          ...INITIAL_HOTEL_DATA,
          rooms: [...INITIAL_ROOMS],
          facilities: [...INITIAL_FACILITIES],
          hotel: {
            ...INITIAL_HOTEL_DATA,
            rooms: [...INITIAL_ROOMS],
            facilities: [...INITIAL_FACILITIES],
          },
          dailyStats: initialDailyStats,
          dailyStatsHistory: [...INITIAL_DAILY_STATS],
        });
      },
    },
  };
});

export const useHotelMoney = () => useHotelStore((state) => state.money);
export const useHotelReputation = () => useHotelStore((state) => state.reputation);
export const useHotelRating = () => useHotelStore((state) => state.rating);
export const useHotelRooms = () => useHotelStore((state) => state.rooms);
export const useHotelFacilities = () => useHotelStore((state) => state.facilities);
export const useHotelData = () => useHotelStore((state) => state.hotel);
export const useHotelDailyStats = () => useHotelStore((state) => state.dailyStats);
export const useHotelActions = () => useHotelStore((state) => state.actions);
