import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Lock, CheckCircle, Circle, HelpCircle, ChevronDown, ChevronRight, User, MessageCircle } from 'lucide-react';
import type { DialogueBranchNode, BranchStatus } from '../../types/guest';
import { PixelBadge } from '../ui';

interface DialogueHistoryTreeProps {
  branches: DialogueBranchNode[];
  selectedPathIds?: string[];
  compact?: boolean;
}

const statusConfig: Record<BranchStatus, { label: string; color: string; bgColor: string; Icon: any; borderColor: string }> = {
  selected: {
    label: '已选择',
    color: 'text-[var(--pixel-gold)]',
    bgColor: 'bg-[rgba(201,162,39,0.15)]',
    borderColor: 'border-[var(--pixel-gold)]',
    Icon: CheckCircle,
  },
  available: {
    label: '可选择',
    color: 'text-[var(--pixel-info)]',
    bgColor: 'bg-[rgba(46,134,171,0.15)]',
    borderColor: 'border-[var(--pixel-info)]',
    Icon: Circle,
  },
  locked: {
    label: '未解锁',
    color: 'text-[var(--pixel-text-secondary)]',
    bgColor: 'bg-[rgba(0,0,0,0.2)]',
    borderColor: 'border-[var(--pixel-border)]',
    Icon: Lock,
  },
  unexplored: {
    label: '未探索',
    color: 'text-[var(--pixel-text-secondary)]',
    bgColor: 'bg-[rgba(0,0,0,0.1)]',
    borderColor: 'border-dashed border-[var(--pixel-text-secondary)]',
    Icon: HelpCircle,
  },
};

const TreeNode: React.FC<{
  node: DialogueBranchNode;
  isLast: boolean;
  isFirst: boolean;
  parentSelected: boolean;
  compact?: boolean;
  depth: number;
}> = ({ node, isLast, isFirst, parentSelected, compact, depth }) => {
  const [expanded, setExpanded] = useState(true);
  const config = statusConfig[node.status];
  const Icon = config.Icon;
  const isOnSelectedPath = node.isSelectedPath;
  const hasChildren = node.children && node.children.length > 0;

  const showConnector = !isFirst || depth > 0;

  return (
    <div className="relative">
      {showConnector && (
        <div
          className="absolute left-4 w-0.5"
          style={{
            top: '-8px',
            height: '8px',
            backgroundColor: isOnSelectedPath ? 'var(--pixel-gold)' : 'var(--pixel-border)',
          }}
        />
      )}

      <div className={`flex items-start gap-2 py-1 ${compact ? '' : 'py-2'}`}>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 mt-1 text-[var(--pixel-text-secondary)] hover:text-[var(--pixel-text-primary)] transition-colors"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {!hasChildren && <div className="flex-shrink-0 w-3.5" />}

        <div
          className={`flex-shrink-0 mt-1 ${config.color}`}
        >
          <Icon size={16} className={node.status === 'selected' ? 'fill-current' : ''} />
        </div>

        <div
          className={`flex-1 px-3 py-2 border-2 ${config.borderColor} ${config.bgColor} transition-all ${
            isOnSelectedPath ? 'shadow-[0_0_8px_rgba(201,162,39,0.3)]' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              {node.type === 'player_option' && <User size={12} className="text-[var(--pixel-info)]" />}
              {node.type === 'guest_response' && <MessageCircle size={12} className="text-[var(--pixel-success)]" />}
              <span className={`pixel-font-mono text-[10px] ${config.color}`}>
                {node.type === 'greeting' && '开场白'}
                {node.type === 'player_option' && '玩家选项'}
                {node.type === 'guest_response' && '客人回应'}
              </span>
            </div>
            <PixelBadge variant={node.status === 'selected' ? 'gold' : node.status === 'available' ? 'info' : 'default'} size="sm">
              {config.label}
            </PixelBadge>
          </div>

          <p className={`pixel-font-mono text-xs ${
            node.status === 'locked' ? 'text-[var(--pixel-text-secondary)] opacity-50' : 'text-[var(--pixel-text-primary)]'
          }`}>
            {node.status === 'locked' ? '???（需要解锁条件）' : node.text}
          </p>

          {node.status !== 'locked' && node.effect && (
            <div className="flex flex-wrap gap-1 mt-2">
              {node.effect.reputation && (
                <PixelBadge variant={node.effect.reputation > 0 ? 'success' : 'danger'} size="sm">
                  声望 {node.effect.reputation > 0 ? '+' : ''}{node.effect.reputation}
                </PixelBadge>
              )}
              {node.effect.clueId && (
                <PixelBadge variant="gold" size="sm">
                  🔍 发现线索
                </PixelBadge>
              )}
              {node.effect.unlocksStory && (
                <PixelBadge variant="info" size="sm">
                  📖 解锁故事
                </PixelBadge>
              )}
              {node.effect.mood && (
                <PixelBadge variant="warning" size="sm">
                  心情 {node.effect.mood > 0 ? '+' : ''}{node.effect.mood}
                </PixelBadge>
              )}
            </div>
          )}

          {node.status === 'locked' && (node.requiredClueId || node.requiredReputation) && (
            <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mt-2">
              🔒 需要:
              {node.requiredClueId && <span> 特定线索</span>}
              {node.requiredClueId && node.requiredReputation && <span> + </span>}
              {node.requiredReputation && <span> 声望 ≥ {node.requiredReputation}</span>}
            </p>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 relative">
          <div
            className="absolute left-0 w-0.5"
            style={{
              top: '0',
              bottom: node.children[node.children.length - 1] ? '12px' : '0',
              backgroundColor: isOnSelectedPath ? 'var(--pixel-gold)' : 'var(--pixel-border)',
            }}
          />
          <div
            className="absolute left-0 h-0.5"
            style={{
              top: '10px',
              width: '8px',
              backgroundColor: isOnSelectedPath ? 'var(--pixel-gold)' : 'var(--pixel-border)',
            }}
          />
          <div className="ml-4">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                isLast={index === node.children.length - 1}
                isFirst={index === 0}
                parentSelected={isOnSelectedPath}
                compact={compact}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DialogueHistoryTree: React.FC<DialogueHistoryTreeProps> = ({ branches, compact = false }) => {
  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch size={32} className="text-[var(--pixel-text-secondary)] mx-auto mb-3" />
        <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">暂无对话分支记录</p>
      </div>
    );
  }

  const selectedCount = branches.reduce((acc, node) => {
    const countInNode = (n: DialogueBranchNode): number => {
      let count = n.status === 'selected' ? 1 : 0;
      n.children.forEach((c) => (count += countInNode(c)));
      return count;
    };
    return acc + countInNode(node);
  }, 0);

  const totalCount = branches.reduce((acc, node) => {
    const countInNode = (n: DialogueBranchNode): number => {
      let count = n.status !== 'locked' ? 1 : 0;
      n.children.forEach((c) => (count += countInNode(c)));
      return count;
    };
    return acc + countInNode(node);
  }, 0);

  const lockedCount = branches.reduce((acc, node) => {
    const countInNode = (n: DialogueBranchNode): number => {
      let count = n.status === 'locked' ? 1 : 0;
      n.children.forEach((c) => (count += countInNode(c)));
      return count;
    };
    return acc + countInNode(node);
  }, 0);

  return (
    <div className={compact ? '' : 'space-y-3'}>
      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          <PixelBadge variant="gold" size="md">
            <span className="flex items-center gap-1">
              <CheckCircle size={10} className="fill-current" />
              已探索 {selectedCount}
            </span>
          </PixelBadge>
          <PixelBadge variant="info" size="md">
            <span className="flex items-center gap-1">
              <Circle size={10} />
              可探索 {totalCount - selectedCount - lockedCount}
            </span>
          </PixelBadge>
          <PixelBadge variant="default" size="md">
            <span className="flex items-center gap-1">
              <Lock size={10} />
              未解锁 {lockedCount}
            </span>
          </PixelBadge>
        </motion.div>
      )}

      <div className="space-y-1">
        {branches.map((branch, index) => (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TreeNode
              node={branch}
              isLast={index === branches.length - 1}
              isFirst={index === 0}
              parentSelected={false}
              compact={compact}
              depth={0}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DialogueHistoryTree;
