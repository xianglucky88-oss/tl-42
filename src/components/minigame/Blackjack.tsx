import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton, PixelPanel, PixelWindow } from '../ui';
import { CARD_SUITS, CARD_RANKS, calculateHandValue } from '../../data/minigames';
import {
  useMinigameOpponent,
  useMinigameRewards,
  useMinigameStatus,
  useMinigameActions,
} from '../../store/useMinigameStore';

interface BlackjackProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Card {
  rank: string;
  suit: string;
  faceUp: boolean;
}

type GamePhase = 'betting' | 'dealing' | 'player_turn' | 'dealer_turn' | 'result';

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (let i = 0; i < 6; i++) {
    for (const suit of CARD_SUITS) {
      for (const rank of CARD_RANKS) {
        deck.push({ rank, suit, faceUp: true });
      }
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

const Blackjack: React.FC<BlackjackProps> = ({ isOpen, onClose }) => {
  const opponent = useMinigameOpponent();
  const rewards = useMinigameRewards();
  const status = useMinigameStatus();
  const { endGame, closeGame } = useMinigameActions();

  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>('dealing');
  const [showResult, setShowResult] = useState(false);
  const [message, setMessage] = useState('');
  const [isDealing, setIsDealing] = useState(false);

  const finishGame = useCallback((result: 'win' | 'lose' | 'draw') => {
    if (result === 'win') {
      endGame('won');
    } else if (result === 'lose') {
      endGame('lost');
    } else {
      endGame('draw');
    }
  }, [endGame]);

  const initializeGame = useCallback(() => {
    const dealInitialCardsLocal = (currentDeck: Card[]) => {
      const newDeck = [...currentDeck];
      const newPlayerHand: Card[] = [];
      const newDealerHand: Card[] = [];

      for (let i = 0; i < 2; i++) {
        newPlayerHand.push(newDeck.pop()!);
        const dealerCard = newDeck.pop()!;
        if (i === 1) dealerCard.faceUp = false;
        newDealerHand.push(dealerCard);
      }

      setDeck(newDeck);
      setPlayerHand(newPlayerHand);
      setDealerHand(newDealerHand);
      setIsDealing(false);

      const playerValue = calculateHandValue(newPlayerHand);
      const dealerVisibleValue = calculateHandValue(newDealerHand.filter(c => c.faceUp));

      if (playerValue === 21) {
        setMessage('Blackjack! 🎉');
        setTimeout(() => finishGame('win'), 1500);
      } else if (dealerVisibleValue === 21 && newDealerHand.filter(c => !c.faceUp).length > 0) {
        const hiddenCard = { ...newDealerHand.find(c => !c.faceUp)! };
        hiddenCard.faceUp = true;
        const fullDealerHand = newDealerHand.map(c => ({ ...c, faceUp: true }));
        setDealerHand(fullDealerHand);
        
        if (calculateHandValue(fullDealerHand) === 21) {
          setMessage('双方都是 Blackjack！平局！');
          setTimeout(() => finishGame('draw'), 1500);
        } else {
          setMessage('Blackjack! 🎉');
          setTimeout(() => finishGame('win'), 1500);
        }
      } else {
        setGamePhase('player_turn');
        setMessage('请选择：要牌 或 停牌');
      }
    };

    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGamePhase('dealing');
    setMessage('');
    setIsDealing(true);

    setTimeout(() => {
      dealInitialCardsLocal(newDeck);
    }, 500);
  }, [finishGame]);

  useEffect(() => {
    if (isOpen && status === 'playing') {
      initializeGame();
    }
  }, [isOpen, status, initializeGame]);

  useEffect(() => {
    if (status === 'won' || status === 'lost' || status === 'draw') {
      setShowResult(true);
    }
  }, [status]);

  const hit = () => {
    if (gamePhase !== 'player_turn' || isDealing) return;

    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newPlayerHand = [...playerHand, newCard];
    const playerValue = calculateHandValue(newPlayerHand);

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);

    if (playerValue > 21) {
      setMessage('爆牌了！');
      setTimeout(() => finishGame('lose'), 1500);
    } else if (playerValue === 21) {
      setMessage('21点！');
      setTimeout(() => stand(), 1000);
    }
  };

  const stand = () => {
    if (gamePhase !== 'player_turn') return;
    setGamePhase('dealer_turn');
    setMessage('对手回合...');

    const fullDealerHand = dealerHand.map(c => ({ ...c, faceUp: true }));
    setDealerHand(fullDealerHand);

    setTimeout(() => playDealerTurn(deck, fullDealerHand, playerHand), 1000);
  };

  const playDealerTurn = (currentDeck: Card[], currentDealerHand: Card[], currentPlayerHand: Card[]) => {
    const dealerValue = calculateHandValue(currentDealerHand);
    const playerValue = calculateHandValue(currentPlayerHand);
    const skillModifier = opponent?.skill || 50;

    if (dealerValue > 21) {
      setMessage('对手爆牌！你赢了！');
      setTimeout(() => finishGame('win'), 1500);
    } else if (dealerValue >= 17 || (dealerValue >= 15 && Math.random() * 100 > skillModifier)) {
      if (dealerValue > playerValue) {
        setMessage('对手点数更高...');
        setTimeout(() => finishGame('lose'), 1500);
      } else if (dealerValue < playerValue) {
        setMessage('你的点数更高！你赢了！');
        setTimeout(() => finishGame('win'), 1500);
      } else {
        setMessage('平局！');
        setTimeout(() => finishGame('draw'), 1500);
      }
    } else {
      const newDeck = [...currentDeck];
      const newCard = newDeck.pop()!;
      const newDealerHand = [...currentDealerHand, newCard];

      setDeck(newDeck);
      setDealerHand(newDealerHand);

      setTimeout(() => playDealerTurn(newDeck, newDealerHand, currentPlayerHand), 800);
    }
  };

  const handleClose = () => {
    closeGame();
    onClose();
  };

  const renderCard = (card: Card, index: number) => (
    <motion.div
      key={`${card.rank}-${card.suit}-${index}`}
      initial={{ y: -100, opacity: 0, rotate: -10 }}
      animate={{ y: 0, opacity: 1, rotate: index * 3 - 3 }}
      transition={{ delay: index * 0.15, type: 'spring' }}
      className="relative"
    >
      <div
        className={`w-16 h-24 pixel-card flex flex-col items-center justify-center ${
          card.faceUp ? 'bg-white' : 'bg-[var(--pixel-primary)]'
        }`}
        style={{
          color: card.suit === '♥️' || card.suit === '♦️' ? '#ef4444' : '#1f2937',
        }}
      >
        {card.faceUp ? (
          <>
            <span className="text-lg font-bold">{card.rank}</span>
            <span className="text-2xl">{card.suit}</span>
          </>
        ) : (
          <div className="w-12 h-20 border-2 border-dashed border-[var(--pixel-bg-dark)] rounded" />
        )}
      </div>
    </motion.div>
  );

  const playerValue = calculateHandValue(playerHand);
  const dealerVisibleValue = calculateHandValue(dealerHand.filter(c => c.faceUp));
  const dealerFullValue = calculateHandValue(dealerHand);

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={handleClose}
      title="🃏 21点扑克"
      width="700px"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{opponent?.avatar}</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">{opponent?.name}</p>
          </div>
          <div className="text-center">
            <p className="pixel-font-mono text-sm text-[var(--pixel-gold)]">{message}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🧑</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">你</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'playing' && !showResult && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PixelPanel variant="dark" className="mb-4">
                <div className="mb-4">
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                    对手手牌 ({gamePhase === 'dealer_turn' || gamePhase === 'result' ? dealerFullValue : dealerVisibleValue})
                  </p>
                  <div className="flex justify-center gap-1 min-h-[100px] items-center">
                    {dealerHand.map((card, idx) => renderCard(card, idx))}
                  </div>
                </div>

                <div className="border-t border-[var(--pixel-border)] my-4" />

                <div>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                    你的手牌 ({playerValue})
                  </p>
                  <div className="flex justify-center gap-1 min-h-[100px] items-center">
                    {playerHand.map((card, idx) => renderCard(card, idx))}
                  </div>
                </div>
              </PixelPanel>

              {gamePhase === 'player_turn' && !isDealing && (
                <div className="flex justify-center gap-4">
                  <PixelButton variant="primary" size="lg" onClick={hit} disabled={playerValue >= 21}>
                    要牌 (Hit)
                  </PixelButton>
                  <PixelButton variant="info" size="lg" onClick={stand}>
                    停牌 (Stand)
                  </PixelButton>
                </div>
              )}

              {(gamePhase === 'dealing' || isDealing) && (
                <div className="text-center">
                  <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">发牌中...</p>
                </div>
              )}
            </motion.div>
          )}

          {showResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <PixelPanel variant="dark" className="mb-4">
                <div className="text-6xl mb-4">
                  {status === 'won' ? '🏆' : status === 'lost' ? '💔' : '🤝'}
                </div>
                <h3 className="pixel-font-display text-2xl mb-2">
                  {status === 'won' ? '恭喜获胜！' : status === 'lost' ? '惜败...' : '平局！'}
                </h3>
                <div className="flex justify-center gap-8 mb-4">
                  <div>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">对手</p>
                    <p className="pixel-font-display text-2xl">{dealerFullValue}</p>
                  </div>
                  <div>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">你</p>
                    <p className="pixel-font-display text-2xl">{playerValue}</p>
                  </div>
                </div>

                {rewards && (
                  <div className="pixel-card p-3 inline-block">
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">获得奖励</p>
                    <div className="flex gap-4 justify-center">
                      {rewards.money && rewards.money > 0 && (
                        <span className="pixel-font-mono text-sm text-[var(--pixel-gold)]">
                          💰 +¥{rewards.money}
                        </span>
                      )}
                      {rewards.reputation && rewards.reputation > 0 && (
                        <span className="pixel-font-mono text-sm text-[var(--pixel-info)]">
                          ⭐ +{rewards.reputation}
                        </span>
                      )}
                      {rewards.affinity && rewards.affinity > 0 && (
                        <span className="pixel-font-mono text-sm text-[var(--pixel-success)]">
                          ❤️ +{rewards.affinity}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </PixelPanel>

              <PixelButton variant="primary" onClick={handleClose}>
                返回大厅
              </PixelButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PixelWindow>
  );
};

export default Blackjack;
