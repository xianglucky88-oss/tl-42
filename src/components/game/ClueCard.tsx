import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, Unlock, Eye, Calendar, MapPin, Star } from 'lucide-react';
import { Clue } from '../../types/story';
import { PixelButton, PixelBadge, PixelPanel, PixelWindow } from '../ui';
import { useStoryStore } from '../../store/useStoryStore';

interface ClueCardProps {
  clue: Clue;
  className?: string;
}

const rarityColors: Record<string, string> = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

const rarityNames: Record<string, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍贵',
  epic: '史诗',
  legendary: '传说',
};

const categoryNames: Record<string, string> = {
  item: '物品',
  document: '文件',
  testimony: '证词',
  observation: '观察',
  memory: '记忆',
};

const ClueCard: React.FC<ClueCardProps> = ({ clue, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { markClueRead } = useStoryStore();

  const handleView = () => {
    if (clue.discovered) {
      markClueRead(clue.id);
      setShowDetails(true);
    }
  };

  return (
    <>
      <motion.div
        className={`pixel-card relative cursor-pointer ${className} ${!clue.discovered ? 'opacity-50' : ''}`}
        whileHover={clue.discovered ? { y: -2, scale: 1.02 } : undefined}
        onClick={handleView}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {clue.isNew && clue.discovered && (
          <motion.div
            className="absolute -top-1 -right-1 z-10"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <PixelBadge variant="danger" size="sm">
              新
            </PixelBadge>
          </motion.div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 border-[var(--pixel-border)] ${
                clue.discovered ? 'bg-[var(--pixel-bg-light)]' : 'bg-[var(--pixel-bg-dark)]'
              }`}
            >
              {clue.discovered ? (
                <Unlock size={20} className={rarityColors[clue.rarity]} />
              ) : (
                <Lock size={20} className="text-[var(--pixel-text-secondary)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`pixel-font-display text-sm truncate ${
                    clue.discovered ? 'text-[var(--pixel-text-primary)]' : 'text-[var(--pixel-text-secondary)]'
                  }`}
                >
                  {clue.discovered ? clue.title : '??? 未发现'}
                </h4>
                <PixelBadge
                  variant={clue.discovered ? 'default' : 'warning'}
                  size="sm"
                >
                  {categoryNames[clue.category] || clue.category}
                </PixelBadge>
              </div>
              <p
                className={`pixel-font-mono text-xs ${
                  clue.discovered ? rarityColors[clue.rarity] : 'text-[var(--pixel-text-secondary)]'
                }`}
              >
                {clue.discovered ? rarityNames[clue.rarity] : '继续探索以解锁'}
              </p>
            </div>
          </div>

          {clue.discovered && (
            <>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-3 line-clamp-2">
                {clue.description}
              </p>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-[var(--pixel-text-secondary)]" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      {clue.year || '?'}年
                    </span>
                  </div>
                  {clue.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-[var(--pixel-text-secondary)]" />
                      <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        {clue.location}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < clue.importance ? 'text-[var(--pixel-gold)] fill-[var(--pixel-gold)]' : 'text-[var(--pixel-border)]'}
                    />
                  ))}
                </div>
              </div>

              {clue.relatedGuestIds && clue.relatedGuestIds.length > 0 && (
                <div className="mt-3 pt-3 border-t-2 border-[var(--pixel-border)]">
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">
                    相关人物:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {clue.relatedGuestIds.map(id => (
                      <PixelBadge key={id} variant="info" size="sm">
                        {id}
                      </PixelBadge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!clue.discovered && (
            <div className="mt-3 pt-3 border-t-2 border-[var(--pixel-border)]">
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] text-center">
                🔒 满足条件后解锁
              </p>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] text-center mt-1">
                {clue.unlockCondition || '需要更多线索'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <PixelWindow
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={clue.title}
        width="500px"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 flex items-center justify-center border-2 border-[var(--pixel-border)]`}
              style={{ backgroundColor: `var(--pixel-bg-light)` }}
            >
              <Search size={32} className={rarityColors[clue.rarity]} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="pixel-font-display text-lg text-[var(--pixel-text-primary)]">
                  {clue.title}
                </h3>
                <PixelBadge variant="default" size="sm">
                  {rarityNames[clue.rarity]}
                </PixelBadge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-[var(--pixel-text-secondary)]" />
                  <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                    {clue.year || '?'}年
                  </span>
                </div>
                {clue.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-[var(--pixel-text-secondary)]" />
                    <span className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                      {clue.location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < clue.importance ? 'text-[var(--pixel-gold)] fill-[var(--pixel-gold)]' : 'text-[var(--pixel-border)]'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PixelPanel variant="dark" animate={false}>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
              线索描述
            </p>
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
              {clue.description}
            </p>
          </PixelPanel>

          {clue.storyContent && (
            <PixelPanel variant="light" animate={false}>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                详细内容
              </p>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] italic">
                "{clue.storyContent}"
              </p>
            </PixelPanel>
          )}

          {clue.relatedClueIds && clue.relatedClueIds.length > 0 && (
            <PixelPanel variant="dark" animate={false}>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                相关线索
              </p>
              <div className="flex flex-wrap gap-2">
                {clue.relatedClueIds.map(id => (
                  <PixelBadge key={id} variant="info" size="sm">
                    {id}
                  </PixelBadge>
                ))}
              </div>
            </PixelPanel>
          )}

          <PixelButton
            variant="primary"
            className="w-full"
            onClick={() => setShowDetails(false)}
          >
            关闭
          </PixelButton>
        </div>
      </PixelWindow>
    </>
  );
};

export default ClueCard;
