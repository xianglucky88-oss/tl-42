import React from 'react';
import { motion } from 'framer-motion';
import { getMoodColor, getQualityColor } from '../../utils/pixel';

interface PixelProgressProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'mood' | 'stamina' | 'quality' | 'reputation';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const getBarColor = () => {
    switch (variant) {
      case 'mood':
        return getMoodColor(value);
      case 'stamina':
        return value > 50 ? '#2D5A27' : value > 25 ? '#C9A227' : '#8B2635';
      case 'quality':
        return getQualityColor(value);
      case 'reputation':
        return '#C9A227';
      default:
        return '#4A6741';
    }
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={`pixel-progress ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="pixel-text-sm">{label}</span>}
          {showValue && (
            <span className="pixel-text-sm">{value}/{max}</span>
          )}
        </div>
      )}
      <div
        className={`pixel-progress-bar ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className="pixel-progress-fill"
          style={{ backgroundColor: getBarColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default PixelProgress;
