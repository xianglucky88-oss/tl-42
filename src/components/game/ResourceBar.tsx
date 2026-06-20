import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useHotelStore } from '../../store/useHotelStore';
import { PixelBadge } from '../ui';

interface ResourceBarProps {
  className?: string;
}

const ResourceBar: React.FC<ResourceBarProps> = ({ className = '' }) => {
  const { hotel, dailyStats } = useHotelStore();

  const formatMoney = (amount: number) => {
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`;
    return amount.toLocaleString();
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp size={12} className="text-green-500" />;
    if (value < 0) return <TrendingDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-500" />;
  };

  const resources = [
    {
      label: '资金',
      value: hotel.money,
      trend: dailyStats?.income - (dailyStats?.expense || 0),
      unit: '¥',
      color: 'var(--pixel-gold)',
    },
    {
      label: '声望',
      value: hotel.reputation,
      trend: dailyStats?.reputationChange || 0,
      unit: '',
      color: 'var(--pixel-success)',
      max: 100,
    },
    {
      label: '评级',
      value: hotel.rating,
      trend: 0,
      unit: '星',
      color: 'var(--pixel-gold)',
      max: 5,
    },
    {
      label: '入住率',
      value: Math.round((hotel.rooms.filter(r => r.isOccupied).length / hotel.rooms.length) * 100),
      trend: 0,
      unit: '%',
      color: 'var(--pixel-info)',
      max: 100,
    },
  ];

  return (
    <div className={`grid grid-cols-4 gap-4 ${className}`}>
      {resources.map((resource, index) => (
        <motion.div
          key={resource.label}
          className="pixel-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
              {resource.label}
            </span>
            {resource.trend !== 0 && (
              <div className="flex items-center gap-1">
                {getTrendIcon(resource.trend)}
                <span className={`pixel-font-mono text-xs ${resource.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {resource.trend > 0 ? '+' : ''}{resource.trend}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="pixel-font-display text-2xl font-bold"
              style={{ color: resource.color }}
            >
              {resource.unit}
              {formatMoney(resource.value)}
            </span>
            {resource.max && (
              <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                /{resource.max}
              </span>
            )}
          </div>
          {resource.max && (
            <div className="mt-2 h-1 bg-[var(--pixel-bg-dark)]">
              <motion.div
                className="h-full"
                style={{ backgroundColor: resource.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(resource.value / resource.max) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ResourceBar;
