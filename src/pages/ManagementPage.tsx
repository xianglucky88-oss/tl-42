import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MapPin, RefreshCw, CalendarDays } from 'lucide-react';
import {
  EmployeeCard,
  PixelPanel,
  PixelButton,
  PixelBadge,
  PixelWindow,
  ScheduleBoard,
} from '../components';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { AreaType } from '../types/game';
import { INITIAL_EMPLOYEES } from '../data/employees';

const areaNames: Record<AreaType, string> = {
  lobby: '大堂',
  rooms: '客房',
  restaurant: '餐厅',
  garden: '花园',
  kitchen: '厨房',
  maintenance: '维修',
  unassigned: '未分配',
};

type TabType = 'assign' | 'schedule';

const ManagementPage: React.FC = () => {
  const { employees, assignEmployee, restAllEmployees } = useEmployeeStore();
  const [selectedArea, setSelectedArea] = useState<AreaType | 'all'>('all');
  const [showRestConfirm, setShowRestConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  const filteredEmployees = selectedArea === 'all'
    ? employees
    : employees.filter(e => e.assignedArea === selectedArea);

  const areaStats = Object.entries(areaNames).map(([area, name]) => ({
    area: area as AreaType,
    name,
    count: employees.filter(e => e.assignedArea === area).length,
  }));

  const handleRestAll = () => {
    restAllEmployees();
    setShowRestConfirm(false);
  };

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
                日常管理
              </h2>
              <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                管理员工分配，确保酒店正常运营
              </p>
            </div>
            <div className="flex gap-3">
              <PixelButton
                variant="default"
                onClick={() => setShowRestConfirm(true)}
              >
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} />
                  全员休息
                </span>
              </PixelButton>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <PixelButton
            variant={activeTab === 'schedule' ? 'primary' : 'default'}
            onClick={() => setActiveTab('schedule')}
          >
            <span className="flex items-center gap-2">
              <CalendarDays size={14} />
              排班管理
            </span>
          </PixelButton>
          <PixelButton
            variant={activeTab === 'assign' ? 'primary' : 'default'}
            onClick={() => setActiveTab('assign')}
          >
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              区域分配
            </span>
          </PixelButton>
        </motion.div>

        {activeTab === 'schedule' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <PixelPanel animate={false}>
              <div className="p-4">
                <ScheduleBoard />
              </div>
            </PixelPanel>
          </motion.div>
        )}

        {activeTab === 'assign' && (
          <>
            <motion.div
              className="grid grid-cols-6 gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PixelButton
                variant={selectedArea === 'all' ? 'primary' : 'default'}
                onClick={() => setSelectedArea('all')}
                className="justify-center"
              >
                <span className="flex items-center gap-2">
                  <Users size={14} />
                  全部 ({employees.length})
                </span>
              </PixelButton>
              {areaStats.map(stat => (
                <PixelButton
                  key={stat.area}
                  variant={selectedArea === stat.area ? 'success' : 'default'}
                  onClick={() => setSelectedArea(stat.area)}
                  className="justify-center"
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={14} />
                    {stat.name} ({stat.count})
                  </span>
                </PixelButton>
              ))}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <EmployeeCard employee={employee} />
                </motion.div>
              ))}
            </motion.div>

            {filteredEmployees.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Users size={48} className="text-[var(--pixel-text-secondary)] mx-auto mb-4" />
                <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
                  该区域暂无员工
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      <PixelWindow
        isOpen={showRestConfirm}
        onClose={() => setShowRestConfirm(false)}
        title="确认全员休息"
        width="400px"
      >
        <div className="space-y-4">
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
            让所有员工休息将恢复他们的体力和心情，但会影响今日的服务质量。确定要这么做吗？
          </p>
          <div className="flex gap-3">
            <PixelButton
              variant="default"
              className="flex-1"
              onClick={() => setShowRestConfirm(false)}
            >
              取消
            </PixelButton>
            <PixelButton
              variant="success"
              className="flex-1"
              onClick={handleRestAll}
            >
              确认
            </PixelButton>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};

export default ManagementPage;
