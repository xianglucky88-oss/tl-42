import React from 'react';
import { motion } from 'framer-motion';
import { Hotel, TrendingUp, Calendar, Bell, Info } from 'lucide-react';
import {
  ResourceBar,
  HotelStatus,
  EmployeeCard,
  GuestCard,
  ClueCard,
  PixelPanel,
  PixelButton,
  PixelBadge,
} from '../components';
import { useHotelStore } from '../store/useHotelStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useGuestStore } from '../store/useGuestStore';
import { useStoryStore } from '../store/useStoryStore';
import { useGameStore } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';

const DashboardPage: React.FC = () => {
  const { hotel, dailyStats } = useHotelStore();
  const { employees } = useEmployeeStore();
  const { guests } = useGuestStore();
  const { clues, storyProgress } = useStoryStore();
  const { currentDay, currentPhase } = useGameStore();
  const { nextDay, nextPhase } = useGameLoop();

  const recentClues = clues.filter(c => c.discovered).slice(0, 3);
  const currentGuests = guests.filter(g => g.status !== 'left');
  const activeEmployees = employees.slice(0, 2);

  const phaseNames: Record<string, string> = {
    morning: '早晨',
    afternoon: '下午',
    evening: '傍晚',
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-1">
                酒店总览
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                第 {currentDay} 天 · {phaseNames[currentPhase]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {dailyStats && (
                <PixelPanel variant="dark" animate={false} className="py-2 px-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">今日收入</p>
                      <p className="pixel-font-display text-lg text-[var(--pixel-success)]">
                        +¥{dailyStats.income.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">今日支出</p>
                      <p className="pixel-font-display text-lg text-[var(--pixel-danger)]">
                        -¥{dailyStats.expense.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">净收入</p>
                      <p className={`pixel-font-display text-lg ${dailyStats.income - dailyStats.expense >= 0 ? 'text-[var(--pixel-success)]' : 'text-[var(--pixel-danger)]'}`}>
                        ¥{(dailyStats.income - dailyStats.expense).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </PixelPanel>
              )}
              {currentPhase === 'evening' ? (
                <PixelButton variant="primary" size="lg" onClick={nextDay}>
                  <span className="flex items-center gap-2">
                    <Calendar size={18} />
                    进入下一天
                  </span>
                </PixelButton>
              ) : (
                <PixelButton variant="info" size="lg" onClick={nextPhase}>
                  <span className="flex items-center gap-2">
                    <TrendingUp size={18} />
                    下一阶段
                  </span>
                </PixelButton>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <ResourceBar />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HotelStatus />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PixelPanel title={`当前客人 (${currentGuests.length})`} variant="dark">
                {currentGuests.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {currentGuests.slice(0, 4).map(guest => (
                      <GuestCard key={guest.id} guest={guest} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                      暂无入住客人
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
                      提升酒店声望以吸引更多客人
                    </p>
                  </div>
                )}
              </PixelPanel>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <PixelPanel title="员工状态" variant="dark">
                <div className="space-y-3">
                  {activeEmployees.map(employee => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
              </PixelPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <PixelPanel
                title="最新线索"
                variant="dark"
                headerAction={
                  <PixelBadge variant="gold" size="sm">
                    {storyProgress.discoveredClues}/{storyProgress.totalClues}
                  </PixelBadge>
                }
              >
                {recentClues.length > 0 ? (
                  <div className="space-y-3">
                    {recentClues.map(clue => (
                      <ClueCard key={clue.id} clue={clue} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info size={32} className="text-[var(--pixel-text-secondary)] mx-auto mb-2" />
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                      尚未发现任何线索
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
                      与客人交谈、观察他们的行为来发现线索
                    </p>
                  </div>
                )}
              </PixelPanel>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PixelPanel title="故事进度" variant="dark">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        线索收集
                      </span>
                      <span className="pixel-font-mono text-xs text-[var(--pixel-gold)]">
                        {storyProgress.discoveredClues}/{storyProgress.totalClues}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--pixel-bg-dark)]">
                      <motion.div
                        className="h-full bg-[var(--pixel-gold)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(storyProgress.discoveredClues / storyProgress.totalClues) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        故事解锁
                      </span>
                      <span className="pixel-font-mono text-xs text-[var(--pixel-info)]">
                        {storyProgress.unlockedStories.length}/{storyProgress.totalStories}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--pixel-bg-dark)]">
                      <motion.div
                        className="h-full bg-[var(--pixel-info)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(storyProgress.unlockedStories.length / storyProgress.totalStories) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        秘密揭露
                      </span>
                      <span className="pixel-font-mono text-xs text-[var(--pixel-success)]">
                        {storyProgress.discoveredSecrets}/{storyProgress.totalSecrets}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--pixel-bg-dark)]">
                      <motion.div
                        className="h-full bg-[var(--pixel-success)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(storyProgress.discoveredSecrets / storyProgress.totalSecrets) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      />
                    </div>
                  </div>

                  <div className="pixel-card p-3 mt-4">
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">
                      当前章节
                    </p>
                    <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
                      {storyProgress.currentChapter}
                    </p>
                  </div>
                </div>
              </PixelPanel>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
