import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, Bed, Utensils, Sparkles, Wrench } from 'lucide-react';
import { useHotelStore } from '../../store/useHotelStore';
import { useEmployeeStore } from '../../store/useEmployeeStore';
import { useGuestStore } from '../../store/useGuestStore';
import { PixelPanel, PixelBadge } from '../ui';

const HotelStatus: React.FC = () => {
  const { hotel } = useHotelStore();
  const { employees } = useEmployeeStore();
  const { guests } = useGuestStore();

  const occupiedRooms = hotel.rooms.filter(r => r.isOccupied).length;
  const availableRooms = hotel.rooms.length - occupiedRooms;
  const workingEmployees = employees.filter(e => e.assignedArea && e.stamina > 20).length;
  const currentGuests = guests.filter(g => g.status === 'staying').length;

  const facilities = [
    {
      icon: Bed,
      name: '客房',
      value: `${occupiedRooms}/${hotel.rooms.length}`,
      status: availableRooms > 2 ? 'success' : 'warning',
      description: availableRooms > 0 ? `${availableRooms}间可用` : '已满房',
    },
    {
      icon: Utensils,
      name: '餐厅',
      value: hotel.facilities.find(f => f.id === 'restaurant')?.condition || 0,
      status: 'info',
      description: '营业中',
    },
    {
      icon: Sparkles,
      name: '花园',
      value: hotel.facilities.find(f => f.id === 'garden')?.condition || 0,
      status: 'info',
      description: '开放中',
    },
    {
      icon: Wrench,
      name: '设施',
      value: Math.round(hotel.facilities.reduce((sum, f) => sum + f.condition, 0) / hotel.facilities.length),
      status: 'success',
      description: '状态良好',
    },
  ];

  return (
    <PixelPanel title="酒店运营状况" variant="dark">
      <div className="grid grid-cols-2 gap-3">
        <div className="pixel-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-[var(--pixel-info)]" />
            <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
              当前客人
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="pixel-font-display text-2xl text-[var(--pixel-info)]">
              {currentGuests}
            </span>
            <PixelBadge variant="info" size="sm">
              入住中
            </PixelBadge>
          </div>
        </div>

        <div className="pixel-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Building size={16} className="text-[var(--pixel-success)]" />
            <span className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
              在岗员工
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="pixel-font-display text-2xl text-[var(--pixel-success)]">
              {workingEmployees}
            </span>
            <PixelBadge variant={workingEmployees >= 3 ? 'success' : 'warning'} size="sm">
              {workingEmployees >= 3 ? '充足' : '不足'}
            </PixelBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {facilities.map((facility, index) => {
          const Icon = facility.icon;
          return (
            <motion.div
              key={facility.name}
              className="flex items-center justify-between bg-[var(--pixel-bg-dark)] px-3 py-2 border-2 border-[var(--pixel-border)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-[var(--pixel-text-secondary)]" />
                <div>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-primary)]">
                    {facility.name}
                  </p>
                  <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                    {facility.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`pixel-font-display text-lg ${
                  facility.status === 'success' ? 'text-[var(--pixel-success)]' :
                  facility.status === 'warning' ? 'text-[var(--pixel-warning)]' :
                  'text-[var(--pixel-info)]'
                }`}>
                  {typeof facility.value === 'number' ? `${facility.value}%` : facility.value}
                </span>
                {typeof facility.value === 'number' && (
                  <div className="w-16 h-2 bg-[var(--pixel-bg-medium)]">
                    <motion.div
                      className={`h-full ${
                        facility.status === 'success' ? 'bg-[var(--pixel-success)]' :
                        facility.status === 'warning' ? 'bg-[var(--pixel-warning)]' :
                        'bg-[var(--pixel-info)]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${facility.value}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </PixelPanel>
  );
};

export default HotelStatus;
