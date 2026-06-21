import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelButton, PixelPanel, PixelWindow } from '../ui';
import type { MinigameType, OpponentType } from '../../types/minigame';
import { useEmployees } from '../../store/useEmployeeStore';
import { useCurrentGuests } from '../../store/useGuestStore';
import { MINIGAME_DEFINITIONS } from '../../data/minigames';

interface OpponentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGame: MinigameType;
  onSelectOpponent: (opponent: {
    type: OpponentType;
    id: string;
    name: string;
    avatar: string;
    skill: number;
  }, bet: number) => void;
}

const OpponentSelector: React.FC<OpponentSelectorProps> = ({
  isOpen,
  onClose,
  selectedGame,
  onSelectOpponent,
}) => {
  const employees = useEmployees();
  const guests = useCurrentGuests();
  const gameDef = MINIGAME_DEFINITIONS[selectedGame];

  const [selectedOpponent, setSelectedOpponent] = React.useState<{
    type: OpponentType;
    id: string;
    name: string;
    avatar: string;
    skill: number;
  } | null>(null);
  const [bet, setBet] = React.useState(gameDef.minBet);
  const [activeTab, setActiveTab] = React.useState<'employees' | 'guests'>('employees');

  const availableEmployees = employees.filter((emp) => emp.status === 'idle');
  const availableGuests = guests.filter((g) => g.status === 'staying' && !g.isCheckOut);

  const employeeSkills = useMemo(() => {
    const map = new Map<string, number>();
    availableEmployees.forEach((emp) => {
      const gamePreferenceBias = Math.random() * 20 - 10;
      map.set(emp.id, Math.max(10, Math.min(90, emp.skill + gamePreferenceBias)));
    });
    return map;
  }, [availableEmployees]);

  const guestSkills = useMemo(() => {
    const map = new Map<string, number>();
    availableGuests.forEach((guest) => {
      const ageBias = (guest.age - 40) * 0.2;
      const personalityBias = guest.personality.includes('机敏') || guest.personality.includes('敏锐') ? 15 : 0;
      map.set(
        guest.id,
        Math.max(10, Math.min(90, 50 + ageBias + personalityBias + (Math.random() * 20 - 10)))
      );
    });
    return map;
  }, [availableGuests]);

  const handleConfirm = () => {
    if (selectedOpponent && bet >= gameDef.minBet && bet <= gameDef.maxBet) {
      onSelectOpponent(selectedOpponent, bet);
    }
  };

  const renderOpponentCard = (
    opponent: { id: string; name: string; avatar: string; skill: number; description?: string },
    type: OpponentType
  ) => {
    const isSelected = selectedOpponent?.id === opponent.id && selectedOpponent?.type === type;

    return (
      <motion.div
        key={opponent.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          setSelectedOpponent({
            type,
            id: opponent.id,
            name: opponent.name,
            avatar: opponent.avatar,
            skill: opponent.skill,
          })
        }
        className={`pixel-card p-3 cursor-pointer transition-all ${
          isSelected
            ? 'bg-[var(--pixel-primary)]/30 border-[var(--pixel-primary)]'
            : 'bg-[var(--pixel-bg-dark)] hover:bg-[var(--pixel-bg-dark)]/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">{opponent.avatar}</div>
          <div className="flex-1">
            <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">{opponent.name}</p>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
              技能: {opponent.skill}
            </p>
            {opponent.description && (
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1 line-clamp-1">
                {opponent.description}
              </p>
            )}
          </div>
          {isSelected && (
            <div className="text-[var(--pixel-success)] text-xl">✓</div>
          )}
        </div>
        <div className="mt-2">
          <div className="h-1.5 bg-[var(--pixel-bg)] rounded overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--pixel-info)] to-[var(--pixel-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${opponent.skill}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={onClose}
      title={`选择对手 - ${gameDef.name}`}
      width="600px"
    >
      <div className="p-4">
        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <PixelButton
              variant={activeTab === 'employees' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setActiveTab('employees')}
            >
              <span className="flex items-center gap-1">
                👷 员工 ({availableEmployees.length})
              </span>
            </PixelButton>
            <PixelButton
              variant={activeTab === 'guests' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setActiveTab('guests')}
            >
              <span className="flex items-center gap-1">
                🛎️ 客人 ({availableGuests.length})
              </span>
            </PixelButton>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                赌注金额
              </label>
              <span className="pixel-font-display text-lg text-[var(--pixel-gold)]">
                ¥{bet}
              </span>
            </div>
            <input
              type="range"
              min={gameDef.minBet}
              max={gameDef.maxBet}
              step={5}
              value={bet}
              onChange={(e) => setBet(parseInt(e.target.value))}
              className="w-full h-2 bg-[var(--pixel-bg-dark)] rounded-lg appearance-none cursor-pointer accent-[var(--pixel-primary)]"
            />
            <div className="flex justify-between pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
              <span>¥{gameDef.minBet}</span>
              <span>¥{gameDef.maxBet}</span>
            </div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-info)] mt-2">
              预计获胜奖励: ¥{Math.floor(bet * (gameDef.baseReward.money || 1))}
            </p>
          </div>

          <PixelPanel variant="dark" className="max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'employees' && (
                <motion.div
                  key="employees"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {availableEmployees.length > 0 ? (
                    availableEmployees.map((emp) =>
                      renderOpponentCard(
                        {
                          id: emp.id,
                          name: emp.name,
                          avatar: emp.avatar,
                          skill: employeeSkills.get(emp.id) || 50,
                          description: emp.description,
                        },
                        'employee'
                      )
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                        暂无空闲的员工
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
                        请先让员工休息
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'guests' && (
                <motion.div
                  key="guests"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {availableGuests.length > 0 ? (
                    availableGuests.map((guest) =>
                      renderOpponentCard(
                        {
                          id: guest.id,
                          name: guest.name,
                          avatar: guest.avatar,
                          skill: guestSkills.get(guest.id) || 50,
                          description: guest.occupation,
                        },
                        'guest'
                      )
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                        暂无可用的客人
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
                        等待新客人入住
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </PixelPanel>
        </div>

        <div className="flex gap-3 justify-end">
          <PixelButton variant="default" onClick={onClose}>
            取消
          </PixelButton>
          <PixelButton
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedOpponent || bet < gameDef.minBet || bet > gameDef.maxBet}
          >
            开始游戏
          </PixelButton>
        </div>
      </div>
    </PixelWindow>
  );
};

export default OpponentSelector;
