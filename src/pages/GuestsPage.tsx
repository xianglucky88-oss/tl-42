import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserPlus, Clock, Star } from 'lucide-react';
import {
  GuestCard,
  PixelPanel,
  PixelButton,
  PixelBadge,
} from '../components';
import { useCurrentGuests } from '../store/useGuestStore';
import { useCurrentDay } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';

const statusNames: Record<string, string> = {
  all: '全部',
  checking_in: '入住中',
  staying: '入住中',
  checking_out: '退房中',
  left: '已离开',
};

const GuestsPage: React.FC = () => {
  const guests = useCurrentGuests();
  const currentDay = useCurrentDay();
  const { addRandomGuest } = useGameLoop();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const statusFilters = ['all', 'checking_in', 'staying', 'checking_out', 'left'];

  const filteredGuests = selectedStatus === 'all'
    ? guests
    : guests.filter(g => g.status === selectedStatus);

  const currentGuests = guests.filter(g => g.status !== 'left');
  const satisfiedGuests = guests.filter(g => g.satisfaction >= 80);
  const vipGuests = guests.filter(g => g.isVIP);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)] mb-1">
                客人接待
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                接待客人，满足他们的需求，发现他们的秘密
              </p>
            </div>
            <div className="flex gap-3">
              <PixelButton
                variant="primary"
                onClick={() => {
                  addRandomGuest();
                }}
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={14} />
                  随机接待
                </span>
              </PixelButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <UserCheck size={24} className="text-[var(--pixel-info)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  当前客人
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-info)]">
                  {currentGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-3">
              <Star size={24} className="text-[var(--pixel-success)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  满意度≥80
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-success)]">
                  {satisfiedGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Star size={24} className="text-[var(--pixel-gold)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  VIP客人
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-gold)]">
                  {vipGuests.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="pixel-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-[var(--pixel-text-secondary)]" />
              <div>
                <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                  累计接待
                </p>
                <p className="pixel-font-display text-xl text-[var(--pixel-text-secondary)]">
                  {guests.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {statusFilters.map(status => (
            <PixelButton
              key={status}
              variant={selectedStatus === status ? 'primary' : 'default'}
              onClick={() => setSelectedStatus(status)}
              size="sm"
            >
              {statusNames[status]}
            </PixelButton>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GuestCard guest={guest} />
            </motion.div>
          ))}
        </motion.div>

        {filteredGuests.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <UserCheck size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
              暂无客人
            </p>
            <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)] mt-1">
              点击"随机接待"来迎接新客人
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GuestsPage;
