import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GitBranch, Clock, TrendingUp, Calendar, User, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GuestDialogueHistory, DialogueHistoryRecord } from '../../types/guest';
import { PixelPanel, PixelWindow, PixelButton, PixelBadge, PixelAvatar } from '../ui';
import DialogueHistoryTree from './DialogueHistoryTree';

interface DialogueHistoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  history?: GuestDialogueHistory;
}

type ViewMode = 'list' | 'tree';

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const DialogueHistoryViewer: React.FC<DialogueHistoryViewerProps> = ({
  isOpen,
  onClose,
  guestId,
  guestName,
  guestAvatar,
  history,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number>(0);

  if (!isOpen) return null;

  const records = history?.records || [];
  const hasRecords = records.length > 0;
  const currentRecord: DialogueHistoryRecord | undefined = records[selectedRecordIndex];
  const selectedPath = currentRecord?.selectedPath || [];

  const getSelectedPathContent = (record: DialogueHistoryRecord) => {
    const messages: Array<{ text: string; speaker: 'player' | 'guest'; type: string }> = [];

    const findSelectedNodes = (nodes: any[]): void => {
      nodes.forEach((node) => {
        if (node.isSelectedPath || node.status === 'selected') {
          messages.push({
            text: node.text,
            speaker: node.speaker,
            type: node.type,
          });
        }
        if (node.children && node.children.length > 0) {
          findSelectedNodes(node.children);
        }
      });
    };

    if (record.branches) {
      findSelectedNodes(record.branches);
    }

    return messages;
  };

  return (
    <PixelWindow
      isOpen={isOpen}
      onClose={onClose}
      title={`对话历史 - ${guestName}`}
      width="700px"
      height="600px"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-[var(--pixel-border)]">
          <div className="flex items-center gap-3">
            <PixelAvatar
              name={guestName}
              role="guest"
              mood={80}
              size="md"
            />
            <div>
              <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
                {guestName}
              </p>
              <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                对话历史记录
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <PixelButton
              variant={viewMode === 'list' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <span className="flex items-center gap-1">
                <BookOpen size={12} />
                对话记录
              </span>
            </PixelButton>
            <PixelButton
              variant={viewMode === 'tree' ? 'primary' : 'default'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              <span className="flex items-center gap-1">
                <GitBranch size={12} />
                分支树
              </span>
            </PixelButton>
          </div>
        </div>

        {hasRecords && (
          <div className="flex items-center gap-2 pb-2">
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setSelectedRecordIndex(Math.max(0, selectedRecordIndex - 1))}
              disabled={selectedRecordIndex === 0}
            >
              <ChevronLeft size={12} />
            </PixelButton>
            <div className="flex-1 text-center">
              <PixelBadge variant="info" size="md">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  第 {currentRecord?.day || 0} 天 · 第 {selectedRecordIndex + 1}/{records.length} 次对话
                </span>
              </PixelBadge>
              {currentRecord && (
                <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mt-1">
                  <Clock size={10} className="inline mr-1" />
                  {formatDate(currentRecord.timestamp)}
                </p>
              )}
            </div>
            <PixelButton
              variant="default"
              size="sm"
              onClick={() => setSelectedRecordIndex(Math.min(records.length - 1, selectedRecordIndex + 1))}
              disabled={selectedRecordIndex >= records.length - 1}
            >
              <ChevronRight size={12} />
            </PixelButton>
          </div>
        )}

        {!hasRecords && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
              暂无对话记录
            </p>
            <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mt-2">
              与 {guestName} 交谈后，对话内容将显示在这里
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {hasRecords && currentRecord && viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <PixelPanel variant="dark" animate={false}>
                <div className="space-y-3">
                  {currentRecord && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-[var(--pixel-border)]">
                        <PixelBadge variant="info" size="sm">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            第 {currentRecord.day} 天
                          </span>
                        </PixelBadge>
                        {currentRecord.reputationChanges !== 0 && (
                          <PixelBadge variant={currentRecord.reputationChanges > 0 ? 'success' : 'danger'} size="sm">
                            <span className="flex items-center gap-1">
                              <TrendingUp size={10} />
                              声望 {currentRecord.reputationChanges > 0 ? '+' : ''}{currentRecord.reputationChanges}
                            </span>
                          </PixelBadge>
                        )}
                        {currentRecord.discoveredClueIds.length > 0 && (
                          <PixelBadge variant="gold" size="sm">
                            🔍 发现线索 x{currentRecord.discoveredClueIds.length}
                          </PixelBadge>
                        )}
                      </div>

                      <div className="space-y-3">
                        {getSelectedPathContent(currentRecord).map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-start gap-3 ${
                              msg.speaker === 'player' ? 'flex-row' : 'flex-row-reverse'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-[var(--pixel-border)] ${
                              msg.speaker === 'player'
                                ? 'bg-[var(--pixel-info)]'
                                : 'bg-[var(--pixel-success)]'
                            }`}>
                              {msg.speaker === 'player' ? (
                                <User size={16} className="text-[var(--pixel-text-primary)]" />
                              ) : (
                                <MessageCircle size={16} className="text-[var(--pixel-text-primary)]" />
                              )}
                            </div>
                            <div
                              className={`flex-1 max-w-[80%] px-4 py-2 border-2 border-[var(--pixel-border)] ${
                                msg.speaker === 'player'
                                  ? 'bg-[rgba(46,134,171,0.2)]'
                                  : 'bg-[rgba(45,90,39,0.2)]'
                              }`}
                            >
                              <p className="pixel-font-mono text-[10px] mb-1" style={{
                                color: msg.speaker === 'player' ? 'var(--pixel-info)' : 'var(--pixel-success)'
                              }}>
                                {msg.speaker === 'player' ? '你' : guestName}
                                {msg.type === 'greeting' && ' · 开场白'}
                                {msg.type === 'player_option' && ' · 选择'}
                                {msg.type === 'guest_response' && ' · 回应'}
                              </p>
                              <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                                {msg.text}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </PixelPanel>
            </motion.div>
          )}

          {hasRecords && currentRecord && viewMode === 'tree' && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-h-[450px] overflow-y-auto pr-2 pixel-scrollbar"
            >
              <PixelPanel variant="dark" animate={false} title="对话分支树">
                <DialogueHistoryTree
                  branches={currentRecord.branches}
                  selectedPathIds={selectedPath}
                />
              </PixelPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {hasRecords && history && (
          <div className="pt-3 border-t-2 border-[var(--pixel-border)]">
            <div className="flex items-center justify-between">
              <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                总计: {records.length} 次对话 · 已探索 {history.allSelectedOptionIds.length} 个选项分支
              </p>
              {records.length > 1 && (
                <div className="flex gap-1">
                  {records.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedRecordIndex(idx)}
                      className={`w-2 h-2 border-2 border-[var(--pixel-border)] transition-colors ${
                        idx === selectedRecordIndex
                          ? 'bg-[var(--pixel-gold)]'
                          : 'bg-[var(--pixel-bg-dark)] hover:bg-[var(--pixel-bg-light)]'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PixelWindow>
  );
};

export default DialogueHistoryViewer;
