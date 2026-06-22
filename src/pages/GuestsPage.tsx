import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserPlus, Star, BarChart3, MessageSquare, TrendingUp, CheckCircle, Coins } from 'lucide-react';
import {
  GuestCard,
  PixelPanel,
  PixelButton,
  PixelBadge,
  SatisfactionRadar,
  KeywordCloud,
  GuestReviews,
  UpgradeModal,
} from '../components';
import { useCurrentGuests, useGuestReviews, useGuestActions } from '../store/useGuestStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { getQualityColor } from '../utils/pixel';
import type { SentimentKeyword, HotelAttributeKey } from '../types/guest';
import { useHotelAttributes, useHotelActions, useHotelMoney } from '../store/useHotelStore';
import { getBadReviewResolveLevel } from '../data/hotel';

const statusNames: Record<string, string> = {
  all: '全部',
  checking_in: '入住中',
  staying: '入住中',
  checking_out: '退房中',
  left: '已离开',
};

type TabType = 'reception' | 'analysis' | 'reviews';

const GuestsPage: React.FC = () => {
  const guests = useCurrentGuests();
  const reviews = useGuestReviews();
  const guestActions = useGuestActions();
  const { addRandomGuest } = useGameLoop();
  const hotelAttributes = useHotelAttributes();
  const hotelActions = useHotelActions();
  const hotelMoney = useHotelMoney();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<TabType>('reception');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<SentimentKeyword | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const statusFilters = ['all', 'checking_in', 'staying', 'checking_out', 'left'];

  const filteredGuests = selectedStatus === 'all'
    ? guests
    : guests.filter(g => g.status === selectedStatus);

  const currentGuests = guests.filter(g => g.status !== 'left');
  const satisfiedGuests = guests.filter(g => g.satisfaction >= 80);
  const vipGuests = guests.filter(g => g.isVIP);
  const unresolvedBadReviews = reviews.filter(r => r.isBadReview && !r.isResolved);

  const avgSatisfaction = useMemo(() => {
    return guestActions.getAverageSatisfaction();
  }, [guestActions]);

  const allKeywords = useMemo(() => {
    return guestActions.getAllSentimentKeywords();
  }, [guestActions]);

  const overallSatisfaction = useMemo(() => {
    const vals = Object.values(avgSatisfaction);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [avgSatisfaction]);

  const handleKeywordClick = (keyword: SentimentKeyword) => {
    setSelectedKeyword(keyword);
    setUpgradeModalOpen(true);
  };

  const handleUpgrade = (attributeKey: HotelAttributeKey) => {
    const result = hotelActions.upgradeAttribute(attributeKey);
    if (!result.success) {
      setToast({ message: result.message, type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    let resolvedCount = 0;
    let finalMessage = result.message;

    if (result.shouldResolve) {
      const resolvedIds = guestActions.resolveBadReviewsForAttribute(attributeKey, result.newLevel || 0);
      resolvedCount = resolvedIds.length;
      if (resolvedCount > 0) {
        finalMessage = `${result.message} 自动消除了 ${resolvedCount} 条差评！`;
      }
    }

    setToast({ message: finalMessage, type: 'success' });
    setTimeout(() => setToast(null), 3000);
    setTimeout(() => setUpgradeModalOpen(false), 800);
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'reception', label: '客人接待', icon: <UserCheck size={14} /> },
    { key: 'analysis', label: '满意度分析', icon: <BarChart3 size={14} /> },
    { key: 'reviews', label: '历史评价', icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-1">
                客人接待
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                接待客人，满足他们的需求，发现他们的秘密
              </p>
            </div>
            <div className="flex gap-3">
              <PixelButton
                variant="primary"
                onClick={() => {
                  addRandomGuest();
                }}
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={14} />
                  随机接待
                </span>
              </PixelButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <UserCheck size={24} className="text-[var(--pixel-info)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  当前客人
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-info)]">
                  {currentGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3">
              <Star size={24} className="text-[var(--pixel-success)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  满意度≥80
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-success)]">
                  {satisfiedGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Star size={24} className="text-[var(--pixel-gold)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  VIP客人
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-gold)]">
                  {vipGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-[var(--pixel-text-secondary)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  综合满意度
                </p>
                <p
                  className="pixel-font-display text-xl"
                  style={{ color: getQualityColor(overallSatisfaction) }}
                >
                  {overallSatisfaction}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={24} className={unresolvedBadReviews.length > 0 ? 'text-[var(--pixel-danger)]' : 'text-[var(--pixel-text-secondary)]'} />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  待处理差评
                </p>
                <p className={`pixel-font-display text-xl ${unresolvedBadReviews.length > 0 ? 'text-[var(--pixel-danger)]' : 'text-[var(--pixel-text-secondary)]'}`}>
                  {unresolvedBadReviews.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {tabs.map(tab => (
            <PixelButton
              key={tab.key}
              variant={activeTab === tab.key ? 'primary' : 'default'}
              onClick={() => setActiveTab(tab.key)}
              size="sm"
            >
              <span className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.key === 'reviews' && reviews.length > 0 && (
                  <PixelBadge variant="info" size="sm">
                    {reviews.length}
                  </PixelBadge>
                )}
              </span>
            </PixelButton>
          ))}
        </motion.div>

        {activeTab === 'reception' && (
          <>
            <motion.div
              className="flex gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {statusFilters.map(status => (
                <PixelButton
                  key={status}
                  variant={selectedStatus === status ? 'primary' : 'default'}
                  onClick={() => setSelectedStatus(status)}
                  size="sm"
                >
                  {statusNames[status]}
                </PixelButton>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {filteredGuests.map((guest, index) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GuestCard guest={guest} />
                </motion.div>
              ))}
            </motion.div>

            {filteredGuests.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <UserCheck size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
                <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                  暂无客人
                </p>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
                  点击"随机接待"来迎接新客人
                </p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SatisfactionRadar
                dimensions={avgSatisfaction}
                title="整体满意度雷达图"
                size={300}
              />
              <KeywordCloud
                keywords={allKeywords}
                title="情感关键词云"
                maxDisplay={25}
                onKeywordClick={handleKeywordClick}
              />
            </div>

            <div className="mb-6">
              <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-3">
                酒店属性等级 · 点击上方关键词可直接升级
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {hotelAttributes.map((attr) => {
                  const progress = (attr.level / attr.maxLevel) * 100;
                  return (
                    <PixelPanel
                      key={attr.key}
                      variant="dark"
                      animate={false}
                    >
                      <div className="text-center cursor-pointer hover:border-[var(--pixel-info)] transition-colors"
                        onClick={() => {
                          const dummyKeyword: SentimentKeyword = {
                            word: attr.name,
                            polarity: 'neutral',
                            weight: 5,
                            relatedAttribute: attr.key,
                          };
                          handleKeywordClick(dummyKeyword);
                        }}
                      >
                        <div className="text-2xl mb-1">{attr.icon}</div>
                        <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)] mb-0.5">
                          {attr.name}
                        </p>
                        <div className="flex items-center justify-center gap-0.5 mb-1">
                          {Array.from({ length: Math.min(5, attr.maxLevel) }).map((_, i) => (
                            <Star
                              key={i}
                              size={8}
                              className={i < Math.min(attr.level, 5) ? 'text-[var(--pixel-gold)] fill-current' : 'text-[var(--pixel-border)]'}
                            />
                          ))}
                        </div>
                        <p className="pixel-font-display text-sm text-[var(--pixel-info)]">
                          Lv.{attr.level}
                        </p>
                        <div className="mt-1 h-1 bg-[var(--pixel-border)] overflow-hidden">
                          <div
                            className="h-full transition-all duration-500 bg-[var(--pixel-info)]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </PixelPanel>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(avgSatisfaction).map(([key, value]) => {
                const labels: Record<string, string> = {
                  room: '房间',
                  service: '服务',
                  food: '餐饮',
                  facilities: '设施',
                  location: '位置',
                  cleanliness: '清洁',
                };
                return (
                  <PixelPanel key={key} variant="dark" animate={false}>
                    <div className="text-center">
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-1">
                        {labels[key]}
                      </p>
                      <p
                        className="pixel-font-display text-2xl"
                        style={{ color: getQualityColor(value as number) }}
                      >
                        {value}
                      </p>
                      <div className="mt-2 h-1.5 bg-[var(--pixel-border)] overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${value}%`,
                            backgroundColor: getQualityColor(value as number),
                          }}
                        />
                      </div>
                    </div>
                  </PixelPanel>
                );
              })}
            </div>

            {(guests.length > 0 || reviews.length > 0) && (
              <div className="mt-6">
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mb-3">
                  各客人满意度详情
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ...guests.map(g => ({
                      name: g.name,
                      dimensions: g.satisfactionDimensions,
                      keywords: g.sentimentKeywords,
                      satisfaction: g.satisfaction,
                      isVIP: g.isVIP,
                      status: g.status,
                    })),
                    ...reviews.map(r => ({
                      name: r.guestName,
                      dimensions: r.dimensions,
                      keywords: r.keywords,
                      satisfaction: r.overallSatisfaction,
                      isVIP: r.isVIP,
                      status: 'left' as const,
                    })),
                  ].slice(0, 6).map((item, i) => (
                    <PixelPanel key={`${item.name}-${i}`} variant="dark" animate={false}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="pixel-font-display text-xs text-[var(--pixel-text-primary)]">
                            {item.name}
                          </span>
                          {item.isVIP && (
                            <PixelBadge variant="gold" size="sm">
                              VIP
                            </PixelBadge>
                          )}
                          {item.status === 'left' && (
                            <PixelBadge variant="default" size="sm">
                              已离店
                            </PixelBadge>
                          )}
                        </div>
                        <span
                          className="pixel-font-display text-sm"
                          style={{ color: getQualityColor(item.satisfaction) }}
                        >
                          {item.satisfaction}分
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.keywords?.slice(0, 5).map(kw => (
                          <span
                            key={kw.word}
                            className="pixel-font-mono text-[10px] px-1.5 py-0.5 bg-[var(--pixel-bg-dark)]"
                            style={{
                              color:
                                kw.polarity === 'positive'
                                  ? 'var(--pixel-success)'
                                  : kw.polarity === 'negative'
                                  ? 'var(--pixel-danger)'
                                  : 'var(--pixel-text-secondary)',
                            }}
                          >
                            {kw.word}
                          </span>
                        ))}
                      </div>
                    </PixelPanel>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GuestReviews
              reviews={reviews}
              title="客人历史评价"
            />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 border-2 ${
              toast.type === 'success'
                ? 'bg-[var(--pixel-bg-dark)] border-[var(--pixel-success)]'
                : 'bg-[var(--pixel-bg-dark)] border-[var(--pixel-danger)]'
            } shadow-lg`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <CheckCircle size={20} className="text-[var(--pixel-success)]" />
              ) : (
                <MessageSquare size={20} className="text-[var(--pixel-danger)]" />
              )}
              <span
                className={`pixel-font-display text-sm ${
                  toast.type === 'success' ? 'text-[var(--pixel-success)]' : 'text-[var(--pixel-danger)]'
                }`}
              >
                {toast.message}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        keyword={selectedKeyword}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default GuestsPage;
