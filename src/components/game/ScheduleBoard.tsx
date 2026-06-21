import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, AlertTriangle, Sparkles, RotateCcw } from 'lucide-react';
import { PixelPanel, PixelButton, PixelBadge, PixelAvatar } from '../ui';
import { useScheduleStore } from '../../store/useScheduleStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useGameStore } from '../../store/useGameStore';
import type { ScheduleAssignment, ScheduleConflict, ScheduleBonus } from '../../types/employee';
import type { AreaType } from '../../types/game';

const SCHEDULE_DAYS = 7;

const ASSIGNMENT_OPTIONS: { value: ScheduleAssignment; label: string; color: string }[] = [
  { value: 'rest', label: '休息', color: '#6B8E6B' },
  { value: 'lobby', label: '大堂', color: '#2E86AB' },
  { value: 'rooms', label: '客房', color: '#8B6DB5' },
  { value: 'restaurant', label: '餐厅', color: '#C9A227' },
  { value: 'garden', label: '花园', color: '#2D5A27' },
  { value: 'kitchen', label: '厨房', color: '#D4A017' },
  { value: 'maintenance', label: '维修', color: '#8B2635' },
];

const AREA_COLORS: Record<string, string> = {
  rest: '#6B8E6B',
  lobby: '#2E86AB',
  rooms: '#8B6DB5',
  restaurant: '#C9A227',
  garden: '#2D5A27',
  kitchen: '#D4A017',
  maintenance: '#8B2635',
  unassigned: '#5C3D1E',
};

const AREA_NAMES: Record<ScheduleAssignment, string> = {
  rest: '休息',
  lobby: '大堂',
  rooms: '客房',
  restaurant: '餐厅',
  garden: '花园',
  kitchen: '厨房',
  maintenance: '维修',
  unassigned: '未排',
};

const ScheduleBoard: React.FC = () => {
  const { employees } = useEmployeeStore();
  const { applyDaySchedule, applyScheduleBonuses } = useEmployeeStore();
  const {
    schedules,
    setSchedule,
    clearSchedule,
    detectConflicts,
    calculateBonuses,
    initSchedules,
  } = useScheduleStore();

  const currentDay = useGameStore((s) => s.currentDay);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showBonuses, setShowBonuses] = useState(false);
  const [applyDay, setApplyDay] = useState<number | null>(null);

  const dayLabels = useMemo(() => {
    return Array.from({ length: SCHEDULE_DAYS }, (_, i) => {
      if (i === 0) return `今日 (第${currentDay}天)`;
      return `第${currentDay + i}天`;
    });
  }, [currentDay]);

  const conflicts = useMemo(() => detectConflicts(), [schedules, detectConflicts]);
  const bonuses = useMemo(() => calculateBonuses(), [schedules, calculateBonuses]);

  const conflictMap = useMemo(() => {
    const map = new Map<string, ScheduleConflict[]>();
    for (const c of conflicts) {
      const key = `${c.employeeId}-${c.dayOffset}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return map;
  }, [conflicts]);

  const bonusMap = useMemo(() => {
    const map = new Map(bonuses.map(b => [b.employeeId, b]));
    return map;
  }, [bonuses]);

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name ?? id;

  const handleCellClick = (employeeId: string, dayOffset: number) => {
    const schedule = schedules.find(s => s.employeeId === employeeId);
    if (!schedule) return;

    const current = schedule.slots[dayOffset];
    const currentIndex = ASSIGNMENT_OPTIONS.findIndex(o => o.value === current);
    const nextIndex = (currentIndex + 1) % ASSIGNMENT_OPTIONS.length;
    setSchedule(employeeId, dayOffset, ASSIGNMENT_OPTIONS[nextIndex].value);
  };

  const handleAutoSchedule = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const slots: ScheduleAssignment[] = [];
    let restPlaced = false;

    for (let i = 0; i < SCHEDULE_DAYS; i++) {
      if (!restPlaced && (i === 3 || i === 6)) {
        slots.push('rest');
        restPlaced = true;
      } else if (emp.role === 'maid') {
        slots.push('rooms');
      } else if (emp.role === 'handyman') {
        slots.push(i % 2 === 0 ? 'maintenance' : 'lobby');
      } else if (emp.role === 'waiter') {
        slots.push('restaurant');
      } else if (emp.role === 'receptionist') {
        slots.push('lobby');
      } else {
        slots.push('lobby');
      }
    }

    useScheduleStore.getState().setWeekSchedule(employeeId, slots);
  };

  const handleApplyDay = (dayOffset: number) => {
    const dayAssignments = useScheduleStore.getState().getDayAssignments(dayOffset);
    const currentBonuses = calculateBonuses();

    for (const { employeeId, assignment } of dayAssignments) {
      applyDaySchedule(employeeId, assignment);
    }

    applyScheduleBonuses(currentBonuses);
    setApplyDay(null);
  };

  const conflictCount = conflicts.length;
  const bonusCount = bonuses.filter(b => b.moraleBoost > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-[var(--pixel-gold)]" />
          <h3 className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
            7日排班表
          </h3>
          <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            当前: 第{currentDay}天
          </span>
        </div>
        <div className="flex items-center gap-2">
          {conflictCount > 0 && (
            <PixelButton
              variant="danger"
              size="sm"
              onClick={() => setShowConflicts(!showConflicts)}
            >
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} />
                {conflictCount}个冲突
              </span>
            </PixelButton>
          )}
          {bonusCount > 0 && (
            <PixelButton
              variant="success"
              size="sm"
              onClick={() => setShowBonuses(!showBonuses)}
            >
              <span className="flex items-center gap-1">
                <Sparkles size={12} />
                {bonusCount}个加成
              </span>
            </PixelButton>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConflicts && conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PixelPanel variant="dark" animate={false}>
              <div className="space-y-2 pixel-panel-danger">
                {conflicts.map((c, i) => (
                  <div key={`${c.employeeId}-${c.dayOffset}-${i}`} className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-[var(--pixel-danger)] flex-shrink-0" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-danger)]">
                      {getEmployeeName(c.employeeId)} · {dayLabels[c.dayOffset]}: {c.message}
                    </span>
                  </div>
                ))}
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBonuses && bonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <PixelPanel variant="dark" animate={false}>
              <div className="space-y-2 pixel-panel-success">
                {bonuses.map((b, i) => (
                  <div key={`${b.employeeId}-${i}`} className="flex items-center gap-2">
                    <Sparkles size={12} className="text-[var(--pixel-success)] flex-shrink-0" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-success)]">
                      {getEmployeeName(b.employeeId)}: {b.reason}
                      {b.staminaSaved > 0 && ` (体力+${b.staminaSaved})`}
                      {b.moraleBoost > 0 && ` (士气+${b.moraleBoost})`}
                      {b.moraleBoost < 0 && ` (士气${b.moraleBoost})`}
                    </span>
                  </div>
                ))}
              </div>
            </PixelPanel>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="schedule-grid-container overflow-x-auto pixel-scrollbar">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[140px_repeat(7,1fr)_80px] gap-1 mb-2">
            <div className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] flex items-center px-2">
              员工
            </div>
            {dayLabels.map((label, i) => (
              <div
                key={i}
                className={`pixel-font-mono text-xs text-center py-1 ${
                  i === 0
                    ? 'text-[var(--pixel-gold)] animate-pixelGlow'
                    : 'text-[var(--pixel-text-secondary)]'
                }`}
              >
                {label}
              </div>
            ))}
            <div className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] text-center">
              操作
            </div>
          </div>

          {schedules.map((schedule) => {
            const emp = employees.find(e => e.id === schedule.employeeId);
            if (!emp) return null;

            const isSelected = selectedEmployee === schedule.employeeId;
            const empBonus = bonusMap.get(schedule.employeeId);

            return (
              <motion.div
                key={schedule.employeeId}
                className={`grid grid-cols-[140px_repeat(7,1fr)_80px] gap-1 mb-1 ${
                  isSelected ? 'ring-2 ring-[var(--pixel-gold)]' : ''
                }`}
                initial={false}
                animate={{ opacity: 1 }}
              >
                <div
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer pixel-card"
                  onClick={() => setSelectedEmployee(isSelected ? null : schedule.employeeId)}
                >
                  <PixelAvatar
                    name={emp.name}
                    role={emp.role as any}
                    mood={emp.mood}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="pixel-font-mono text-xs text-[var(--pixel-text-primary)] truncate">
                      {emp.name}
                    </div>
                    {empBonus && empBonus.moraleBoost !== 0 && (
                      <div className={`pixel-font-mono text-[9px] ${
                        empBonus.moraleBoost > 0 ? 'text-[var(--pixel-success)]' : 'text-[var(--pixel-danger)]'
                      }`}>
                        {empBonus.moraleBoost > 0 ? '✓' : '✗'} 士气{empBonus.moraleBoost > 0 ? '+' : ''}{empBonus.moraleBoost}
                      </div>
                    )}
                  </div>
                </div>

                {schedule.slots.map((assignment, dayIdx) => {
                  const conflictKey = `${schedule.employeeId}-${dayIdx}`;
                  const cellConflicts = conflictMap.get(conflictKey);
                  const hasConflict = cellConflicts && cellConflicts.length > 0;
                  const bgc = AREA_COLORS[assignment] || AREA_COLORS.unassigned;

                  return (
                    <motion.button
                      key={dayIdx}
                      className={`schedule-cell pixel-border-thin px-1 py-2 text-center cursor-pointer ${
                        hasConflict ? 'schedule-cell-conflict' : ''
                      }`}
                      style={{
                        backgroundColor: bgc,
                        opacity: assignment === 'unassigned' ? 0.4 : 0.85,
                      }}
                      onClick={() => handleCellClick(schedule.employeeId, dayIdx)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={hasConflict ? cellConflicts!.map(c => c.message).join('\n') : AREA_NAMES[assignment]}
                    >
                      <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-primary)]">
                        {AREA_NAMES[assignment]}
                      </span>
                      {hasConflict && (
                        <motion.div
                          className="schedule-conflict-indicator"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          <AlertTriangle size={10} className="text-[var(--pixel-danger)]" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                <div className="flex items-center justify-center gap-1">
                  <PixelButton
                    variant="default"
                    size="sm"
                    onClick={() => handleAutoSchedule(schedule.employeeId)}
                    className="!p-1 !px-2"
                  >
                    <Sparkles size={10} />
                  </PixelButton>
                  <PixelButton
                    variant="default"
                    size="sm"
                    onClick={() => clearSchedule(schedule.employeeId)}
                    className="!p-1 !px-2"
                  >
                    <RotateCcw size={10} />
                  </PixelButton>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
          点击单元格切换区域:
        </span>
        {ASSIGNMENT_OPTIONS.map(opt => (
          <div key={opt.value} className="flex items-center gap-1">
            <div
              className="w-3 h-3 pixel-border-thin"
              style={{ backgroundColor: opt.color, opacity: 0.85 }}
            />
            <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
              {opt.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pixel-panel-dark pixel-border-thin p-3 mb-3">
        <p className="pixel-font-mono text-xs text-[var(--pixel-gold)] flex items-center gap-2">
          <Sparkles size={12} />
          <span>「今日」排班将在推进到下一天时自动应用，无需手动点击。合理排班可减少体力消耗并提升士气。</span>
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t-2 border-[var(--pixel-border)]">
        <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
          手动应用:
        </span>
        {dayLabels.map((label, i) => (
          <PixelButton
            key={i}
            variant={applyDay === i ? 'danger' : 'default'}
            size="sm"
            onClick={() => setApplyDay(applyDay === i ? null : i)}
          >
            {label}
          </PixelButton>
        ))}
      </div>

      <AnimatePresence>
        {applyDay !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3"
          >
            <span className="pixel-font-mono text-xs text-[var(--pixel-warning)]">
              将应用第{applyDay + 1}天排班到所有员工，确认？
            </span>
            <PixelButton
              variant="success"
              size="sm"
              onClick={() => handleApplyDay(applyDay)}
            >
              确认应用
            </PixelButton>
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setApplyDay(null)}
            >
              取消
            </PixelButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleBoard;
