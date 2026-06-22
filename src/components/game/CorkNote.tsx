import React from 'react';
import { motion } from 'framer-motion';
import { Pin, X } from 'lucide-react';
import type { Clue } from '../../types/story';

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#60A5FA',
  epic: '#C084FC',
  legendary: '#FACC15',
};

const rarityNames: Record<string, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍贵',
  epic: '史诗',
  legendary: '传说',
};

interface CorkNoteProps {
  clue: Clue;
  isPinned: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  isMoveMode: boolean;
  zIndex: number;
  onDragStart: () => void;
  onDragEnd: (event: any, info: { offset: { x: number; y: number } }) => void;
  onClick: () => void;
  onRemove: () => void;
}

const CorkNote: React.FC<CorkNoteProps> = ({
  clue,
  isPinned,
  isConnecting,
  isConnected,
  isMoveMode,
  zIndex,
  onDragStart,
  onDragEnd,
  onClick,
  onRemove,
}) => {
  const noteVariant = clue.isKey ? 'key' : clue.rarity === 'legendary' ? 'legendary' : 'normal';

  return (
    <motion.div
      className={`corkboard-card corkboard-card--${noteVariant} ${isPinned ? 'corkboard-card-pinned' : ''} ${isConnecting ? 'corkboard-card-connecting' : ''} ${isConnected ? 'corkboard-card-linked' : ''}`}
      style={{
        zIndex: isConnecting ? 100 : zIndex,
      }}
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: clue.isKey ? -1 + Math.random() * 2 : -3 + Math.random() * 6,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      drag={isMoveMode}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      whileDrag={{ scale: 1.08, zIndex: 200 }}
    >
      {isPinned && (
        <div className="corkboard-pin">
          <Pin size={16} className="text-red-500 fill-red-500" />
        </div>
      )}

      {clue.isKey && !isPinned && (
        <div className="corkboard-pin corkboard-pin-key">
          <Pin size={12} className="text-[var(--pixel-gold)] fill-[var(--pixel-gold)]" />
        </div>
      )}

      <div className="corkboard-card-accent" style={{ backgroundColor: rarityColors[clue.rarity] }} />

      <div className="corkboard-card-content">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{clue.icon}</span>
          <p className="corkboard-note-title truncate flex-1">
            {clue.title}
          </p>
        </div>

        <p className="corkboard-note-desc line-clamp-2 mb-1.5">
          {clue.description}
        </p>

        <div className="flex items-center gap-1.5">
          <span
            className="corkboard-note-tag"
            style={{
              color: rarityColors[clue.rarity],
              borderColor: rarityColors[clue.rarity],
            }}
          >
            {rarityNames[clue.rarity]}
          </span>
          {clue.year && (
            <span className="corkboard-note-year">
              {clue.year}年
            </span>
          )}
          {clue.isKey && (
            <span className="corkboard-note-key-badge">★ 关键</span>
          )}
        </div>
      </div>

      {isMoveMode && (
        <button
          className="corkboard-card-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <X size={10} />
        </button>
      )}
    </motion.div>
  );
};

export default CorkNote;
