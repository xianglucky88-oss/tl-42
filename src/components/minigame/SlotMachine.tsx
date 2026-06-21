import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton, PixelPanel, PixelWindow } from '../ui';
import { SLOT_SYMBOLS } from '../../data/minigames';
import {
  useMinigameOpponent,
  useMinigameRewards,
  useMinigameStatus,
  useMinigameActions,
} from '../../store/useMinigameStore';

interface SlotMachineProps {
  isOpen: boolean;
  onClose: () => void;
}

type SymbolType = typeof SLOT_SYMBOLS[number];

const SlotMachine: React.FC<SlotMachineProps> = ({ isOpen, onClose }) => {
  const opponent = useMinigameOpponent();
  const rewards = useMinigameRewards();
  const status = useMinigameStatus();
  const { endGame, closeGame } = useMinigameActions();

  const [reels, setReels] = useState<SymbolType[][]>([
    [SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]],
    [SLOT_SYMBOLS[3], SLOT_SYMBOLS[4], SLOT_SYMBOLS[5]],
    [SLOT_SYMBOLS[6], SLOT_SYMBOLS[7], SLOT_SYMBOLS[0]],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [message, setMessage] = useState('拉动拉杆，试试你的运气！');
  
  const spinIntervals = useRef<(number | null)[]>([null, null, null]);

  useEffect(() => {
    if (status === 'won' || status === 'lost' || status === 'draw') {
      setShowResult(true);
    }
  }, [status]);

  const getRandomSymbol = (): SymbolType => {
    const skillModifier = opponent?.skill || 50;
    const random = Math.random() * 100;
    
    if (random < (100 - skillModifier) * 0.1) {
      return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
    }
    
    return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
  };

  const spinReel = (reelIndex: number, stopDelay: number): Promise<SymbolType> => {
    return new Promise((resolve) => {
      const interval = window.setInterval(() => {
        setReels((prev) => {
          const newReels = [...prev];
          const newSymbols = [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol(),
          ];
          newReels[reelIndex] = newSymbols;
          return newReels;
        });
      }, 80);

      spinIntervals.current[reelIndex] = interval;

      setTimeout(() => {
        if (spinIntervals.current[reelIndex]) {
          clearInterval(spinIntervals.current[reelIndex]!);
          spinIntervals.current[reelIndex] = null;
          
          setReels((prev) => {
            const newReels = [...prev];
            const finalSymbol = getRandomSymbol();
            newReels[reelIndex] = [finalSymbol, finalSymbol, finalSymbol];
            resolve(finalSymbol);
            return newReels;
          });
        }
      }, stopDelay);
    });
  };

  const calculateWin = (symbols: SymbolType[]): number => {
    if (symbols[0].symbol === symbols[1].symbol && symbols[1].symbol === symbols[2].symbol) {
      return symbols[0].multiplier;
    } else if (symbols[0].symbol === symbols[1].symbol || symbols[1].symbol === symbols[2].symbol || symbols[0].symbol === symbols[2].symbol) {
      return 1;
    }
    return 0;
  };

  const spin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinAmount(0);
    setMessage('转动中...');
    setSpinCount((prev) => prev + 1);

    try {
      const results = await Promise.all([
        spinReel(0, 1500),
        spinReel(1, 2500),
        spinReel(2, 3500),
      ]);

      const multiplier = calculateWin(results);
      const bet = 5;
      
      if (multiplier > 0) {
        const win = bet * multiplier;
        setWinAmount(win);
        setMessage(`🎉 恭喜！获得 ${multiplier}x 倍数！赢得 ¥${win}`);
        
        setTimeout(() => {
          endGame('won');
        }, 2000);
      } else {
        setMessage('😢 很遗憾，没有中奖...');
        
        setTimeout(() => {
          endGame('lost');
        }, 2000);
      }
    } catch (error) {
      console.error('Spin error:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  const handleClose = () => {
    spinIntervals.current.forEach((interval) => {
      if (interval) clearInterval(interval);
    });
    closeGame();
    onClose();
  };

  useEffect(() => {
    const intervals = spinIntervals.current;
    return () => {
      intervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const finalSymbols = reels.map((reel) => reel[1]);

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={handleClose}
      title="🎰 幸运老虎机"
      width="600px"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{opponent?.avatar}</div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">{opponent?.name}</p>
          </div>
          <div className="text-center">
            <p className="pixel-font-mono text-sm text-[var(--pixel-gold)]">{message}</p>
            {winAmount > 0 && (
              <p className="pixel-font-display text-xl text-[var(--pixel-success)]">
                +¥{winAmount}
              </p>
            )}
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
              <PixelPanel variant="dark" className="mb-4 p-6">
                <div className="flex justify-center gap-3 mb-4">
                  {reels.map((reel, reelIndex) => (
                    <div
                      key={reelIndex}
                      className="w-24 h-32 pixel-card bg-[var(--pixel-bg-dark)] flex flex-col items-center justify-center overflow-hidden relative"
                    >
                      {reel.map((symbol, symbolIndex) => (
                        <motion.div
                          key={`${reelIndex}-${symbolIndex}`}
                          className="text-5xl my-1"
                          animate={isSpinning && spinIntervals.current[reelIndex] ? { y: [-5, 5] } : {}}
                          transition={{
                            repeat: isSpinning && spinIntervals.current[reelIndex] ? Infinity : 0,
                            duration: 0.1,
                          }}
                        >
                          {symbol.symbol}
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-4">
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                    赔率表
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {SLOT_SYMBOLS.map((symbol, idx) => (
                      <div
                        key={idx}
                        className="pixel-card p-1 text-center bg-[var(--pixel-bg-dark)]"
                      >
                        <span className="text-lg">{symbol.symbol}</span>
                        <p className="pixel-font-mono text-[var(--pixel-gold)]">x{symbol.multiplier}</p>
                      </div>
                    ))}
                  </div>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-2">
                    三个相同符号获得对应赔率，两个相同获得 x1 赔率
                  </p>
                </div>

                <div className="flex justify-center">
                  <PixelButton
                    variant="primary"
                    size="lg"
                    onClick={spin}
                    disabled={isSpinning}
                    className="!px-8"
                  >
                    <span className="flex items-center gap-2">
                      🎰 拉动拉杆
                    </span>
                  </PixelButton>
                </div>
              </PixelPanel>

              <div className="text-center">
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  已游玩 {spinCount} 次
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
                
                <div className="flex justify-center gap-3 mb-4">
                  {finalSymbols.map((symbol, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-20 pixel-card bg-[var(--pixel-bg-dark)] flex items-center justify-center"
                    >
                      <span className="text-4xl">{symbol.symbol}</span>
                    </div>
                  ))}
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

export default SlotMachine;
