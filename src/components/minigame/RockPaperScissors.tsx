import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton, PixelPanel, PixelWindow } from '../ui';
import { RPS_CHOICES } from '../../data/minigames';
import {
  useMinigameOpponent,
  useMinigameScores,
  useMinigameRewards,
  useMinigameStatus,
  useMinigameActions,
} from '../../store/useMinigameStore';

interface RockPaperScissorsProps {
  isOpen: boolean;
  onClose: () => void;
}

type Choice = typeof RPS_CHOICES[number];
type RoundResult = 'win' | 'lose' | 'draw';

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ isOpen, onClose }) => {
  const opponent = useMinigameOpponent();
  const { playerScore, opponentScore } = useMinigameScores();
  const rewards = useMinigameRewards();
  const status = useMinigameStatus();
  const { endGame, updateScores, updateGameData, closeGame } = useMinigameActions();

  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rounds, setRounds] = useState<{ player: Choice; opponent: Choice; result: RoundResult }[]>([]);

  useEffect(() => {
    if (status === 'won' || status === 'lost' || status === 'draw') {
      setShowResult(true);
    }
  }, [status]);

  const determineWinner = (player: Choice, opponent: Choice): RoundResult => {
    if (player.id === opponent.id) return 'draw';
    if (player.beats === opponent.id) return 'win';
    return 'lose';
  };

  const getAIChoice = (): Choice => {
    const skillModifier = opponent?.skill || 50;
    const random = Math.random() * 100;

    if (random < skillModifier * 0.3 && rounds.length > 0) {
      const lastPlayerChoice = rounds[rounds.length - 1].player;
      const counter = RPS_CHOICES.find(c => c.beats === lastPlayerChoice.id);
      if (counter) return counter;
    }

    return RPS_CHOICES[Math.floor(Math.random() * RPS_CHOICES.length)];
  };

  const handleChoice = (choice: Choice) => {
    if (isAnimating || status !== 'playing') return;

    setIsAnimating(true);
    setPlayerChoice(choice);

    setTimeout(() => {
      const aiChoice = getAIChoice();
      setOpponentChoice(aiChoice);

      const result = determineWinner(choice, aiChoice);
      setRoundResult(result);

      setRounds(prev => [...prev, { player: choice, opponent: aiChoice, result }]);

      let newPlayerScore = playerScore;
      let newOpponentScore = opponentScore;

      if (result === 'win') {
        newPlayerScore++;
      } else if (result === 'lose') {
        newOpponentScore++;
      }

      updateScores(newPlayerScore, newOpponentScore);
      updateGameData({ rounds: [...rounds, { player: choice, opponent: aiChoice, result }] });

      setTimeout(() => {
        if (newPlayerScore >= 2 || newOpponentScore >= 2) {
          if (newPlayerScore > newOpponentScore) {
            endGame('won');
          } else if (newOpponentScore > newPlayerScore) {
            endGame('lost');
          } else {
            endGame('draw');
          }
        } else {
          setCurrentRound(prev => prev + 1);
          setPlayerChoice(null);
          setOpponentChoice(null);
          setRoundResult(null);
          setIsAnimating(false);
        }
      }, 1500);
    }, 1000);
  };

  const handleClose = () => {
    closeGame();
    onClose();
  };

  const getResultEmoji = (result: RoundResult | null) => {
    if (result === 'win') return '🎉';
    if (result === 'lose') return '😢';
    if (result === 'draw') return '🤝';
    return '';
  };

  const getResultText = (result: RoundResult | null) => {
    if (result === 'win') return '你赢了这一轮！';
    if (result === 'lose') return '你输了这一轮！';
    if (result === 'draw') return '平局！';
    return '';
  };

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={handleClose}
      title="✊✌️🖐️ 猜拳对决"
      width="600px"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-4xl mb-1">🧑</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">你</p>
            <p className="pixel-font-display text-2xl text-[var(--pixel-info)]">{playerScore}</p>
          </div>
          <div className="text-center">
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">第 {currentRound} 轮</p>
            <p className="pixel-font-display text-lg text-[var(--pixel-gold)]">三局两胜</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-1">{opponent?.avatar}</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">{opponent?.name}</p>
            <p className="pixel-font-display text-2xl text-[var(--pixel-danger)]">{opponentScore}</p>
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
              <PixelPanel variant="dark" className="mb-4 min-h-[120px] flex items-center justify-center">
                {isAnimating ? (
                  <div className="flex items-center justify-center gap-8">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.3 }}
                      className="text-6xl"
                    >
                      {playerChoice?.icon || '✊'}
                    </motion.div>
                    <span className="pixel-font-display text-2xl">VS</span>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.3, delay: 0.15 }}
                      className="text-6xl"
                    >
                      {opponentChoice?.icon || '✊'}
                    </motion.div>
                  </div>
                ) : roundResult ? (
                  <div className="text-center">
                    <div className="text-6xl mb-2">{getResultEmoji(roundResult)}</div>
                    <p className="pixel-font-display text-xl">{getResultText(roundResult)}</p>
                    <div className="flex justify-center gap-8 mt-2">
                      <span className="text-4xl">{playerChoice?.icon}</span>
                      <span className="text-4xl">{opponentChoice?.icon}</span>
                    </div>
                  </div>
                ) : (
                  <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                    选择你的出招
                  </p>
                )}
              </PixelPanel>

              {!isAnimating && !roundResult && (
                <div className="flex justify-center gap-4">
                  {RPS_CHOICES.map((choice) => (
                    <PixelButton
                      key={choice.id}
                      variant="primary"
                      size="lg"
                      onClick={() => handleChoice(choice)}
                      className="!px-6 !py-4"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-1">{choice.icon}</div>
                        <span className="pixel-font-mono text-xs">{choice.name}</span>
                      </div>
                    </PixelButton>
                  ))}
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
                <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)] mb-4">
                  最终比分 {playerScore} : {opponentScore}
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

        {rounds.length > 0 && status === 'playing' && (
          <div className="mt-4">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">对战记录</p>
            <div className="flex gap-2 justify-center">
              {rounds.map((round, idx) => (
                <div
                  key={idx}
                  className={`pixel-card px-3 py-1 text-sm ${
                    round.result === 'win'
                      ? 'bg-[var(--pixel-success)]/20'
                      : round.result === 'lose'
                      ? 'bg-[var(--pixel-danger)]/20'
                      : 'bg-[var(--pixel-info)]/20'
                  }`}
                >
                  {round.player.icon} vs {round.opponent.icon}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PixelWindow>
  );
};

export default RockPaperScissors;
