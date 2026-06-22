import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Guest, GuestMood, GuestNeedStatus, GuestReview, SatisfactionDimensions, SentimentKeyword, HotelAttributeKey } from '../types/guest';
import { GUEST_POOL, generateDailyGuests, SAMPLE_REVIEWS, generateRandomDimensions, generateRandomKeywords } from '../data/guests';
import { useHotelStore } from './useHotelStore';

interface GuestStore {
  currentGuests: Guest[];
  guests: Guest[];
  guestPool: Guest[];
  guestReviews: GuestReview[];
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
    updateSatisfactionDimensions: (guestId: string, dimension: keyof SatisfactionDimensions, amount: number) => void;
    updateNeedStatus: (guestId: string, needId: string, status: GuestNeedStatus) => void;
    meetNeed: (guestId: string, needId: string) => void;
    addObservation: (guestId: string, observationId: string) => void;
    discoverObservation: (guestId: string, observationId: string) => void;
    unlockClueForGuest: (guestId: string, clueId: string) => void;
    addToGuestBill: (guestId: string, amount: number) => void;
    payBill: (guestId: string) => void;
    checkoutGuest: (guestId: string) => void;
    addGuestReview: (review: GuestReview) => void;
    generateReviewFromGuest: (guest: Guest) => GuestReview;
    generateGuestsForDay: (day: number) => Guest[];
    processDailyGuestNeeds: () => void;
    getGuestById: (guestId: string) => Guest | undefined;
    getTodaysArrivals: (day: number) => Guest[];
    getTodaysDepartures: (day: number) => Guest[];
    getAverageSatisfaction: () => SatisfactionDimensions;
    getAllSentimentKeywords: () => SentimentKeyword[];
    resolveBadReviewsForAttribute: (attributeKey: HotelAttributeKey, attributeLevel: number) => string[];
    markReviewResolved: (reviewId: string) => void;
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

  const generateReviewFromGuest = (guest: Guest): GuestReview => {
    const rating = Math.max(1, Math.min(5, Math.round(guest.satisfaction / 20)));
    const hasNegativeKeywords = guest.sentimentKeywords?.some(kw => kw.polarity === 'negative');
    const isBadReview = rating <= 3 || guest.satisfaction < 60 || !!hasNegativeKeywords;
    return {
      id: `review_${guest.id}_${Date.now()}`,
      guestId: guest.id,
      guestName: guest.name,
      rating,
      content: '',
      keywords: guest.sentimentKeywords && guest.sentimentKeywords.length > 0 
        ? guest.sentimentKeywords 
        : generateRandomKeywords(guest.satisfaction),
      dimensions: guest.satisfactionDimensions && Object.keys(guest.satisfactionDimensions).length > 0
        ? guest.satisfactionDimensions
        : generateRandomDimensions(guest.satisfaction),
      overallSatisfaction: guest.satisfaction,
      stayStartDay: guest.arrivalDay,
      stayEndDay: guest.departureDay,
      createdAt: Date.now(),
      isVIP: guest.isVIP,
      isBadReview,
      isResolved: false,
    };
  };

  return {
    currentGuests: [],
    guests: [],
    guestPool: [...GUEST_POOL],
    guestReviews: [...SAMPLE_REVIEWS],
    addGuest,
    meetNeed,
    addObservation,

    actions: {
      addGuest,
      meetNeed,
      addObservation,
      generateReviewFromGuest,
      addGuestReview: (review) => {
        set((state) => ({ guestReviews: [review, ...state.guestReviews] }));
      },
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

      updateSatisfactionDimensions: (guestId, dimension, amount) =>
        set((state) => ({
          currentGuests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            const currentDims = guest.satisfactionDimensions || generateRandomDimensions(guest.satisfaction);
            return {
              ...guest,
              satisfactionDimensions: {
                ...currentDims,
                [dimension]: Math.max(0, Math.min(100, currentDims[dimension] + amount)),
              },
            };
          }),
          guests: state.currentGuests.map((guest) => {
            if (guest.id !== guestId) return guest;
            const currentDims = guest.satisfactionDimensions || generateRandomDimensions(guest.satisfaction);
            return {
              ...guest,
              satisfactionDimensions: {
                ...currentDims,
                [dimension]: Math.max(0, Math.min(100, currentDims[dimension] + amount)),
              },
            };
          }),
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
          const review = get().actions.generateReviewFromGuest({ ...guest, status: 'left' });
          get().actions.addGuestReview(review);
          get().actions.removeGuest(guestId);
        }
      },

      getAverageSatisfaction: () => {
        const reviews = get().guestReviews;
        const allGuests = get().guests;
        const allSources = [...reviews.map(r => r.dimensions), ...allGuests.map(g => g.satisfactionDimensions).filter(Boolean)] as SatisfactionDimensions[];
        
        if (allSources.length === 0) {
          return { room: 0, service: 0, food: 0, facilities: 0, location: 0, cleanliness: 0 };
        }

        const sums = allSources.reduce(
          (acc, dims) => ({
            room: acc.room + (dims?.room || 0),
            service: acc.service + (dims?.service || 0),
            food: acc.food + (dims?.food || 0),
            facilities: acc.facilities + (dims?.facilities || 0),
            location: acc.location + (dims?.location || 0),
            cleanliness: acc.cleanliness + (dims?.cleanliness || 0),
          }),
          { room: 0, service: 0, food: 0, facilities: 0, location: 0, cleanliness: 0 }
        );

        return {
          room: Math.round(sums.room / allSources.length),
          service: Math.round(sums.service / allSources.length),
          food: Math.round(sums.food / allSources.length),
          facilities: Math.round(sums.facilities / allSources.length),
          location: Math.round(sums.location / allSources.length),
          cleanliness: Math.round(sums.cleanliness / allSources.length),
        };
      },

      getAllSentimentKeywords: () => {
        const reviews = get().guestReviews;
        const allGuests = get().guests;
        const keywordMap = new Map<string, { word: string; polarity: SentimentKeyword['polarity']; weight: number; count: number }>();

        reviews.forEach(review => {
          review.keywords.forEach(kw => {
            const existing = keywordMap.get(kw.word);
            if (existing) {
              existing.weight += kw.weight;
              existing.count += 1;
            } else {
              keywordMap.set(kw.word, { ...kw, count: 1 });
            }
          });
        });

        allGuests.forEach(guest => {
          if (guest.sentimentKeywords) {
            guest.sentimentKeywords.forEach(kw => {
              const existing = keywordMap.get(kw.word);
              if (existing) {
                existing.weight += kw.weight;
                existing.count += 1;
              } else {
                keywordMap.set(kw.word, { ...kw, count: 1 });
              }
            });
          }
        });

        return Array.from(keywordMap.values())
          .map(k => ({ word: k.word, polarity: k.polarity, weight: Math.round(k.weight / k.count) }))
          .sort((a, b) => b.weight - a.weight);
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

      resolveBadReviewsForAttribute: (attributeKey, attributeLevel) => {
        const resolvedIds: string[] = [];
        set((state) => ({
          guestReviews: state.guestReviews.map((review) => {
            if (review.isResolved || !review.isBadReview) return review;
            const hasAttributeKeyword = review.keywords.some(
              (kw) => kw.relatedAttribute === attributeKey && kw.polarity === 'negative'
            );
            const attributeScore = review.dimensions[attributeKey];
            const threshold = 50 + (attributeLevel - 3) * 8;
            if (hasAttributeKeyword && attributeScore < threshold) {
              resolvedIds.push(review.id);
              return {
                ...review,
                isResolved: true,
                resolvedAt: Date.now(),
                resolvedBy: `升级${attributeKey}到Lv.${attributeLevel}`,
              };
            }
            return review;
          }),
        }));
        if (resolvedIds.length > 0) {
          useHotelStore.getState().actions.updateReputation(resolvedIds.length * 3);
        }
        return resolvedIds;
      },

      markReviewResolved: (reviewId) => {
        set((state) => ({
          guestReviews: state.guestReviews.map((review) =>
            review.id === reviewId
              ? { ...review, isResolved: true, resolvedAt: Date.now(), resolvedBy: '手动处理' }
              : review
          ),
        }));
      },

      resetGuests: () => {
        set({ currentGuests: [], guests: [], guestPool: [...GUEST_POOL], guestReviews: [...SAMPLE_REVIEWS] });
      },
    },
  };
});

export const useCurrentGuests = () => useGuestStore((state) => state.currentGuests);
export const useGuestReviews = () => useGuestStore((state) => state.guestReviews);
export const useGuestById = (id: string) =>
  useGuestStore(
    useShallow((state) => state.currentGuests.find((g) => g.id === id))
  );
export const useGuestActions = () => useGuestStore((state) => state.actions);
