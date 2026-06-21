import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hotel, Play, BookOpen, Settings, Trash2 } from 'lucide-react';
import { PixelButton, PixelPanel, PixelWindow } from '../components';
import { useGameStore, useGameSettings } from '../store/useGameStore';
import { useHotelStore } from '../store/useHotelStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useGuestStore } from '../store/useGuestStore';
import { useStoryStore } from '../store/useStoryStore';
import { useSaveSystem } from '../hooks/useSaveSystem';
import { hasSavedGame } from '../utils/storage';

const StartScreen: React.FC = () => {
  const { actions } = useGameStore();
  const settings = useGameSettings();
  const { loadGame, saveGame, deleteSave } = useSaveSystem(
    () => ({
      gameState: useGameStore.getState(),
      hotelState: useHotelStore.getState(),
      employeeState: useEmployeeStore.getState(),
      inventoryState: useInventoryStore.getState(),
      guestState: useGuestStore.getState(),
      storyState: useStoryStore.getState(),
    }),
    (data) => {
      if (data.gameState) {
        const gs = data.gameState as any;
        useGameStore.setState({
          currentDay: gs.currentDay,
          currentPhase: gs.currentPhase,
          gamePhase: gs.gamePhase,
          isPaused: gs.isPaused,
          settings: gs.settings,
        });
      }
      if (data.hotelState && Object.keys(data.hotelState as object).length > 0) {
        const hs = data.hotelState as any;
        useHotelStore.setState({
          money: hs.money,
          reputation: hs.reputation,
          rating: hs.rating,
          rooms: hs.rooms,
          facilities: hs.facilities,
          hotel: hs.hotel,
          dailyStats: hs.dailyStats,
          dailyStatsHistory: hs.dailyStatsHistory,
        });
      }
      if (data.employeeState && Object.keys(data.employeeState as object).length > 0) {
        const es = data.employeeState as any;
        useEmployeeStore.setState({ employees: es.employees });
      }
      if (data.inventoryState && Object.keys(data.inventoryState as object).length > 0) {
        const is = data.inventoryState as any;
        useInventoryStore.setState({ items: is.items, orders: is.orders, suppliers: is.suppliers });
      }
      if (data.guestState && Object.keys(data.guestState as object).length > 0) {
        const gs = data.guestState as any;
        useGuestStore.setState({ currentGuests: gs.currentGuests, guests: gs.guests });
      }
      if (data.storyState && Object.keys(data.storyState as object).length > 0) {
        const ss = data.storyState as any;
        useStoryStore.setState({
          discoveredClues: ss.discoveredClues,
          storyFragments: ss.storyFragments,
          progress: ss.progress,
        });
      }
      console.log('Save loaded and restored:', data);
    }
  );
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const hasSave = hasSavedGame();

  const handleNewGame = () => {
    if (hasSave) {
      setShowNewGameConfirm(true);
    } else {
      actions.startNewGame();
    }
  };

  const confirmNewGame = () => {
    deleteSave();
    actions.startNewGame();
    setShowNewGameConfirm(false);
  };

  const handleContinue = () => {
    loadGame();
    actions.setGamePhase('playing');
  };

  return (
    <div className={`min-h-screen bg-[var(--pixel-bg-dark)] flex items-center justify-center p-8 ${settings.crtEffect ? 'pixel-crt-effect' : ''}`}>
      {settings.crtEffect && <div className="crt-overlay fixed inset-0 pointer-events-none z-50" />}
      
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: [1, 0.9, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Hotel size={80} className="text-[var(--pixel-gold)] mx-auto mb-4" />
          </motion.div>
          <h1 className="pixel-font-display text-5xl text-[var(--pixel-gold)] mb-4 animate-pixelGlow">
            百年酒店
          </h1>
          <p className="pixel-font-mono text-lg text-[var(--pixel-text-secondary)] mb-2">
            CENTURY HOTEL
          </p>
          <motion.div
            className="w-32 h-1 bg-[var(--pixel-gold)] mx-auto"
            initial={{ width: 0 }}
            animate={{ width: '8rem' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)] mt-6 max-w-md mx-auto">
            1924 - 2024
          </p>
        </div>

        <PixelPanel variant="dark" className="mb-6">
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] text-center leading-relaxed">
            你接手了这家有着百年历史的老牌酒店。
            <br />
            曾经的辉煌早已褪去，如今它摇摇欲坠。
            <br />
            <span className="text-[var(--pixel-gold)]">
              管理员工、服务客人、探索秘密...
            </span>
            <br />
            你能揭开这家酒店尘封的往事吗？
          </p>
        </PixelPanel>

        <div className="space-y-3">
          <PixelButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleNewGame}
          >
            <span className="flex items-center justify-center gap-3">
              <Play size={20} />
              开始新游戏
            </span>
          </PixelButton>

          {hasSave && (
            <PixelButton
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleContinue}
            >
              <span className="flex items-center justify-center gap-3">
                <BookOpen size={20} />
                继续游戏
              </span>
            </PixelButton>
          )}

          {hasSave && (
            <PixelButton
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                deleteSave();
                window.location.reload();
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Trash2 size={14} />
                删除存档
              </span>
            </PixelButton>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            v1.0.0 · 像素风格管理叙事游戏
          </p>
        </div>
      </motion.div>

      <PixelWindow
        isOpen={showNewGameConfirm}
        onClose={() => setShowNewGameConfirm(false)}
        title="确认开始新游戏"
        width="400px"
      >
        <div className="space-y-4">
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
            检测到已有存档。开始新游戏将覆盖当前存档，是否继续？
          </p>
          <div className="flex gap-3">
            <PixelButton
              variant="default"
              className="flex-1"
              onClick={() => setShowNewGameConfirm(false)}
            >
              取消
            </PixelButton>
            <PixelButton
              variant="danger"
              className="flex-1"
              onClick={confirmNewGame}
            >
              确认
            </PixelButton>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};

export default StartScreen;
