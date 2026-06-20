import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import PixelButton from './PixelButton';

interface PixelWindowProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  isOpen: boolean;
  width?: string;
  height?: string;
  className?: string;
}

const PixelWindow: React.FC<PixelWindowProps> = ({
  children,
  title,
  onClose,
  isOpen,
  width = '500px',
  height = 'auto',
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={`pixel-window relative z-10 ${className}`}
        style={{ width, height, maxWidth: '90vw', maxHeight: '90vh' }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="pixel-window-header flex items-center justify-between">
          <span className="pixel-window-title">{title}</span>
          {onClose && (
            <PixelButton
              variant="danger"
              size="sm"
              onClick={onClose}
              className="!p-1 !px-2"
            >
              <X size={12} />
            </PixelButton>
          )}
        </div>
        <div className="pixel-window-content overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default PixelWindow;
