import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  MinigameState,
  MinigameType,
  MinigameStatus,
  MinigameReward,
  MinigameResult,
  OpponentType,
} from '../types/minigame';
import { MINIGAME_DEFINITIONS } from '../data/minigames';
import { useHotelStore } from './useHotelStore';
import { useEmployeeStore } from './useEmployeeStore';
import { useGuestStore } from './useGuestStore';

interface MinigameStore extends MinigameState {
  actions: {
    startGame: (
      gameType: MinigameType,
      opponent: {
        type: OpponentType;
        id: string;
        name: string;
        avatar: string;
        skill: number;
      },
      bet: number
    ) => void;
    updateGameData: (data: Record<string, unknown>) => void;
    updateScores: (playerScore: number, opponentScore: number) => void;
    endGame: (status: 'won' | 'lost' | 'draw') => void;
    closeGame: () => void;
    resetMinigames: () => void;
    setBet: (bet: number) => void;
  };
}

const initialState: MinigameState = {
  currentGame: null,
  status: 'idle',
  bet: 0,
  opponent: null,
  playerScore: 0,
  opponentScore: 0,
  gameData: {},
  rewards: null,
  gameHistory: [],
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  totalMoneyWon: 0,
  totalMoneyLost: 0,
};

function generateId(): string {
  return `mg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useMinigameStore = create<MinigameStore>((set, get) => ({
  ...initialState,

  actions: {
    startGame: (gameType, opponent, bet) => {
      const hotelActions = useHotelStore.getState().actions;
      hotelActions.updateMoney(-bet);

      set({
        currentGame: gameType,
        status: 'playing',
        bet,
        opponent,
        playerScore: 0,
        opponentScore: 0,
        gameData: {},
        rewards: null,
      });
    },

    updateGameData: (data) => {
      set((state) => ({
        gameData: { ...state.gameData, ...data },
      }));
    },

    updateScores: (playerScore, opponentScore) => {
      set({ playerScore, opponentScore });
    },

    endGame: (status) => {
      const state = get();
      const gameDef = MINIGAME_DEFINITIONS[state.currentGame!];
      const hotelActions = useHotelStore.getState().actions;
      const employeeActions = useEmployeeStore.getState().actions;
      const guestActions = useGuestStore.getState().actions;

      let rewards: MinigameReward = {};
      const statusToSet: MinigameStatus = status;

      if (status === 'won') {
        const moneyReward = Math.floor(state.bet * (gameDef.baseReward.money || 1));
        const reputationReward = gameDef.baseReward.reputation || 0;
        const affinityReward = gameDef.baseReward.affinity || 0;

        rewards = {
          money: moneyReward,
          reputation: reputationReward,
          affinity: affinityReward,
        };

        hotelActions.updateMoney(moneyReward);
        hotelActions.updateReputation(reputationReward);

        if (state.opponent) {
          if (state.opponent.type === 'employee') {
            employeeActions.updateEmployeeMorale(state.opponent.id, affinityReward);
          } else if (state.opponent.type === 'guest') {
            guestActions.updateGuestSatisfaction(state.opponent.id, affinityReward);
          }
        }

        set((s) => ({
          totalWins: s.totalWins + 1,
          totalMoneyWon: s.totalMoneyWon + moneyReward,
        }));
      } else if (status === 'lost') {
        rewards = { money: 0, reputation: 0, affinity: Math.floor(gameDef.baseReward.affinity! / 2) };

        if (state.opponent) {
          if (state.opponent.type === 'employee') {
            employeeActions.updateEmployeeMorale(state.opponent.id, Math.floor(gameDef.baseReward.affinity! / 2));
          } else if (state.opponent.type === 'guest') {
            guestActions.updateGuestSatisfaction(state.opponent.id, Math.floor(gameDef.baseReward.affinity! / 2));
          }
        }

        set((s) => ({
          totalLosses: s.totalLosses + 1,
          totalMoneyLost: s.totalMoneyLost + state.bet,
        }));
      } else {
        rewards = { money: state.bet, reputation: 0, affinity: gameDef.baseReward.affinity };
        hotelActions.updateMoney(state.bet);

        if (state.opponent) {
          if (state.opponent.type === 'employee') {
            employeeActions.updateEmployeeMorale(state.opponent.id, gameDef.baseReward.affinity || 0);
          } else if (state.opponent.type === 'guest') {
            guestActions.updateGuestSatisfaction(state.opponent.id, gameDef.baseReward.affinity || 0);
          }
        }

        set((s) => ({
          totalDraws: s.totalDraws + 1,
        }));
      }

      const result: MinigameResult = {
        id: generateId(),
        gameType: state.currentGame!,
        opponentName: state.opponent?.name || 'Unknown',
        opponentType: state.opponent?.type || 'employee',
        result: status === 'won' ? 'win' : status === 'lost' ? 'loss' : 'draw',
        bet: state.bet,
        reward: rewards,
        timestamp: Date.now(),
        day: 1,
      };

      set((s) => ({
        status: statusToSet,
        rewards,
        gameHistory: [...s.gameHistory, result],
      }));
    },

    closeGame: () => {
      set({
        currentGame: null,
        status: 'idle',
        bet: 0,
        opponent: null,
        playerScore: 0,
        opponentScore: 0,
        gameData: {},
        rewards: null,
      });
    },

    resetMinigames: () => {
      set(initialState);
    },

    setBet: (bet) => {
      set({ bet });
    },
  },
}));

export const useCurrentMinigame = () => useMinigameStore((state) => state.currentGame);
export const useMinigameStatus = () => useMinigameStore((state) => state.status);
export const useMinigameBet = () => useMinigameStore((state) => state.bet);
export const useMinigameOpponent = () => useMinigameStore((state) => state.opponent);
export const useMinigameScores = () =>
  useMinigameStore(
    useShallow((state) => ({
      playerScore: state.playerScore,
      opponentScore: state.opponentScore,
    }))
  );
export const useMinigameRewards = () => useMinigameStore((state) => state.rewards);
export const useMinigameHistory = () => useMinigameStore((state) => state.gameHistory);
export const useMinigameStats = () =>
  useMinigameStore(
    useShallow((state) => ({
      totalWins: state.totalWins,
      totalLosses: state.totalLosses,
      totalDraws: state.totalDraws,
      totalMoneyWon: state.totalMoneyWon,
      totalMoneyLost: state.totalMoneyLost,
    }))
  );
export const useMinigameActions = () => useMinigameStore((state) => state.actions);
