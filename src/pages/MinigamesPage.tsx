import React, { useState } from 'react';
import {
  GameLobby,
  OpponentSelector,
  RockPaperScissors,
  Blackjack,
  SlotMachine,
  MemoryGame,
} from '../components';
import type { MinigameType, OpponentType } from '../types/minigame';
import { useMinigameActions, useCurrentMinigame } from '../store/useMinigameStore';

const MinigamesPage: React.FC = () => {
  const currentGame = useCurrentMinigame();
  const { startGame } = useMinigameActions();

  const [showOpponentSelector, setShowOpponentSelector] = useState(false);
  const [selectedGame, setSelectedGame] = useState<MinigameType | null>(null);
  const [showGame, setShowGame] = useState(false);

  const handleSelectGame = (gameType: MinigameType) => {
    setSelectedGame(gameType);
    setShowOpponentSelector(true);
  };

  const handleSelectOpponent = (
    opponent: {
      type: OpponentType;
      id: string;
      name: string;
      avatar: string;
      skill: number;
    },
    bet: number
  ) => {
    if (selectedGame) {
      startGame(selectedGame, opponent, bet);
      setShowOpponentSelector(false);
      setShowGame(true);
    }
  };

  const handleCloseGame = () => {
    setShowGame(false);
    setSelectedGame(null);
  };

  const renderCurrentGame = () => {
    if (!showGame || !currentGame) return null;

    switch (currentGame) {
      case 'rock_paper_scissors':
        return <RockPaperScissors isOpen={showGame} onClose={handleCloseGame} />;
      case 'blackjack':
        return <Blackjack isOpen={showGame} onClose={handleCloseGame} />;
      case 'slot_machine':
        return <SlotMachine isOpen={showGame} onClose={handleCloseGame} />;
      case 'memory':
        return <MemoryGame isOpen={showGame} onClose={handleCloseGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--pixel-bg-dark)]">
      <GameLobby onSelectGame={handleSelectGame} />

      {selectedGame && (
        <OpponentSelector
          isOpen={showOpponentSelector}
          onClose={() => {
            setShowOpponentSelector(false);
            setSelectedGame(null);
          }}
          selectedGame={selectedGame}
          onSelectOpponent={handleSelectOpponent}
        />
      )}

      {renderCurrentGame()}
    </div>
  );
};

export default MinigamesPage;
