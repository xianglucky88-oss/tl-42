import React from 'react';
import { motion } from 'framer-motion';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const variantClass = `pixel-btn-${variant}`;
  const sizeClass = `pixel-btn-${size}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`pixel-btn ${variantClass} ${sizeClass} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      animate={!disabled ? { opacity: 1 } : { opacity: 0.5 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

export default PixelButton;
