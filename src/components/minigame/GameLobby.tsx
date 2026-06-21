import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PixelButton, PixelPanel, PixelBadge } from '../ui';
import { MINIGAME_DEFINITIONS } from '../../data/minigames';
import type { MinigameType } from '../../types/minigame';
import { useMinigameStats } from '../../store/useMinigameStore';
import { useCurrentPhase } from '../../store/useGameStore';

interface GameLobbyProps {
  onSelectGame: (gameType: MinigameType) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onSelectGame }) => {
  const currentPhase = useCurrentPhase();
  const stats = useMinigameStats();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'arcade' | 'table'>('all');

  const games = Object.values(MINIGAME_DEFINITIONS);
  const filteredGames = selectedCategory === 'all'
    ? games
    : games.filter((g) => g.type === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-[var(--pixel-success)]';
      case 'medium':
        return 'bg-[var(--pixel-warning)]';
      case 'hard':
        return 'bg-[var(--pixel-danger)]';
      default:
        return 'bg-[var(--pixel-info)]';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  const isGameAvailable = (game: typeof MINIGAME_DEFINITIONS[MinigameType]) => {
    return game.availablePhases.includes(currentPhase as 'morning' | 'afternoon' | 'evening');
  };

  const totalGames = stats.totalWins + stats.totalLosses + stats.totalDraws;
  const winRate = totalGames > 0 ? Math.round((stats.totalWins / totalGames) * 100) : 0;
  const netProfit = stats.totalMoneyWon - stats.totalMoneyLost;

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-2">
            🎮 游戏大厅
          </h2>
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
            在空闲时与客人或员工对战，赢取奖励或提升好感
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          <PixelPanel variant="dark" className="text-center">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">总场次</p>
            <p className="pixel-font-display text-2xl text-[var(--pixel-info)]">{totalGames}</p>
          </PixelPanel>
          <PixelPanel variant="dark" className="text-center">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">胜率</p>
            <p className="pixel-font-display text-2xl text-[var(--pixel-success)]">{winRate}%</p>
          </PixelPanel>
          <PixelPanel variant="dark" className="text-center">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">总奖金</p>
            <p className="pixel-font-display text-2xl text-[var(--pixel-gold)]">¥{stats.totalMoneyWon.toLocaleString()}</p>
          </PixelPanel>
          <PixelPanel variant="dark" className="text-center">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">净利润</p>
            <p className={`pixel-font-display text-2xl ${netProfit >= 0 ? 'text-[var(--pixel-success)]' : 'text-[var(--pixel-danger)]'}`}>
              {netProfit >= 0 ? '+' : ''}¥{netProfit.toLocaleString()}
            </p>
          </PixelPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-6"
        >
          <PixelButton
            variant={selectedCategory === 'all' ? 'primary' : 'default'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            全部
          </PixelButton>
          <PixelButton
            variant={selectedCategory === 'arcade' ? 'primary' : 'default'}
            size="sm"
            onClick={() => setSelectedCategory('arcade')}
          >
            🕹️ 街机游戏
          </PixelButton>
          <PixelButton
            variant={selectedCategory === 'table' ? 'primary' : 'default'}
            size="sm"
            onClick={() => setSelectedCategory('table')}
          >
            🎲 桌面游戏
          </PixelButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {filteredGames.map((game, index) => {
            const available = isGameAvailable(game);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.1 }}
              >
                <PixelPanel
                  variant="dark"
                  className={`h-full transition-all ${!available ? 'opacity-50' : 'hover:border-[var(--pixel-primary)]'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{game.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="pixel-font-display text-lg text-[var(--pixel-text-primary)]">
                          {game.name}
                        </h3>
                        <PixelBadge
                          variant={game.type === 'arcade' ? 'info' : 'warning'}
                          size="sm"
                        >
                          {game.type === 'arcade' ? '街机' : '桌面'}
                        </PixelBadge>
                        <PixelBadge
                          className={`${getDifficultyColor(game.difficulty)} !text-white`}
                          size="sm"
                        >
                          {getDifficultyText(game.difficulty)}
                        </PixelBadge>
                      </div>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-3">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                          赌注: ¥{game.minBet} - ¥{game.maxBet}
                        </span>
                        <span className="pixel-font-mono text-xs text-[var(--pixel-gold)]">
                          赔率: x{game.baseReward.money}
                        </span>
                        <span className="pixel-font-mono text-xs text-[var(--pixel-success)]">
                          好感: +{game.affinityGain}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                            可用时段:
                          </span>
                          {game.availablePhases.map((phase) => (
                            <span
                              key={phase}
                              className={`pixel-font-mono text-xs px-1.5 py-0.5 rounded ${
                                phase === currentPhase
                                  ? 'bg-[var(--pixel-primary)] text-white'
                                  : 'bg-[var(--pixel-bg-dark)] text-[var(--pixel-text-secondary)]'
                              }`}
                            >
                              {phase === 'morning' ? '早' : phase === 'afternoon' ? '中' : '晚'}
                            </span>
                          ))}
                        </div>
                        <PixelButton
                          variant="primary"
                          size="sm"
                          onClick={() => onSelectGame(game.id)}
                          disabled={!available}
                        >
                          {available ? '选择游戏' : '当前不可用'}
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </PixelPanel>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
              该分类下暂无游戏
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
