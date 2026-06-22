import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Lock, Unlock, Star, Pin } from 'lucide-react';
import {
  ClueCard,
  PixelPanel,
  PixelButton,
  PixelBadge,
  CorkBoard,
} from '../components';
import { useStoryStore, useClues, useStories, useStoryProgressState } from '../store/useStoryStore';

const rarityNames: Record<string, string> = {
  all: '全部',
  common: '普通',
  uncommon: '稀有',
  rare: '珍贵',
  epic: '史诗',
  legendary: '传说',
};

const categoryNames: Record<string, string> = {
  all: '全部',
  guest: '客人',
  hotel: '酒店',
  history: '历史',
  secret: '秘密',
  item: '物品',
  document: '文件',
  testimony: '证词',
  observation: '观察',
  memory: '记忆',
};

type ViewMode = 'list' | 'corkboard';

const StoryPage: React.FC = () => {
  const clues = useClues();
  const stories = useStories();
  const storyProgress = useStoryProgressState();
  const discoverClue = useStoryStore((state) => state.discoverClue);
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDiscoveredOnly, setShowDiscoveredOnly] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const rarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  const categories = ['all', 'guest', 'hotel', 'history', 'secret', 'item', 'document', 'testimony', 'observation', 'memory'];

  const filteredClues = clues.filter(clue => {
    if (showDiscoveredOnly && !clue.discovered) return false;
    if (selectedRarity !== 'all' && clue.rarity !== selectedRarity) return false;
    if (selectedCategory !== 'all' && clue.category !== selectedCategory) return false;
    return true;
  });

  const discoveredClues = clues.filter(c => c.discovered);
  const unlockedStories = stories.filter(s => s.unlocked);

  if (viewMode === 'corkboard') {
    return (
      <div className="absolute inset-0 flex flex-col">
        <motion.div
          className="flex items-center justify-between px-4 py-3 border-b-3 border-[var(--pixel-border)] bg-[var(--pixel-bg-dark)] flex-shrink-0"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <h2 className="pixel-font-display text-lg text-[var(--pixel-text-primary)]">
              软木板推理
            </h2>
            <PixelBadge variant="gold" size="sm">
              <span className="flex items-center gap-1">
                <BookOpen size={10} />
                {storyProgress.discoveredClues}/{storyProgress.totalClues}
              </span>
            </PixelBadge>
          </div>
          <div className="flex items-center gap-2">
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <span className="flex items-center gap-1">
                <Search size={12} />
                列表模式
              </span>
            </PixelButton>
          </div>
        </motion.div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <CorkBoard />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-1">
                故事档案
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                收集线索，解锁故事，揭开百年酒店的秘密
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PixelButton
                variant="warning"
                size="sm"
                onClick={() => setViewMode('corkboard')}
              >
                <span className="flex items-center gap-2">
                  <Pin size={12} />
                  软木板推理
                </span>
              </PixelButton>
              <PixelBadge variant="gold" size="lg">
                <span className="flex items-center gap-2">
                  <BookOpen size={14} />
                  进度: {storyProgress.discoveredClues}/{storyProgress.totalClues}
                </span>
              </PixelBadge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <Search size={24} className="text-[var(--pixel-gold)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  已发现线索
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-gold)]">
                  {discoveredClues.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-[var(--pixel-info)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  已解锁故事
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-info)]">
                  {unlockedStories.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Unlock size={24} className="text-[var(--pixel-success)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  揭露秘密
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-success)]">
                  {storyProgress.discoveredSecrets}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {unlockedStories.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <PixelPanel title="已解锁故事" variant="dark">
              <div className="space-y-3">
                {unlockedStories.map(story => (
                  <div
                    key={story.id}
                    className="bg-[var(--pixel-bg-dark)] px-4 py-3 border-2 border-[var(--pixel-border)]"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <BookOpen size={18} className="text-[var(--pixel-info)] mt-0.5" />
                      <div className="flex-1">
                        <h4 className="pixel-font-display text-sm text-[var(--pixel-text-primary)] mb-1">
                          {story.title}
                        </h4>
                        <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                          {story.description}
                        </p>
                        <div className="pixel-panel pixel-panel-light p-3">
                          <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)] italic">
                            "{story.content}"
                          </p>
                        </div>
                      </div>
                    </div>
                    {story.clueIds && story.clueIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mr-2">
                          相关线索:
                        </span>
                        {story.clueIds.map(id => {
                          const clue = clues.find(c => c.id === id);
                          return (
                            <PixelBadge key={id} variant="info" size="sm">
                              {clue?.title || id}
                            </PixelBadge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PixelPanel>
          </motion.div>
        )}

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="pixel-font-display text-lg text-[var(--pixel-text-primary)]">
              线索收集
            </h3>
            <PixelButton
              variant={showDiscoveredOnly ? 'primary' : 'default'}
              size="sm"
              onClick={() => setShowDiscoveredOnly(!showDiscoveredOnly)}
            >
              {showDiscoveredOnly ? (
                <span className="flex items-center gap-2">
                  <Unlock size={12} />
                  只显示已发现
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock size={12} />
                  显示全部
                </span>
              )}
            </PixelButton>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] py-2">
                稀有度:
              </span>
              {rarities.map(rarity => (
                <PixelButton
                  key={rarity}
                  variant={selectedRarity === rarity ? 'primary' : 'default'}
                  onClick={() => setSelectedRarity(rarity)}
                  size="sm"
                >
                  {rarityNames[rarity]}
                </PixelButton>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] py-2">
                分类:
              </span>
              {categories.map(cat => (
                <PixelButton
                  key={cat}
                  variant={selectedCategory === cat ? 'success' : 'default'}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                >
                  {cat === 'all' ? '全部' : categoryNames[cat]}
                </PixelButton>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredClues.map((clue, index) => (
            <motion.div
              key={clue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
            >
              <ClueCard clue={clue} />
            </motion.div>
          ))}
        </motion.div>

        {filteredClues.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
              没有符合条件的线索
            </p>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
              尝试调整筛选条件或继续探索游戏
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;
