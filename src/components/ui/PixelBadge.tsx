import React from 'react';
import { motion } from 'framer-motion';

interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const PixelBadge: React.FC<PixelBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const variantClass = `pixel-badge-${variant}`;
  const sizeClass = `pixel-badge-${size}`;

  const content = (
    <span className={`pixel-badge ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );

  if (pulse) {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export default PixelBadge;
