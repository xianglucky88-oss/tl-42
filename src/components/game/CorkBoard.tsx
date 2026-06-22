import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Link2, Move, Unlock, Sparkles, Plus, X } from 'lucide-react';
import { PixelButton, PixelBadge } from '../ui';
import { useStoryStore } from '../../store/useStoryStore';
import { useCurrentDay } from '../../store/useGameStore';
import { STORY_FRAGMENTS } from '../../data/stories';
import CorkNote from './CorkNote';
import type { Clue } from '../../types/story';

type BoardMode = 'move' | 'pin' | 'connect';

interface CardPosition {
  clueId: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

interface UnlockAnimation {
  fragmentId: string;
  title: string;
  timestamp: number;
}

const rarityColors: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#60A5FA',
  epic: '#C084FC',
  legendary: '#FACC15',
};

const rarityBorderColors: Record<string, string> = {
  common: '#6B7280',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#EAB308',
};

const rarityNames: Record<string, string> = {
  common: '普通',
  uncommon: '稀有',
  rare: '珍贵',
  epic: '史诗',
  legendary: '传说',
};

const CARD_W = 180;
const CARD_H = 110;

const CorkBoard: React.FC = () => {
  const discoveredClues = useStoryStore((s) => s.discoveredClues);
  const progress = useStoryStore((s) => s.progress);
  const unlockStoryFragment = useStoryStore((s) => s.unlockStoryFragment);
  const checkForUnlocks = useStoryStore((s) => s.checkForUnlocks);
  const currentDay = useCurrentDay();

  const [boardCards, setBoardCards] = useState<CardPosition[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pinnedClues, setPinnedClues] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<BoardMode>('move');
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [unlockAnimations, setUnlockAnimations] = useState<UnlockAnimation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const boardRef = useRef<HTMLDivElement>(null);
  const nextZIndex = useRef(10);

  const cluesOnBoard = useMemo(() => {
    return boardCards.map((pos) => {
      const clue = discoveredClues.find((c) => c.id === pos.clueId);
      return { ...pos, clue };
    }).filter((item) => item.clue);
  }, [boardCards, discoveredClues]);

  const availableClues = useMemo(() => {
    const onBoardIds = new Set(boardCards.map((c) => c.clueId));
    return discoveredClues.filter((c) => !onBoardIds.has(c.id));
  }, [discoveredClues, boardCards]);

  const addClueToBoard = useCallback((clueId: string) => {
    const existing = boardCards.find((c) => c.clueId === clueId);
    if (existing) return;

    const offset = boardCards.length * 30;
    const x = 40 + (offset % 400);
    const y = 40 + (offset % 300);

    setBoardCards((prev) => [...prev, { clueId, x, y }]);
  }, [boardCards.length]);

  const removeClueFromBoard = useCallback((clueId: string) => {
    setBoardCards((prev) => prev.filter((c) => c.clueId !== clueId));
    setConnections((prev) => prev.filter((c) => c.from !== clueId && c.to !== clueId));
    setPinnedClues((prev) => {
      const next = new Set(prev);
      next.delete(clueId);
      return next;
    });
    if (connectingFrom === clueId) setConnectingFrom(null);
  }, [connectingFrom]);

  const handleDragEnd = useCallback((clueId: string, _: any, info: { offset: { x: number; y: number } }) => {
    setBoardCards((prev) =>
      prev.map((c) =>
        c.clueId === clueId
          ? { ...c, x: Math.max(0, c.x + info.offset.x), y: Math.max(0, c.y + info.offset.y) }
          : c
      )
    );
  }, []);

  const togglePin = useCallback((clueId: string) => {
    setPinnedClues((prev) => {
      const next = new Set(prev);
      if (next.has(clueId)) next.delete(clueId);
      else next.add(clueId);
      return next;
    });
  }, []);

  const handleCardClick = useCallback((clueId: string) => {
    if (mode === 'pin') {
      togglePin(clueId);
      return;
    }

    if (mode === 'connect') {
      if (connectingFrom === null) {
        setConnectingFrom(clueId);
      } else if (connectingFrom === clueId) {
        setConnectingFrom(null);
      } else {
        const exists = connections.some(
          (c) =>
            (c.from === connectingFrom && c.to === clueId) ||
            (c.from === clueId && c.to === connectingFrom)
        );
        if (!exists) {
          setConnections((prev) => [...prev, { from: connectingFrom, to: clueId }]);
        }
        setConnectingFrom(null);
      }
    }
  }, [mode, connectingFrom, connections, togglePin]);

  const removeConnection = useCallback((from: string, to: string) => {
    setConnections((prev) =>
      prev.filter((c) => !(c.from === from && c.to === to) && !(c.from === to && c.to === from))
    );
  }, []);

  const getConnectedGroup = useCallback((clueId: string): Set<string> => {
    const group = new Set<string>();
    const queue = [clueId];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (group.has(current)) continue;
      group.add(current);
      connections.forEach((c) => {
        if (c.from === current && !group.has(c.to)) queue.push(c.to);
        if (c.to === current && !group.has(c.from)) queue.push(c.from);
      });
    }
    return group;
  }, [connections]);

  useEffect(() => {
    STORY_FRAGMENTS.forEach((fragment) => {
      if (progress.unlockedFragments.includes(fragment.id)) return;

      const boardClueIds = new Set(boardCards.map((c) => c.clueId));
      const allOnBoard = fragment.requiredClueIds.every((id) => boardClueIds.has(id));
      if (!allOnBoard) return;

      const firstClue = boardCards.find((c) => c.clueId === fragment.requiredClueIds[0]);
      if (!firstClue) return;

      const group = getConnectedGroup(firstClue.clueId);
      const allConnected = fragment.requiredClueIds.every((id) => group.has(id));
      if (!allConnected) return;

      unlockStoryFragment(fragment.id, currentDay);
      checkForUnlocks();

      setUnlockAnimations((prev) => [
        ...prev,
        { fragmentId: fragment.id, title: fragment.title, timestamp: Date.now() },
      ]);

      setTimeout(() => {
        setUnlockAnimations((prev) => prev.filter((a) => a.fragmentId !== fragment.id));
      }, 4000);
    });
  }, [connections, boardCards, progress.unlockedFragments, unlockStoryFragment, checkForUnlocks, getConnectedGroup, currentDay]);

  const getCardCenter = useCallback((pos: CardPosition) => {
    return { x: pos.x + CARD_W / 2, y: pos.y + CARD_H / 2 };
  }, []);

  return (
    <div className="corkboard-root">
      <AnimatePresence>
        {unlockAnimations.map((anim) => (
          <motion.div
            key={anim.fragmentId}
            className="corkboard-unlock-toast"
            initial={{ opacity: 0, y: -60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Sparkles size={20} className="text-[var(--pixel-gold)]" />
            <div>
              <p className="pixel-font-display text-xs text-[var(--pixel-gold)]">故事碎片解锁！</p>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">{anim.title}</p>
            </div>
            <Unlock size={18} className="text-[var(--pixel-success)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div
        className={`${sidebarOpen ? 'w-56' : 'w-10'} transition-all duration-300 flex-shrink-0 border-r-2 border-[var(--pixel-border)] bg-[var(--pixel-bg-dark)] flex flex-col overflow-hidden`}
      >
        <div className="p-2 flex items-center justify-between border-b-2 border-[var(--pixel-border)]">
          {sidebarOpen && (
            <span className="pixel-font-display text-[8px] text-[var(--pixel-text-secondary)] truncate">
              线索库 ({availableClues.length})
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="pixel-btn pixel-btn-sm !p-1 !px-2"
          >
            {sidebarOpen ? <X size={10} /> : <Plus size={10} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto pixel-scrollbar p-2 space-y-2">
            {availableClues.length === 0 && (
              <p className="pixel-font-mono text-[8px] text-[var(--pixel-text-secondary)] text-center py-4">
                所有线索已上板
              </p>
            )}
            {availableClues.map((clue) => (
              <motion.div
                key={clue.id}
                className="corkboard-sidebar-card"
                style={{ borderLeftColor: rarityBorderColors[clue.rarity] }}
                onClick={() => addClueToBoard(clue.id)}
                whileHover={{ scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-sm">{clue.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="pixel-font-mono text-[8px] text-[var(--pixel-text-primary)] truncate">
                    {clue.title}
                  </p>
                  <p
                    className="pixel-font-mono text-[6px] truncate"
                    style={{ color: rarityColors[clue.rarity] }}
                  >
                    {rarityNames[clue.rarity]}
                    {clue.isKey ? ' ★' : ''}
                  </p>
                </div>
                <Plus size={10} className="text-[var(--pixel-text-secondary)] flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="corkboard-main">
        <div className="corkboard-toolbar">
          <div className="flex items-center gap-1">
            <PixelButton
              variant={mode === 'move' ? 'primary' : 'default'}
              size="sm"
              onClick={() => { setMode('move'); setConnectingFrom(null); }}
            >
              <span className="flex items-center gap-1">
                <Move size={12} />
                移动
              </span>
            </PixelButton>
            <PixelButton
              variant={mode === 'pin' ? 'warning' : 'default'}
              size="sm"
              onClick={() => { setMode('pin'); setConnectingFrom(null); }}
            >
              <span className="flex items-center gap-1">
                <Pin size={12} />
                图钉
              </span>
            </PixelButton>
            <PixelButton
              variant={mode === 'connect' ? 'danger' : 'default'}
              size="sm"
              onClick={() => { setMode('connect'); setConnectingFrom(null); }}
            >
              <span className="flex items-center gap-1">
                <Link2 size={12} />
                连线
              </span>
            </PixelButton>
          </div>

          <div className="flex items-center gap-2">
            <PixelBadge variant="gold" size="sm">
              <span className="flex items-center gap-1">
                <Pin size={10} />
                {pinnedClues.size}
              </span>
            </PixelBadge>
            <PixelBadge variant="danger" size="sm">
              <span className="flex items-center gap-1">
                <Link2 size={10} />
                {connections.length}
              </span>
            </PixelBadge>
          </div>

          {mode === 'connect' && connectingFrom && (
            <div className="corkboard-connect-hint">
              <span className="pixel-font-mono text-[8px] text-[var(--pixel-text-primary)]">
                点击第二个线索完成连线...
              </span>
              <PixelButton variant="danger" size="sm" onClick={() => setConnectingFrom(null)}>
                取消
              </PixelButton>
            </div>
          )}
        </div>

        <div
          ref={boardRef}
          className="corkboard-canvas pixel-scrollbar"
        >
          <svg className="corkboard-connections-layer">
            {connections.map((conn) => {
              const fromPos = boardCards.find((c) => c.clueId === conn.from);
              const toPos = boardCards.find((c) => c.clueId === conn.to);
              if (!fromPos || !toPos) return null;

              const fromCenter = getCardCenter(fromPos);
              const toCenter = getCardCenter(toPos);

              const dx = toCenter.x - fromCenter.x;
              const dy = toCenter.y - fromCenter.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const sag = Math.min(dist * 0.15, 40);
              const midX = (fromCenter.x + toCenter.x) / 2;
              const midY = (fromCenter.y + toCenter.y) / 2 + sag;

              return (
                <g key={`${conn.from}-${conn.to}`} onClick={() => removeConnection(conn.from, conn.to)} className="corkboard-connection-group">
                  <path
                    d={`M ${fromCenter.x} ${fromCenter.y} Q ${midX} ${midY} ${toCenter.x} ${toCenter.y}`}
                    className="corkboard-red-thread"
                  />
                  <path
                    d={`M ${fromCenter.x} ${fromCenter.y} Q ${midX} ${midY} ${toCenter.x} ${toCenter.y}`}
                    className="corkboard-red-thread-hitarea"
                  />
                </g>
              );
            })}
          </svg>

          {cluesOnBoard.map(({ clueId, x, y, clue }) => {
            if (!clue) return null;

            return (
              <div
                key={clueId}
                style={{ position: 'absolute', left: x, top: y }}
              >
                <CorkNote
                  clue={clue}
                  isPinned={pinnedClues.has(clueId)}
                  isConnecting={connectingFrom === clueId}
                  isConnected={connections.some((c) => c.from === clueId || c.to === clueId)}
                  isMoveMode={mode === 'move'}
                  zIndex={nextZIndex.current}
                  onDragStart={() => { nextZIndex.current += 1; }}
                  onDragEnd={(_, info) => handleDragEnd(clueId, _, info)}
                  onClick={() => handleCardClick(clueId)}
                  onRemove={() => removeClueFromBoard(clueId)}
                />
              </div>
            );
          })}

          {boardCards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Pin size={48} className="text-[var(--pixel-border)] mx-auto mb-3" />
                <p className="pixel-font-display text-xs text-[var(--pixel-text-secondary)] mb-1">
                  软木板推理
                </p>
                <p className="pixel-font-mono text-[8px] text-[var(--pixel-text-secondary)]">
                  从左侧线索库中点击添加线索到画布
                </p>
                <p className="pixel-font-mono text-[8px] text-[var(--pixel-text-secondary)] mt-1">
                  用图钉标记关键线索，用红线连接关联线索
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorkBoard;
