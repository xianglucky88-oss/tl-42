import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton, PixelPanel, PixelWindow } from '../ui';
import { MEMORY_CARD_ICONS } from '../../data/minigames';
import {
  useMinigameOpponent,
  useMinigameRewards,
  useMinigameStatus,
  useMinigameActions,
} from '../../store/useMinigameStore';

interface MemoryGameProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ isOpen, onClose }) => {
  const opponent = useMinigameOpponent();
  const rewards = useMinigameRewards();
  const status = useMinigameStatus();
  const { endGame, updateScores, closeGame } = useMinigameActions();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerMatches, setPlayerMatches] = useState(0);
  const [opponentMatches, setOpponentMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [message, setMessage] = useState('翻开卡牌找到配对！');
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeGame = useCallback(() => {
    const selectedIcons = MEMORY_CARD_ICONS.slice(0, 6);
    const cardPairs = [...selectedIcons, ...selectedIcons];
    
    const shuffledCards = cardPairs
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setPlayerMatches(0);
    setOpponentMatches(0);
    setMoves(0);
    setPlayerTurn(true);
    setIsProcessing(false);
    setMessage('你的回合，翻开两张卡牌！');
    updateScores(0, 0);
  }, [updateScores]);

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



  const handleCardClick = (cardId: number) => {
    if (
      isProcessing ||
      !playerTurn ||
      flippedCards.length >= 2 ||
      cards[cardId].isFlipped ||
      cards[cardId].isMatched ||
      status !== 'playing'
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      checkMatch(newFlippedCards);
    }
  };

  const checkMatch = (flipped: number[]) => {
    setIsProcessing(true);
    const [first, second] = flipped;
    const firstCard = cards[first];
    const secondCard = cards[second];

    setTimeout(() => {
      if (firstCard.icon === secondCard.icon) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        
        if (playerTurn) {
          const newPlayerMatches = playerMatches + 1;
          setPlayerMatches(newPlayerMatches);
          updateScores(newPlayerMatches, opponentMatches);
          setMessage('🎉 配对成功！继续你的回合！');
        } else {
          const newOpponentMatches = opponentMatches + 1;
          setOpponentMatches(newOpponentMatches);
          updateScores(playerMatches, newOpponentMatches);
          setMessage(`${opponent?.name} 配对成功！`);
        }

        if (newMatchedPairs >= 6) {
          setTimeout(() => {
            if (playerMatches > opponentMatches) {
              endGame('won');
            } else if (opponentMatches > playerMatches) {
              endGame('lost');
            } else {
              endGame('draw');
            }
          }, 1500);
        } else {
          setIsProcessing(false);
        }
      } else {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          )
        );
        
        setMessage(playerTurn ? '没有配对，轮到对手了...' : '对手没有配对，轮到你了！');
        setPlayerTurn((prev) => !prev);
      }
      
      setFlippedCards([]);
      
      if (!playerTurn && firstCard.icon !== secondCard.icon) {
        setTimeout(() => {
          setIsProcessing(false);
          opponentTurn();
        }, 1000);
      } else if (firstCard.icon !== secondCard.icon) {
        setIsProcessing(false);
      }
    }, 1000);
  };

  const opponentTurn = () => {
    if (status !== 'playing') return;
    
    setMessage(`${opponent?.name} 正在思考...`);
    const skillModifier = opponent?.skill || 50;
    const random = Math.random() * 100;
    
    setTimeout(() => {
      const unmatchedCards = cards.filter((c) => !c.isMatched && !c.isFlipped);
      
      if (unmatchedCards.length < 2) return;
      
      let firstCard: Card;
      let secondCard: Card;
      
      if (random < skillModifier * 0.4) {
        const unmatchedIcons = new Map<string, Card[]>();
        unmatchedCards.forEach((card) => {
          const existing = unmatchedIcons.get(card.icon) || [];
          existing.push(card);
          unmatchedIcons.set(card.icon, existing);
        });
        
        for (const [, cardList] of unmatchedIcons) {
          if (cardList.length >= 2) {
            firstCard = cardList[0];
            secondCard = cardList[1];
            break;
          }
        }
        
        firstCard = firstCard || unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const remainingCards = unmatchedCards.filter((c) => c.id !== firstCard.id);
        secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
      } else {
        firstCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const remainingCards = unmatchedCards.filter((c) => c.id !== firstCard.id);
        secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
      }
      
      const newFlippedCards = [firstCard.id, secondCard.id];
      setFlippedCards(newFlippedCards);
      
      setCards((prev) =>
        prev.map((card) =>
          newFlippedCards.includes(card.id) ? { ...card, isFlipped: true } : card
        )
      );
      
      setTimeout(() => {
        checkMatch(newFlippedCards);
      }, 1000);
    }, 1500);
  };

  const handleClose = () => {
    closeGame();
    onClose();
  };

  const renderCard = (card: Card) => (
    <motion.div
      key={card.id}
      whileHover={!card.isFlipped && !card.isMatched && playerTurn ? { scale: 1.05 } : {}}
      onClick={() => handleCardClick(card.id)}
      className={`w-16 h-20 pixel-card flex items-center justify-center cursor-pointer transition-all ${
        card.isMatched
          ? 'bg-[var(--pixel-success)]/30 cursor-default'
          : card.isFlipped
          ? 'bg-white'
          : 'bg-[var(--pixel-primary)] hover:bg-[var(--pixel-primary)]/80'
      }`}
    >
      <AnimatePresence mode="wait">
        {card.isFlipped || card.isMatched ? (
          <motion.span
            key="front"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            className="text-3xl"
          >
            {card.icon}
          </motion.span>
        ) : (
          <motion.span
            key="back"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            className="text-2xl text-[var(--pixel-bg-dark)]"
          >
            ?
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={handleClose}
      title="🃏🎴 记忆翻牌"
      width="650px"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{opponent?.avatar}</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">{opponent?.name}</p>
            <p className="pixel-font-display text-xl text-[var(--pixel-danger)]">{opponentMatches}</p>
          </div>
          <div className="text-center">
            <p className="pixel-font-mono text-sm text-[var(--pixel-gold)]">{message}</p>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
              步数: {moves} | 配对: {matchedPairs}/6
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-1">🧑</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">你</p>
            <p className="pixel-font-display text-xl text-[var(--pixel-info)]">{playerMatches}</p>
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
                <div className="grid grid-cols-4 gap-2 justify-items-center">
                  {cards.map((card) => renderCard(card))}
                </div>
              </PixelPanel>

              <div className="text-center">
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  {playerTurn ? '👉 你的回合' : `⏳ ${opponent?.name} 的回合`}
                </p>
              </div>
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
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">{opponent?.name}</p>
                    <p className="pixel-font-display text-2xl text-[var(--pixel-danger)]">{opponentMatches}</p>
                  </div>
                  <div className="text-4xl">:</div>
                  <div>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">你</p>
                    <p className="pixel-font-display text-2xl text-[var(--pixel-info)]">{playerMatches}</p>
                  </div>
                </div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-4">
                  总步数: {moves}
                </p>

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

export default MemoryGame;
