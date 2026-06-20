import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MessageCircle, Eye, Star, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { Guest } from '../../types/guest';
import { PixelAvatar, PixelProgress, PixelButton, PixelBadge, PixelPanel, PixelWindow } from '../ui';
import { useDialogue } from '../../hooks/useDialogue';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useStoryStore } from '../../store/useStoryStore';
import { useHotelStore } from '../../store/useHotelStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { getMoodColor } from '../../utils/pixel';

interface GuestCardProps {
  guest: Guest;
  className?: string;
}

const GuestCard: React.FC<GuestCardProps> = ({ guest, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const { dialogueState, startDialogue, selectOption, endDialogue } = useDialogue();
  const { meetGuestNeed, applyDialogueEffect, addObservation: gameLoopAddObservation } = useGameLoop();
  const { discoveredClues } = useStoryStore();
  const { reputation } = useHotelStore();
  const { items: inventoryItems } = useInventoryStore();

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
    if (guest.dialogueOptions && guest.dialogueOptions.length > 0) {
      const unlockedClueIds = discoveredClues.map(c => c.id);
      startDialogue({
        guest,
        unlockedClueIds,
        reputation,
      });
      setShowDialogue(true);
    }
  };

  const handleSelectOption = (option: any) => {
    const response = selectOption(option);
    if (response && response.effect) {
      applyDialogueEffect(guest.id, response.effect);
    }
  };

  const handleObserve = () => {
    if (guest.observations) {
      const unobserved = guest.observations.filter(o => !o.discovered);
      if (unobserved.length > 0) {
        const observation = unobserved[0];
        gameLoopAddObservation(guest.id, observation.id);
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
    meetGuestNeed(guest.id, needId);
  };

  const canMeetNeed = (need: any): boolean => {
    if (!need.requiredItems || need.requiredItems.length === 0) return true;
    
    return need.requiredItems.every((itemId: string) => {
      const item = inventoryItems.find(i => i.id === itemId);
      return item && item.quantity > 0;
    });
  };

  const getRequiredItemNames = (need: any): string => {
    if (!need.requiredItems || need.requiredItems.length === 0) return '';
    
    return need.requiredItems
      .map((itemId: string) => {
        const item = inventoryItems.find(i => i.id === itemId);
        return item?.name || itemId;
      })
      .join('、');
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

          <div className="mt-2">
            <PixelProgress
              value={guest.patience}
              max={guest.maxPatience || 100}
              label="耐心值"
              variant="warning"
              size="sm"
            />
          </div>

          {unmetNeeds.length > 0 && (
            <div className="mt-3">
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2 flex items-center gap-1">
                <AlertTriangle size={12} className="text-[var(--pixel-warning)]" />
                未满足需求 ({unmetNeeds.length})
              </p>
              <div className="space-y-2">
                {unmetNeeds.map(need => (
                  <div key={need.id} className="bg-[var(--pixel-bg-dark)] px-3 py-2 border-2 border-[var(--pixel-border)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                        {need.description}
                      </span>
                      <PixelBadge variant={need.urgency >= 3 ? 'danger' : need.urgency >= 2 ? 'warning' : 'info'} size="sm">
                        紧急度 {need.urgency}
                      </PixelBadge>
                    </div>
                    {need.requiredItems && need.requiredItems.length > 0 && (
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-2 flex items-center gap-1">
                        <Package size={10} />
                        需要: {getRequiredItemNames(need)}
                      </p>
                    )}
                    <PixelButton
                      variant={canMeetNeed(need) ? 'success' : 'default'}
                      size="sm"
                      onClick={() => handleMeetNeed(need.id)}
                      disabled={!canMeetNeed(need)}
                      className="w-full"
                    >
                      {canMeetNeed(need) ? '满足需求' : '物资不足'}
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
              disabled={!guest.dialogueOptions || guest.dialogueOptions.length === 0}
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
        {dialogueState.isActive && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <PixelAvatar
                name={guest.name}
                role="guest"
                mood={moodToNumber(guest.mood)}
                size="md"
              />
              <div>
                <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
                  {guest.name}
                </p>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  {guest.occupation}
                </p>
              </div>
            </div>

            <div className="pixel-dialogue-box p-4">
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                {dialogueState.currentText}
              </p>
            </div>

            {dialogueState.showOptions && dialogueState.availableOptions.length > 0 && (
              <div className="space-y-2">
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  选择回复:
                </p>
                {dialogueState.availableOptions.map((option, index) => (
                  <PixelButton
                    key={option.id}
                    variant={index === 0 ? 'primary' : 'default'}
                    className="w-full text-left justify-start"
                    onClick={() => handleSelectOption(option)}
                  >
                    {option.text}
                  </PixelButton>
                ))}
              </div>
            )}

            {dialogueState.isEnded && dialogueState.response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pixel-panel pixel-panel-light p-4 space-y-3"
              >
                <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                  {dialogueState.response}
                </p>
                {dialogueState.lastEffect && (
                  <div className="space-y-1">
                    {dialogueState.lastEffect.reputation && (
                      <PixelBadge variant={dialogueState.lastEffect.reputation > 0 ? 'success' : 'danger'}>
                        声望 {dialogueState.lastEffect.reputation > 0 ? '+' : ''}{dialogueState.lastEffect.reputation}
                      </PixelBadge>
                    )}
                    {dialogueState.lastEffect.clueId && (
                      <PixelBadge variant="gold" pulse>
                        🎉 发现新线索！
                      </PixelBadge>
                    )}
                    {dialogueState.lastEffect.unlocksStory && (
                      <PixelBadge variant="info">
                        📖 解锁新故事！
                      </PixelBadge>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {dialogueState.isEnded && (
              <PixelButton
                variant="primary"
                className="w-full"
                onClick={() => {
                  endDialogue();
                  setShowDialogue(false);
                }}
              >
                结束对话
              </PixelButton>
            )}
          </div>
        )}
      </PixelWindow>
    </>
  );
};

export default GuestCard;
