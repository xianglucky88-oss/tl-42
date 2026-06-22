import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Zap, Heart, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Employee } from '../../types/employee';
import { PixelAvatar, PixelProgress, PixelButton, PixelBadge, PixelPanel } from '../ui';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useMoodEventStore } from '../../store/useMoodEventStore';
import { MOOD_EVENTS } from '../../data/moodEvents';
import { AreaType } from '../../types/game';

interface EmployeeCardProps {
  employee: Employee;
  onAssign?: () => void;
  className?: string;
}

const areaNames: Record<AreaType, string> = {
  lobby: '大堂',
  rooms: '客房',
  restaurant: '餐厅',
  garden: '花园',
  kitchen: '厨房',
  maintenance: '维修',
  unassigned: '未分配',
};

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onAssign, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { assignEmployee } = useEmployeeStore();
  const activeMoodEvents = useMoodEventStore((s) =>
    s.activeEvents.filter(ae => ae.employeeId === employee.id && !ae.resolved)
  );

  const handleAssign = (area: AreaType) => {
    assignEmployee(employee.id, area);
  };

  const roleNames: Record<string, string> = {
    cleaner: '客房服务员',
    receptionist: '前台',
    engineer: '维修师',
    chef: '厨师',
    manager: '经理',
  };

  return (
    <motion.div
      className={`pixel-card ${className}`}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <PixelAvatar
            name={employee.name}
            role={employee.role as any}
            mood={employee.mood}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="pixel-font-display text-sm text-[var(--pixel-text-primary)] truncate">
                {employee.name}
              </h3>
              <PixelBadge variant="info" size="sm">
                {roleNames[employee.role] || employee.role}
              </PixelBadge>
              {activeMoodEvents.length > 0 && (
                <motion.span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 cursor-pointer"
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: 'var(--pixel-danger)',
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <AlertCircle size={10} />
                  <span className="pixel-font-mono text-xs">
                    {MOOD_EVENTS.find(e => e.id === activeMoodEvents[0].eventId)?.emoji || '⚡'}
                  </span>
                </motion.span>
              )}
            </div>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-3">
              等级 {employee.level} · 经验 {employee.exp}/{employee.level * 100}
            </p>

            <div className="space-y-2">
              <PixelProgress
                value={employee.stamina}
                max={100}
                label="体力"
                variant="stamina"
                size="sm"
              />
              <PixelProgress
                value={employee.mood}
                max={100}
                label="心情"
                variant="mood"
                size="sm"
              />
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {employee.skills.map((skill, i) => (
                <PixelBadge key={i} variant="gold" size="sm">
                  {skill.name} Lv.{skill.level}
                </PixelBadge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[var(--pixel-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[var(--pixel-text-secondary)]" />
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                当前区域:
              </span>
              {employee.assignedArea ? (
                <PixelBadge variant="success" size="sm">
                  {areaNames[employee.assignedArea]}
                </PixelBadge>
              ) : (
                <PixelBadge variant="warning" size="sm">
                  未分配
                </PixelBadge>
              )}
            </div>
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '收起' : '详情'}
            </PixelButton>
          </div>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <PixelPanel variant="dark" animate={false}>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                  分配到区域:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(areaNames).map(([area, name]) => (
                    <PixelButton
                      key={area}
                      variant={employee.assignedArea === area ? 'success' : 'default'}
                      size="sm"
                      onClick={() => handleAssign(area as AreaType)}
                    >
                      {name}
                    </PixelButton>
                  ))}
                </div>
              </PixelPanel>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap size={12} className="text-[var(--pixel-gold)]" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">效率</span>
                  </div>
                  <span className="pixel-font-display text-lg text-[var(--pixel-gold)]">
                    {employee.efficiency}%
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart size={12} className="text-[var(--pixel-danger)]" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">友好</span>
                  </div>
                  <span className="pixel-font-display text-lg text-[var(--pixel-danger)]">
                    {employee.friendliness}%
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={12} className="text-[var(--pixel-info)]" />
                    <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">日薪</span>
                  </div>
                  <span className="pixel-font-display text-lg text-[var(--pixel-info)]">
                    ¥{employee.dailyWage}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
