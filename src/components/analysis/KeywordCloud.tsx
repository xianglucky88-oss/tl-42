import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SentimentKeyword } from '../../types/guest';
import { PixelPanel } from '../ui';

interface KeywordCloudProps {
  keywords: SentimentKeyword[];
  title?: string;
  maxDisplay?: number;
}

const POLARITY_COLORS: Record<SentimentKeyword['polarity'], string> = {
  positive: 'var(--pixel-success)',
  neutral: 'var(--pixel-text-secondary)',
  negative: 'var(--pixel-danger)',
};

const POLARITY_LABELS: Record<SentimentKeyword['polarity'], string> = {
  positive: '正面',
  neutral: '中性',
  negative: '负面',
};

const KeywordCloud: React.FC<KeywordCloudProps> = ({
  keywords,
  title = '情感关键词云',
  maxDisplay = 20,
}) => {
  const displayedKeywords = useMemo(() => {
    return [...keywords]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxDisplay);
  }, [keywords, maxDisplay]);

  const maxWeight = useMemo(() => {
    if (displayedKeywords.length === 0) return 10;
    return Math.max(...displayedKeywords.map(k => k.weight));
  }, [displayedKeywords]);

  const getFontSize = (weight: number) => {
    const ratio = weight / maxWeight;
    return 12 + ratio * 18;
  };

  const stats = useMemo(() => {
    const positive = keywords.filter(k => k.polarity === 'positive').length;
    const neutral = keywords.filter(k => k.polarity === 'neutral').length;
    const negative = keywords.filter(k => k.polarity === 'negative').length;
    const total = keywords.length || 1;
    return {
      positive,
      neutral,
      negative,
      positivePct: Math.round((positive / total) * 100),
      neutralPct: Math.round((neutral / total) * 100),
      negativePct: Math.round((negative / total) * 100),
    };
  }, [keywords]);

  if (keywords.length === 0) {
    return (
      <PixelPanel variant="dark" animate={false}>
        <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)] mb-3">
          {title}
        </p>
        <div className="text-center py-6">
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            暂无关键词数据
          </p>
        </div>
      </PixelPanel>
    );
  }

  return (
    <PixelPanel variant="dark" animate={false}>
      <div className="flex items-center justify-between mb-3">
        <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
          {title}
        </p>
        <div className="flex gap-2">
          {(['positive', 'neutral', 'negative'] as const).map(polarity => (
            <div key={polarity} className="flex items-center gap-1">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: POLARITY_COLORS[polarity] }}
              />
              <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                {POLARITY_LABELS[polarity]} {stats[`${polarity}Pct` as const]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center min-h-[140px] p-2">
        {displayedKeywords.map((kw, i) => (
          <motion.span
            key={kw.word}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
            className="cursor-default select-none px-2 py-1 hover:scale-110 transition-transform"
            style={{
              fontSize: `${getFontSize(kw.weight)}px`,
              color: POLARITY_COLORS[kw.polarity],
              fontFamily: 'var(--font-display)',
            }}
            title={`${kw.word} (权重: ${kw.weight})`}
          >
            {kw.word}
          </motion.span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t-2 border-[var(--pixel-border)]">
        <div className="flex h-2 overflow-hidden">
          <div
            style={{
              width: `${stats.positivePct}%`,
              backgroundColor: POLARITY_COLORS.positive,
            }}
          />
          <div
            style={{
              width: `${stats.neutralPct}%`,
              backgroundColor: POLARITY_COLORS.neutral,
            }}
          />
          <div
            style={{
              width: `${stats.negativePct}%`,
              backgroundColor: POLARITY_COLORS.negative,
            }}
          />
        </div>
      </div>
    </PixelPanel>
  );
};

export default KeywordCloud;
