import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Star, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { PixelWindow, PixelButton, PixelBadge, PixelProgress } from '../ui';
import type { HotelAttributeKey, SentimentKeyword } from '../../types/guest';
import { useHotelAttributes, useHotelMoney, useHotelActions } from '../../store/useHotelStore';
import { getUpgradeCost, ATTRIBUTE_META, getBadReviewResolveLevel } from '../../data/hotel';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword?: SentimentKeyword | null;
  onUpgradeSuccess?: (message: string, resolvedCount: number) => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, keyword, onUpgradeSuccess }) => {
  const hotelAttributes = useHotelAttributes();
  const money = useHotelMoney();
  const hotelActions = useHotelActions();

  const targetAttribute = useMemo((): HotelAttributeKey | null => {
    if (!keyword) return null;
    if (keyword.relatedAttribute) return keyword.relatedAttribute;
    return null;
  }, [keyword]);

  const attributeInfo = useMemo(() => {
    if (!targetAttribute) return null;
    return hotelAttributes.find(a => a.key === targetAttribute) || null;
  }, [targetAttribute, hotelAttributes]);

  const upgradeData = useMemo(() => {
    if (!targetAttribute) return null;
    const check = hotelActions.canUpgradeAttribute(targetAttribute);
    const resolveLevel = getBadReviewResolveLevel(targetAttribute);
    return {
      ...check,
      resolveLevel,
      meta: ATTRIBUTE_META[targetAttribute],
    };
  }, [targetAttribute, hotelActions]);

  const handleUpgrade = () => {
    if (!targetAttribute || !upgradeData?.canUpgrade) return;
    const result = hotelActions.upgradeAttribute(targetAttribute);
    if (result.success) {
      onUpgradeSuccess?.(result.message, result.resolvedReviews?.length || 0);
      setTimeout(onClose, 800);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <PixelWindow
          isOpen={isOpen}
          onClose={onClose}
          title="升级酒店属性"
          width="480px"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {keyword && (
              <div className="flex items-center gap-3 p-3 bg-[var(--pixel-bg-dark)] border-2 border-[var(--pixel-border)]">
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl bg-[var(--pixel-bg-medium)]"
                  style={{
                    color:
                      keyword.polarity === 'positive'
                        ? 'var(--pixel-success)'
                        : keyword.polarity === 'negative'
                        ? 'var(--pixel-danger)'
                        : 'var(--pixel-text-secondary)',
                  }}
                >
                  {keyword.polarity === 'negative' ? '⚠️' : keyword.polarity === 'positive' ? '✨' : '💬'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="pixel-font-display text-lg"
                      style={{
                        color:
                          keyword.polarity === 'positive'
                            ? 'var(--pixel-success)'
                            : keyword.polarity === 'negative'
                            ? 'var(--pixel-danger)'
                            : 'var(--pixel-text-secondary)',
                      }}
                    >
                      "{keyword.word}"
                    </span>
                    <PixelBadge
                      variant={keyword.polarity === 'positive' ? 'success' : keyword.polarity === 'negative' ? 'danger' : 'default'}
                      size="sm"
                    >
                      {keyword.polarity === 'positive' ? '正面评价' : keyword.polarity === 'negative' ? '差评来源' : '中性评价'}
                    </PixelBadge>
                  </div>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                    权重: {keyword.weight}
                  </p>
                </div>
              </div>
            )}

            {attributeInfo && upgradeData && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{upgradeData.meta.icon}</span>
                      <div>
                        <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
                          {attributeInfo.name}
                        </p>
                        <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                          {upgradeData.meta.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: attributeInfo.maxLevel }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < attributeInfo.level ? 'text-[var(--pixel-gold)] fill-current' : 'text-[var(--pixel-border)]'}
                        />
                      ))}
                    </div>
                  </div>

                  <PixelProgress
                    value={attributeInfo.level}
                    max={attributeInfo.maxLevel}
                    label={`Lv.${attributeInfo.level} / Lv.${attributeInfo.maxLevel}`}
                    variant="quality"
                    size="md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[var(--pixel-bg-dark)] border-2 border-[var(--pixel-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Coins size={14} className="text-[var(--pixel-gold)]" />
                      <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                        升级费用
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`pixel-font-display text-xl ${money >= upgradeData.cost ? 'text-[var(--pixel-gold)]' : 'text-[var(--pixel-danger)]'}`}
                      >
                        {upgradeData.cost}
                      </span>
                      <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                        / 当前 {money}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[var(--pixel-bg-dark)] border-2 border-[var(--pixel-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp size={14} className="text-[var(--pixel-info)]" />
                      <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                        差评消除等级
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`pixel-font-display text-xl ${attributeInfo.level >= upgradeData.resolveLevel ? 'text-[var(--pixel-success)]' : 'text-[var(--pixel-text-secondary)]'}`}>
                        Lv.{upgradeData.resolveLevel}
                      </span>
                      <span className="pixel-font-mono text-[10px] text-[var(--pixel-text-secondary)]">
                        {attributeInfo.level >= upgradeData.resolveLevel ? '已达成' : `还差 ${upgradeData.resolveLevel - attributeInfo.level} 级`}
                      </span>
                    </div>
                  </div>
                </div>

                {attributeInfo.level < upgradeData.resolveLevel && (
                  <div className="flex items-start gap-2 p-2 bg-[var(--pixel-bg-medium)] border-2 border-[var(--pixel-info)] opacity-80">
                    <AlertTriangle size={14} className="text-[var(--pixel-info)] shrink-0 mt-0.5" />
                    <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-primary)]">
                      升级到 Lv.{upgradeData.resolveLevel} 后，可自动消除与 "{upgradeData.meta.name}" 相关的差评，
                      并提升客人对该维度的满意度评分。
                    </p>
                  </div>
                )}

                {attributeInfo.level >= upgradeData.resolveLevel && (
                  <div className="flex items-start gap-2 p-2 bg-[var(--pixel-bg-medium)] border-2 border-[var(--pixel-success)]">
                    <CheckCircle size={14} className="text-[var(--pixel-success)] shrink-0 mt-0.5" />
                    <p className="pixel-font-mono text-[10px] text-[var(--pixel-text-primary)]">
                      已达到差评消除等级！继续升级可进一步提升满意度维度上限。
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <PixelButton
                    variant="default"
                    onClick={onClose}
                    className="flex-1"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <X size={12} />
                      取消
                    </span>
                  </PixelButton>
                  <PixelButton
                    variant={upgradeData.canUpgrade ? 'success' : 'default'}
                    onClick={handleUpgrade}
                    disabled={!upgradeData.canUpgrade}
                    className="flex-1"
                  >
                    <span className="flex items-center justify-center gap-1">
                      <Coins size={12} />
                      {upgradeData.canUpgrade ? `升级 (${upgradeData.cost}金)` : upgradeData.reason}
                    </span>
                  </PixelButton>
                </div>
              </>
            )}

            {!attributeInfo && keyword && (
              <div className="text-center py-4">
                <AlertTriangle size={32} className="text-[var(--pixel-warning)] mx-auto mb-2" />
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  该关键词暂未关联到可升级的属性
                </p>
              </div>
            )}
          </motion.div>
        </PixelWindow>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
