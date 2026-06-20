import React from 'react';
import { motion } from 'framer-motion';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GameContainer: React.FC<GameContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-[var(--pixel-bg-dark)]">
      <div className="crt-overlay fixed inset-0 pointer-events-none z-50" />
      <motion.div
        className={`relative z-10 flex flex-col min-h-screen ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default GameContainer;
