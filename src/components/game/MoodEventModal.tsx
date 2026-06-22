import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Frown, Smile, Meh, Zap, TrendingUp, Coins, Users, Star } from 'lucide-react';
import { PixelWindow, PixelButton, PixelBadge } from '../ui';
import { useMoodEventStore } from '../../store/useMoodEventStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { MOOD_EVENTS } from '../../data/moodEvents';
import type { MoodEventChoice } from '../../types/employee';

const categoryNames: Record<string, string> = {
  birthday: '生日',
  family: '家庭',
  conflict: '冲突',
  praise: '表扬',
  personal: '个人',
  workplace: '职场',
  health: '健康',
  romance: '感情',
  financial: '经济',
};

const categoryColors: Record<string, string> = {
  birthday: 'var(--pixel-gold)',
  family: 'var(--pixel-danger)',
  conflict: 'var(--pixel-warning)',
  praise: 'var(--pixel-success)',
  personal: 'var(--pixel-info)',
  workplace: 'var(--pixel-info)',
  health: 'var(--pixel-danger)',
  romance: 'var(--pixel-danger)',
  financial: 'var(--pixel-warning)',
};

const severityLabels: Record<string, { text: string; color: string }> = {
  minor: { text: '小事', color: 'var(--pixel-success)' },
  moderate: { text: '一般', color: 'var(--pixel-warning)' },
  major: { text: '大事', color: 'var(--pixel-danger)' },
};

const EffectBadge: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <span
    className="inline-flex items-center gap-1 pixel-font-mono text-xs px-2 py-0.5"
    style={{
      color: value > 0 ? 'var(--pixel-success)' : 'var(--pixel-danger)',
      background: value > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${value > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
    }}
  >
    {icon}
    {label} {value > 0 ? `+${value}` : value}
  </span>
);

const MoodEventModal: React.FC = () => {
  const pendingEvent = useMoodEventStore((s) => s.pendingEvent);
  const lastResultText = useMoodEventStore((s) => s.lastResultText);
  const resolveMoodEvent = useMoodEventStore((s) => s.resolveMoodEvent);
  const dismissPending = useMoodEventStore((s) => s.dismissPending);
  const employees = useEmployeeStore((s) => s.employees);

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!pendingEvent && !lastResultText) return null;

  const currentEvent = pendingEvent
    ? MOOD_EVENTS.find((e) => e.id === pendingEvent.eventId)
    : null;

  const currentEmployee = pendingEvent
    ? employees.find((e) => e.id === pendingEvent.employeeId)
    : null;

  if (lastResultText && showResult) {
    return (
      <PixelWindow
        isOpen={true}
        onClose={() => {
          setShowResult(false);
          dismissPending();
        }}
        title="事件结果"
        width="480px"
      >
        <div className="p-4 space-y-4">
          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] leading-relaxed">
              {lastResultText}
            </p>
          </motion.div>
          <PixelButton
            variant="primary"
            className="w-full"
            onClick={() => {
              setShowResult(false);
              dismissPending();
            }}
          >
            知道了
          </PixelButton>
        </div>
      </PixelWindow>
    );
  }

  if (!currentEvent || !currentEmployee || !pendingEvent) return null;

  const empName = currentEmployee.name;
  const description = currentEvent.description.replace(/\{employee\}/g, empName);
  const severity = severityLabels[currentEvent.severity];
  const categoryColor = categoryColors[currentEvent.category] || 'var(--pixel-info)';

  const handleChoose = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
  };

  const handleConfirm = () => {
    if (!selectedChoiceId || !pendingEvent) return;
    resolveMoodEvent(pendingEvent.id, selectedChoiceId, pendingEvent.triggeredDay);
    setShowResult(true);
  };

  const renderChoiceEffects = (choice: MoodEventChoice) => {
    const tags: React.ReactNode[] = [];
    const e = choice.effects;

    if (e.morale) tags.push(<EffectBadge key="morale" label="士气" value={e.morale} icon={<Heart size={10} />} />);
    if (e.mood) tags.push(<EffectBadge key="mood" label="心情" value={e.mood} icon={<Smile size={10} />} />);
    if (e.stamina) tags.push(<EffectBadge key="stamina" label="体力" value={e.stamina} icon={<Zap size={10} />} />);
    if (e.efficiency) tags.push(<EffectBadge key="eff" label="效率" value={e.efficiency} icon={<TrendingUp size={10} />} />);
    if (e.friendliness) tags.push(<EffectBadge key="frd" label="友好" value={e.friendliness} icon={<Users size={10} />} />);
    if (e.money) tags.push(<EffectBadge key="money" label="金钱" value={e.money} icon={<Coins size={10} />} />);
    if (e.reputation) tags.push(<EffectBadge key="rep" label="声望" value={e.reputation} icon={<Star size={10} />} />);

    return tags;
  };

  return (
    <PixelWindow
      isOpen={true}
      title="员工心情事件"
      width="560px"
    >
      <div className="p-4 space-y-4">
        <motion.div
          className="pixel-card p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{currentEvent.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="pixel-font-display text-base text-[var(--pixel-text-primary)]">
                  {currentEvent.title}
                </h3>
                <PixelBadge
                  variant={currentEvent.severity === 'major' ? 'danger' : currentEvent.severity === 'moderate' ? 'warning' : 'info'}
                  size="sm"
                >
                  {severity.text}
                </PixelBadge>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="pixel-font-mono text-xs px-2 py-0.5"
                  style={{
                    color: categoryColor,
                    background: `${categoryColor}22`,
                    border: `1px solid ${categoryColor}44`,
                  }}
                >
                  {categoryNames[currentEvent.category] || currentEvent.category}
                </span>
                <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  {empName} · {currentEmployee.role === 'maid' ? '客房服务' : currentEmployee.role === 'receptionist' ? '前台' : currentEmployee.role === 'handyman' ? '维修' : currentEmployee.role === 'waiter' ? '餐厅' : '经理'}
                </span>
              </div>
            </div>
          </div>

          <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] leading-relaxed">
            {description}
          </p>
        </motion.div>

        <div className="space-y-2">
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
            请选择你的处理方式：
          </p>
          <AnimatePresence>
            {currentEvent.choices.map((choice, index) => (
              <motion.button
                key={choice.id}
                className={`w-full text-left pixel-card p-3 transition-all cursor-pointer ${
                  selectedChoiceId === choice.id
                    ? 'border-[var(--pixel-gold)] bg-[var(--pixel-gold)]11 shadow-[0_0_8px_var(--pixel-gold)]33'
                    : 'hover:border-[var(--pixel-text-secondary)]'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                onClick={() => handleChoose(choice.id)}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: selectedChoiceId === choice.id ? 'var(--pixel-gold)' : 'var(--pixel-border)',
                      background: selectedChoiceId === choice.id ? 'var(--pixel-gold)' : 'transparent',
                    }}
                  >
                    {selectedChoiceId === choice.id && (
                      <span className="text-[8px] text-[var(--pixel-bg-dark)]">✓</span>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] mb-1">
                      {choice.text}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {renderChoiceEffects(choice)}
                    </div>
                    {choice.sideEffects && (
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1 italic">
                        可能会影响其他员工
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 pt-2">
          <PixelButton
            variant="default"
            className="flex-1"
            onClick={() => setSelectedChoiceId(null)}
          >
            重选
          </PixelButton>
          <PixelButton
            variant="primary"
            className="flex-1"
            disabled={!selectedChoiceId}
            onClick={handleConfirm}
          >
            确认选择
          </PixelButton>
        </div>
      </div>
    </PixelWindow>
  );
};

export default MoodEventModal;
