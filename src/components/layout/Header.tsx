import React from 'react';
import { motion } from 'framer-motion';
import { Hotel, Coins, Star, Sun, CloudSun, Moon, Calendar, Save } from 'lucide-react';
import { useHotelStore } from '../../store/useHotelStore';
import { useGameStore } from '../../store/useGameStore';
import { PixelBadge, PixelButton } from '../ui';
import { useSaveSystem } from '../../hooks/useSaveSystem';

const phaseIcons = {
  morning: Sun,
  afternoon: CloudSun,
  evening: Moon,
};

const phaseNames = {
  morning: '早晨',
  afternoon: '下午',
  evening: '傍晚',
};

const Header: React.FC = () => {
  const { hotel } = useHotelStore();
  const { currentDay, currentPhase } = useGameStore();
  const { saveGame } = useSaveSystem();

  const PhaseIcon = phaseIcons[currentPhase] || Sun;

  const handleSave = () => {
    saveGame();
  };

  return (
    <header className="bg-[var(--pixel-bg-medium)] border-b-4 border-[var(--pixel-border)] px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Hotel className="text-[var(--pixel-gold)]" size={28} />
            <div>
              <h1 className="pixel-font-display text-lg text-[var(--pixel-text-primary)]">
                {hotel.name}
              </h1>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                始于 {hotel.foundedYear} 年
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[var(--pixel-bg-dark)] px-4 py-2 border-2 border-[var(--pixel-border)]">
            <Calendar size={16} className="text-[var(--pixel-text-secondary)]" />
            <span className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
              第 {currentDay} 天
            </span>
            <PixelBadge variant="info" size="sm">
              <span className="flex items-center gap-1">
                <PhaseIcon size={12} />
                {phaseNames[currentPhase]}
              </span>
            </PixelBadge>
          </div>

          <div className="flex items-center gap-2 bg-[var(--pixel-bg-dark)] px-4 py-2 border-2 border-[var(--pixel-border)]">
            <Coins size={16} className="text-[var(--pixel-gold)]" />
            <span className="pixel-font-mono text-sm text-[var(--pixel-gold)] font-bold">
              ¥{hotel.money.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[var(--pixel-bg-dark)] px-4 py-2 border-2 border-[var(--pixel-border)]">
            <Star size={16} className="text-[var(--pixel-gold)]" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < hotel.rating ? 'text-[var(--pixel-gold)] fill-[var(--pixel-gold)]' : 'text-[var(--pixel-border)]'}
                />
              ))}
            </div>
            <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
              {hotel.reputation}
            </span>
          </div>

          <PixelButton variant="primary" size="sm" onClick={handleSave}>
            <span className="flex items-center gap-1">
              <Save size={12} />
              保存
            </span>
          </PixelButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
