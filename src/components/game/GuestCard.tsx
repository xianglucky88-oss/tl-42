import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle, Eye, Star, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Guest } from '../../types/guest';
import { PixelAvatar, PixelProgress, PixelButton, PixelBadge, PixelPanel, PixelWindow } from '../ui';
import { useGuestStore } from '../../store/useGuestStore';
import { useDialogue } from '../../hooks/useDialogue';
import { useStoryStore } from '../../store/useStoryStore';
import { useGameStore } from '../../store/useGameStore';
import { getMoodColor } from '../../utils/pixel';

interface GuestCardProps {
  guest: Guest;
  className?: string;
}

const GuestCard: React.FC<GuestCardProps> = ({ guest, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const { meetNeed, addObservation } = useGuestStore();
  const { startDialogue, currentDialogue, selectOption, dialogueState, endDialogue } = useDialogue();
  const { discoverClue } = useStoryStore();
  const { currentDay } = useGameStore();

  const statusNames: Record<string, string> = {
    checking_in: '入住中',
    staying: '入住中',
    checking_out: '退房中',
    left: '已离开',
  };

  const statusColors: Record<string, string> = {
    checking_in: 'info',
    staying: 'success',
    checking_out: 'warning',
    left: 'default',
  };

  const handleTalk = () => {
    if (guest.dialogues && guest.dialogues.length > 0) {
      startDialogue(guest.dialogues[0]);
      setShowDialogue(true);
    }
  };

  const handleObserve = () => {
    if (guest.observations) {
      const unobserved = guest.observations.filter(o => !o.discovered);
      if (unobserved.length > 0) {
        const observation = unobserved[0];
        addObservation(guest.id, observation.id);
        if (observation.clueId) {
          discoverClue(observation.clueId, guest.name, currentDay);
        }
      }
    }
  };

  const moodToNumber = (mood: string): number => {
    switch (mood) {
      case 'happy': return 80;
      case 'content': return 60;
      case 'neutral': return 50;
      case 'frustrated': return 30;
      case 'angry': return 10;
      default: return 50;
    }
  };

  const handleMeetNeed = (needId: string) => {
    meetNeed(guest.id, needId);
  };

  const unmetNeeds = guest.needs.filter(n => !n.met);
  const metNeeds = guest.needs.filter(n => n.met);
  const undiscoveredObservations = guest.observations?.filter(o => !o.discovered) || [];

  return (
    <>
      <motion.div
        className={`pixel-card ${className}`}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="p-4">
          <div className="flex items-start gap-4">
            <PixelAvatar
              name={guest.name}
              role="guest"
              mood={moodToNumber(guest.mood)}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="pixel-font-display text-sm text-[var(--pixel-text-primary)] truncate">
                  {guest.name}
                </h3>
                <PixelBadge variant={statusColors[guest.status] as any} size="sm">
                  {statusNames[guest.status]}
                </PixelBadge>
                {guest.isVIP && (
                  <PixelBadge variant="gold" size="sm" pulse>
                    <Star size={10} className="fill-current" />
                    VIP
                  </PixelBadge>
                )}
              </div>
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                {guest.background}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-[var(--pixel-text-secondary)]" />
                  <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                    {guest.stayDuration}天
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-[var(--pixel-gold)]" />
                  <span className="pixel-font-mono text-xs text-[var(--pixel-gold)]">
                    {guest.preferredPrice}¥/晚
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <PixelProgress
              value={guest.satisfaction}
              max={100}
              label="满意度"
              variant="quality"
              size="sm"
            />
          </div>

          {unmetNeeds.length > 0 && (
            <div className="mt-3">
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2 flex items-center gap-1">
                <AlertTriangle size={12} className="text-[var(--pixel-warning)]" />
                未满足需求 ({unmetNeeds.length})
              </p>
              <div className="space-y-1">
                {unmetNeeds.map(need => (
                  <div key={need.id} className="flex items-center justify-between bg-[var(--pixel-bg-dark)] px-3 py-2 border-2 border-[var(--pixel-border)]">
                    <span className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                      {need.description}
                    </span>
                    <PixelButton
                      variant="success"
                      size="sm"
                      onClick={() => handleMeetNeed(need.id)}
                    >
                      满足
                    </PixelButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metNeeds.length > 0 && (
            <div className="mt-3">
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2 flex items-center gap-1">
                <CheckCircle size={12} className="text-[var(--pixel-success)]" />
                已满足需求 ({metNeeds.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {metNeeds.map(need => (
                  <PixelBadge key={need.id} variant="success" size="sm">
                    {need.description}
                  </PixelBadge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t-2 border-[var(--pixel-border)] flex gap-2">
            <PixelButton
              variant="primary"
              size="sm"
              onClick={handleTalk}
              disabled={!guest.dialogues || guest.dialogues.length === 0}
              className="flex-1"
            >
              <span className="flex items-center justify-center gap-1">
                <MessageCircle size={12} />
                交谈
              </span>
            </PixelButton>
            <PixelButton
              variant="info"
              size="sm"
              onClick={handleObserve}
              disabled={undiscoveredObservations.length === 0}
              className="flex-1"
            >
              <span className="flex items-center justify-center gap-1">
                <Eye size={12} />
                观察 ({undiscoveredObservations.length})
              </span>
            </PixelButton>
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
              className="mt-3 space-y-3"
            >
              <PixelPanel variant="dark" animate={false}>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                  个人档案
                </p>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                  {guest.background}
                </p>
              </PixelPanel>

              {guest.secret && (
                <PixelPanel variant="dark" animate={false}>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-warning)] mb-2">
                    🔒 隐藏的秘密
                  </p>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                    {guest.secret.discovered ? guest.secret.content : '??? 继续观察和交谈以解锁'}
                  </p>
                </PixelPanel>
              )}

              {guest.observations && guest.observations.length > 0 && (
                <PixelPanel variant="dark" animate={false}>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2">
                    观察记录
                  </p>
                  <div className="space-y-2">
                    {guest.observations.map(obs => (
                      <div key={obs.id} className={`pixel-font-mono text-xs ${obs.discovered ? 'text-[var(--pixel-text-primary)]' : 'text-[var(--pixel-text-secondary)] opacity-50'}`}>
                        {obs.discovered ? `• ${obs.description}` : '• ??? 未发现'}
                      </div>
                    ))}
                  </div>
                </PixelPanel>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <PixelWindow
        isOpen={showDialogue}
        onClose={() => {
          endDialogue();
          setShowDialogue(false);
        }}
        title={`与 ${guest.name} 交谈`}
        width="500px"
      >
        {currentDialogue && (
          <div className="space-y-4">
            <div className="pixel-dialogue-box p-4">
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                {dialogueState.currentLine || currentDialogue.lines[0]}
              </p>
            </div>

            {dialogueState.showOptions && dialogueState.options.length > 0 && (
              <div className="space-y-2">
                {dialogueState.options.map((option, index) => (
                  <PixelButton
                    key={index}
                    variant={index === 0 ? 'primary' : 'default'}
                    className="w-full text-left justify-start"
                    onClick={() => selectOption(option)}
                  >
                    {option.text}
                  </PixelButton>
                ))}
              </div>
            )}

            {dialogueState.response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pixel-panel pixel-panel-light p-4"
              >
                <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                  {dialogueState.response}
                </p>
                {dialogueState.clueFound && (
                  <PixelBadge variant="gold" className="mt-2" pulse>
                    🎉 发现新线索！
                  </PixelBadge>
                )}
              </motion.div>
            )}

            {!dialogueState.showOptions && !dialogueState.isEnded && (
              <PixelButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  if (dialogueState.response) {
                    endDialogue();
                    setShowDialogue(false);
                  }
                }}
              >
                {dialogueState.response ? '结束对话' : '继续'}
              </PixelButton>
            )}
          </div>
        )}
      </PixelWindow>
    </>
  );
};

export default GuestCard;
