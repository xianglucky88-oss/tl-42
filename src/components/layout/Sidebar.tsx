import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Package,
  UserCheck,
  BookOpen,
  Settings,
  Gamepad2,
  FastForward,
  Pause,
  Play,
} from 'lucide-react';
import { useCurrentDay, useCurrentPhase, useGamePhase, useIsPaused, useGameActions } from '../../store/useGameStore';
import { useGameLoop } from '../../hooks/useGameLoop';
import { PixelButton, PixelBadge } from '../ui';
import { useCurrentGuests } from '../../store/useGuestStore';
import { useClues } from '../../store/useStoryStore';

const navItems = [
  { path: '/', label: '酒店总览', icon: Home },
  { path: '/management', label: '日常管理', icon: Users },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/guests', label: '客人接待', icon: UserCheck },
  { path: '/minigames', label: '迷你游戏', icon: Gamepad2 },
  { path: '/story', label: '故事档案', icon: BookOpen },
  { path: '/settings', label: '系统设置', icon: Settings },
];

const phaseNames: Record<string, string> = {
  morning: '早晨',
  afternoon: '下午',
  evening: '傍晚',
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const gamePhase = useGamePhase();
  const isPaused = useIsPaused();
  const currentDay = useCurrentDay();
  const currentPhase = useCurrentPhase();
  const { nextPhase } = useGameLoop();
  const gameActions = useGameActions();
  const guests = useCurrentGuests();
  const clues = useClues();

  const pendingGuests = guests.filter(g => g.status === 'checking_in' || g.needs.some(n => !n.met)).length;
  const newClues = clues.filter(c => c.isNew).length;

  return (
    <aside className="w-64 bg-[var(--pixel-bg-medium)] border-r-4 border-[var(--pixel-border)] flex flex-col">
      <div className="p-4 border-b-4 border-[var(--pixel-border)]">
        <div className="space-y-2">
          <div className="pixel-panel pixel-panel-dark p-2 mb-2">
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">
              第 {currentDay} 天 · {phaseNames[currentPhase] || '早晨'}
            </p>
          </div>
          <div className="flex gap-2">
            <PixelButton
              variant="primary"
              size="sm"
              onClick={nextPhase}
              disabled={gamePhase !== 'playing'}
              className="flex-1"
            >
              <span className="flex items-center justify-center gap-1">
                <FastForward size={14} />
                下一阶段
              </span>
            </PixelButton>
            <PixelButton
              variant={isPaused ? 'success' : 'warning'}
              size="sm"
              onClick={gameActions.togglePause}
              disabled={gamePhase !== 'playing'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </PixelButton>
          </div>
          {isPaused && (
            <PixelBadge variant="warning" className="w-full justify-center">
              游戏已暂停
            </PixelBadge>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          let badgeCount = 0;
          if (item.path === '/guests') badgeCount = pendingGuests;
          if (item.path === '/story') badgeCount = newClues;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `pixel-sidebar-link flex items-center gap-3 px-4 py-3 border-2 ${
                    isActive
                      ? 'bg-[var(--pixel-bg-light)] border-[var(--pixel-gold)] text-[var(--pixel-gold)]'
                      : 'border-transparent hover:bg-[var(--pixel-bg-dark)] text-[var(--pixel-text-secondary)] hover:text-[var(--pixel-text-primary)]'
                  }`
                }
              >
                <Icon size={18} />
                <span className="pixel-font-mono text-sm flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <PixelBadge variant="danger" size="sm" pulse>
                    {badgeCount}
                  </PixelBadge>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t-4 border-[var(--pixel-border)]">
        <div className="pixel-panel pixel-panel-dark p-3">
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
            游戏提示
          </p>
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
            {gamePhase === 'start' && '点击"开始游戏"开始你的酒店经理人生涯'}
            {gamePhase === 'playing' && '注意观察客人的行为，也许能发现隐藏的秘密'}
            {gamePhase === 'ended' && '游戏结束，查看你的成就'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
