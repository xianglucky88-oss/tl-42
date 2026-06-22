import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { GuestReview } from '../../types/guest';
import { PixelPanel, PixelBadge } from '../ui';
import { getQualityColor } from '../../utils/pixel';

interface GuestReviewsProps {
  reviews: GuestReview[];
  title?: string;
}

const POLARITY_COLORS = {
  positive: 'var(--pixel-success)',
  neutral: 'var(--pixel-text-secondary)',
  negative: 'var(--pixel-danger)',
};

const GuestReviews: React.FC<GuestReviewsProps> = ({
  reviews,
  title = '历史评价',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (reviews.length === 0) {
    return (
      <PixelPanel variant="dark" animate={false}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--pixel-text-secondary)]" />
            <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
              {title}
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <MessageSquare size={36} className="text-[var(--pixel-text-secondary)] mx-auto mb-3 opacity-50" />
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            暂无历史评价
          </p>
          <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mt-1">
            客人退房后会自动生成评价
          </p>
        </div>
      </PixelPanel>
    );
  }

  return (
    <PixelPanel variant="dark" animate={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--pixel-text-secondary)]" />
          <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={12}
                className={n <= Math.round(Number(avgRating)) ? 'text-[var(--pixel-gold)] fill-current' : 'text-[var(--pixel-border)]'}
              />
            ))}
          </div>
          <span className="pixel-font-display text-sm text-[var(--pixel-gold)]">
            {avgRating}
          </span>
          <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
            ({reviews.length}条)
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[var(--pixel-bg-dark)] border-2 border-[var(--pixel-border)] p-3"
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => toggleExpand(review.id)}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 flex items-center justify-center bg-[var(--pixel-bg-medium)] text-lg shrink-0">
                  <User size={16} className="text-[var(--pixel-text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="pixel-font-display text-xs text-[var(--pixel-text-primary)]">
                      {review.guestName}
                    </span>
                    {review.isVIP && (
                      <PixelBadge variant="gold" size="sm" pulse>
                        VIP
                      </PixelBadge>
                    )}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={10}
                          className={n <= review.rating ? 'text-[var(--pixel-gold)] fill-current' : 'text-[var(--pixel-border)]'}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="pixel-font-display text-xs"
                      style={{ color: getQualityColor(review.overallSatisfaction) }}
                    >
                      满意度 {review.overallSatisfaction}
                    </span>
                    <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                      第{review.stayStartDay}-{review.stayEndDay}天 · {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {expandedId === review.id ? (
                <ChevronUp size={16} className="text-[var(--pixel-text-secondary)] shrink-0 mt-1" />
              ) : (
                <ChevronDown size={16} className="text-[var(--pixel-text-secondary)] shrink-0 mt-1" />
              )}
            </div>

            {review.content && (
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-2 pl-11">
                {review.content}
              </p>
            )}

            {expandedId === review.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pl-11 space-y-3"
              >
                <div>
                  <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mb-2">
                    维度评分
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(review.dimensions).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        room: '房间',
                        service: '服务',
                        food: '餐饮',
                        facilities: '设施',
                        location: '位置',
                        cleanliness: '清洁',
                      };
                      return (
                        <div key={key} className="flex items-center justify-between bg-[var(--pixel-bg-medium)] px-2 py-1">
                          <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                            {labels[key]}
                          </span>
                          <span
                            className="pixel-font-display text-xs"
                            style={{ color: getQualityColor(value as number) }}
                          >
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {review.keywords.length > 0 && (
                  <div>
                    <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mb-2">
                      情感关键词
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {review.keywords.map((kw) => (
                        <span
                          key={kw.word}
                          className="pixel-font-mono text-[10px] px-2 py-0.5 bg-[var(--pixel-bg-medium)]"
                          style={{ color: POLARITY_COLORS[kw.polarity] }}
                        >
                          {kw.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </PixelPanel>
  );
};

export default GuestReviews;
