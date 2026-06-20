import React from 'react';
import { motion } from 'framer-motion';

interface PixelPanelProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'dark' | 'light';
  className?: string;
  animate?: boolean;
  headerAction?: React.ReactNode;
}

const PixelPanel: React.FC<PixelPanelProps> = ({
  children,
  title,
  variant = 'default',
  className = '',
  animate = true,
  headerAction,
}) => {
  const variantClass = `pixel-panel-${variant}`;

  const content = (
    <div className={`pixel-panel ${variantClass} ${className}`}>
      {title && (
        <div className="pixel-panel-header flex items-center justify-between">
          <span className="pixel-panel-title">{title}</span>
          {headerAction}
        </div>
      )}
      <div className="pixel-panel-content">{children}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  );
};

export default PixelPanel;
