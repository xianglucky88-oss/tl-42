import React from 'react';
import { motion } from 'framer-motion';
import type { SatisfactionDimensions } from '../../types/guest';
import { PixelPanel } from '../ui';
import { getQualityColor } from '../../utils/pixel';

interface SatisfactionRadarProps {
  dimensions: SatisfactionDimensions;
  title?: string;
  size?: number;
}

const DIMENSION_LABELS: Record<keyof SatisfactionDimensions, string> = {
  room: '房间',
  service: '服务',
  food: '餐饮',
  facilities: '设施',
  location: '位置',
  cleanliness: '清洁',
};

const SatisfactionRadar: React.FC<SatisfactionRadarProps> = ({
  dimensions,
  title = '满意度分析',
  size = 280,
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const dimensionKeys = Object.keys(DIMENSION_LABELS) as (keyof SatisfactionDimensions)[];
  const numDims = dimensionKeys.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / numDims - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = (Math.PI * 2 * index) / numDims - Math.PI / 2;
    const r = radius + 28;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = dimensionKeys
    .map((key, i) => {
      const pt = getPoint(i, dimensions[key] || 0);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const avgScore = Math.round(
    Object.values(dimensions).reduce((a, b) => a + b, 0) / numDims
  );

  return (
    <PixelPanel variant="dark" animate={false}>
      <div className="flex items-center justify-between mb-3">
        <p className="pixel-font-display text-sm text-[var(--pixel-text-primary)]">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="pixel-font-display text-lg"
            style={{ color: getQualityColor(avgScore) }}
          >
            {avgScore}
          </span>
          <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            综合分
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {gridLevels.map((level, li) => {
            const pts = dimensionKeys
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
                const r = level * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              })
              .join(' ');
            return (
              <polygon
                key={li}
                points={pts}
                fill="none"
                stroke="var(--pixel-border)"
                strokeWidth="1"
                opacity={0.3 + li * 0.1}
              />
            );
          })}

          {dimensionKeys.map((_, i) => {
            const angle = (Math.PI * 2 * i) / numDims - Math.PI / 2;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={center + radius * Math.cos(angle)}
                y2={center + radius * Math.sin(angle)}
                stroke="var(--pixel-border)"
                strokeWidth="1"
                opacity={0.4}
              />
            );
          })}

          <motion.polygon
            points={polygonPoints}
            fill="var(--pixel-info)"
            fillOpacity={0.25}
            stroke="var(--pixel-info)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ transformOrigin: `${center}px ${center}px` }}
          />

          {dimensionKeys.map((key, i) => {
            const pt = getPoint(i, dimensions[key] || 0);
            return (
              <motion.circle
                key={key}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="var(--pixel-info)"
                stroke="var(--pixel-bg-dark)"
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
              />
            );
          })}

          {dimensionKeys.map((key, i) => {
            const pt = getLabelPoint(i);
            const value = dimensions[key] || 0;
            return (
              <g key={`label-${key}`}>
                <text
                  x={pt.x}
                  y={pt.y - 6}
                  textAnchor="middle"
                  className="pixel-font-mono"
                  fontSize="10"
                  fill="var(--pixel-text-primary)"
                >
                  {DIMENSION_LABELS[key]}
                </text>
                <text
                  x={pt.x}
                  y={pt.y + 8}
                  textAnchor="middle"
                  className="pixel-font-display"
                  fontSize="12"
                  fill={getQualityColor(value)}
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </PixelPanel>
  );
};

export default SatisfactionRadar;
