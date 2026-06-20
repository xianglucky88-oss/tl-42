import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Wrench, Coffee, Heart, Skull } from 'lucide-react';
import { getMoodColor } from '../../utils/pixel';

interface PixelAvatarProps {
  name: string;
  role?: 'cleaner' | 'receptionist' | 'engineer' | 'chef' | 'manager' | 'guest';
  mood?: number;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const roleColors: Record<string, string> = {
  cleaner: '#87CEEB',
  receptionist: '#DDA0DD',
  engineer: '#A0522D',
  chef: '#FF6347',
  manager: '#FFD700',
  guest: '#98FB98',
};

const roleIcons: Record<string, React.ReactNode> = {
  cleaner: <Coffee size={16} />,
  receptionist: <Briefcase size={16} />,
  engineer: <Wrench size={16} />,
  chef: <Heart size={16} />,
  manager: <User size={16} />,
  guest: <User size={16} />,
};

const PixelAvatar: React.FC<PixelAvatarProps> = ({
  name,
  role = 'guest',
  mood = 50,
  size = 'md',
  showStatus = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 10 },
    md: { width: 48, height: 48, fontSize: 12 },
    lg: { width: 64, height: 64, fontSize: 14 },
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = roleColors[role] || roleColors.guest;

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.div
        className="pixel-avatar flex items-center justify-center relative"
        style={{
          ...sizeStyles[size],
          backgroundColor: bgColor,
          fontSize: sizeStyles[size].fontSize,
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <span className="pixel-font-mono">{initials}</span>
        {roleIcons[role] && (
          <div className="absolute -bottom-1 -right-1 bg-[var(--pixel-bg-dark)] p-0.5 border-2 border-[var(--pixel-border)]">
            {roleIcons[role]}
          </div>
        )}
      </motion.div>
      {showStatus && mood !== undefined && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 border-2 border-[var(--pixel-border)]"
          style={{ backgroundColor: getMoodColor(mood) }}
          title={`心情: ${mood}/100`}
        />
      )}
    </div>
  );
};

export default PixelAvatar;
