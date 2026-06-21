import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Save, Download, Trash2, Info, Music, Check, AlertCircle, Loader2 } from 'lucide-react';
import {
  PixelPanel,
  PixelButton,
  PixelWindow,
} from '../components';
import { useGameSettings, useGameActions } from '../store/useGameStore';
import { useSaveSystem, SaveStatus } from '../hooks/useSaveSystem';
import { hasSavedGame } from '../utils/storage';

type PixelButtonVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info';

const saveBtnConfig: Record<SaveStatus, { label: string; icon: typeof Save; variant: PixelButtonVariant; spin?: boolean }> = {
  idle: { label: '立即保存', icon: Save, variant: 'success' },
  saving: { label: '保存中...', icon: Loader2, variant: 'primary', spin: true },
  saved: { label: '保存成功', icon: Check, variant: 'success' },
  loading: { label: '读取中...', icon: Loader2, variant: 'info', spin: true },
  loaded: { label: '读取成功', icon: Check, variant: 'success' },
  error: { label: '操作失败', icon: AlertCircle, variant: 'danger' },
};

const loadBtnConfig: Record<SaveStatus, { label: string; icon: typeof Download; variant: PixelButtonVariant; spin?: boolean }> = {
  idle: { label: '读取存档', icon: Download, variant: 'info' },
  saving: { label: '保存中...', icon: Loader2, variant: 'primary', spin: true },
  saved: { label: '读取存档', icon: Download, variant: 'info' },
  loading: { label: '读取中...', icon: Loader2, variant: 'info', spin: true },
  loaded: { label: '读取成功', icon: Check, variant: 'success' },
  error: { label: '操作失败', icon: AlertCircle, variant: 'danger' },
};

const SettingsPage: React.FC = () => {
  const settings = useGameSettings();
  const actions = useGameActions();
  const { saveGame, loadGame, deleteSave, saveStatus, saveError } = useSaveSystem();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const saveCfg = saveBtnConfig[saveStatus];
  const loadCfg = loadBtnConfig[saveStatus];
  const SaveIcon = saveCfg.icon;
  const LoadIcon = loadCfg.icon;
  const isBusy = saveStatus === 'saving' || saveStatus === 'loading';

  const handleToggleSound = () => {
    actions.updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleToggleMusic = () => {
    actions.updateSettings({ musicEnabled: !settings.musicEnabled });
  };

  const handleToggleCRT = () => {
    actions.updateSettings({ crtEffect: !settings.crtEffect });
  };

  const handleToggleAutoSave = () => {
    actions.updateSettings({ autoSave: !settings.autoSave });
  };

  const handleSetDifficulty = (difficulty: 'easy' | 'normal' | 'hard') => {
    actions.updateSettings({ difficulty });
  };

  const handleSetTextSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    actions.updateSettings({ textSpeed: speed });
  };

  const handleClearSave = () => {
    deleteSave();
    setShowClearConfirm(false);
    window.location.reload();
  };

  const difficultyNames: Record<string, string> = {
    easy: '简单',
    normal: '普通',
    hard: '困难',
  };

  const textSpeedNames: Record<string, string> = {
    slow: '慢速',
    normal: '正常',
    fast: '快速',
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Settings size={28} className="text-[var(--pixel-gold)]" />
            <h2 className="pixel-font-display text-2xl text-[var(--pixel-text-primary)]">
              系统设置
            </h2>
          </div>
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
            调整游戏设置，获得最佳体验
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PixelPanel title="音频设置" variant="dark">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.soundEnabled ? (
                      <Volume2 size={20} className="text-[var(--pixel-success)]" />
                    ) : (
                      <VolumeX size={20} className="text-[var(--pixel-text-secondary)]" />
                    )}
                    <div>
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                        音效
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        播放游戏音效
                      </p>
                    </div>
                  </div>
                  <PixelButton
                    variant={settings.soundEnabled ? 'success' : 'default'}
                    onClick={handleToggleSound}
                  >
                    {settings.soundEnabled ? '开启' : '关闭'}
                  </PixelButton>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.musicEnabled ? (
                      <Music size={20} className="text-[var(--pixel-success)]" />
                    ) : (
                      <Music size={20} className="text-[var(--pixel-text-secondary)]" />
                    )}
                    <div>
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                        背景音乐
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        播放游戏背景音乐
                      </p>
                    </div>
                  </div>
                  <PixelButton
                    variant={settings.musicEnabled ? 'success' : 'default'}
                    onClick={handleToggleMusic}
                  >
                    {settings.musicEnabled ? '开启' : '关闭'}
                  </PixelButton>
                </div>
              </div>
            </PixelPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <PixelPanel title="显示设置" variant="dark">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                      CRT 效果
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      复古显像管效果
                    </p>
                  </div>
                  <PixelButton
                    variant={settings.crtEffect ? 'primary' : 'default'}
                    onClick={handleToggleCRT}
                  >
                    {settings.crtEffect ? '开启' : '关闭'}
                  </PixelButton>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                      文字速度
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      对话文字显示速度
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(['slow', 'normal', 'fast'] as const).map(speed => (
                      <PixelButton
                        key={speed}
                        variant={settings.textSpeed === speed ? 'primary' : 'default'}
                        size="sm"
                        onClick={() => handleSetTextSpeed(speed)}
                      >
                        {textSpeedNames[speed]}
                      </PixelButton>
                    ))}
                  </div>
                </div>
              </div>
            </PixelPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PixelPanel title="游戏设置" variant="dark">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                      自动保存
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      定期自动保存游戏进度
                    </p>
                  </div>
                  <PixelButton
                    variant={settings.autoSave ? 'success' : 'default'}
                    onClick={handleToggleAutoSave}
                  >
                    {settings.autoSave ? '开启' : '关闭'}
                  </PixelButton>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                      游戏难度
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      影响经营难度和客人满意度
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(['easy', 'normal', 'hard'] as const).map(diff => (
                      <PixelButton
                        key={diff}
                        variant={settings.difficulty === diff ? 'primary' : 'default'}
                        size="sm"
                        onClick={() => handleSetDifficulty(diff)}
                      >
                        {difficultyNames[diff]}
                      </PixelButton>
                    ))}
                  </div>
                </div>
              </div>
            </PixelPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <PixelPanel title="存档管理" variant="dark">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Save size={20} className="text-[var(--pixel-success)]" />
                    <div>
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                        保存游戏
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        {hasSavedGame() ? '已有存档' : '暂无存档'}
                      </p>
                    </div>
                  </div>
                  <PixelButton
                    variant={saveCfg.variant}
                    onClick={saveGame}
                    disabled={isBusy}
                  >
                    <span className="flex items-center gap-2">
                      <SaveIcon size={14} className={saveCfg.spin ? 'animate-spin' : ''} />
                      {saveCfg.label}
                    </span>
                  </PixelButton>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-[var(--pixel-info)]" />
                    <div>
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                        读取存档
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        加载最近保存的游戏进度
                      </p>
                    </div>
                  </div>
                  <PixelButton
                    variant={loadCfg.variant}
                    onClick={loadGame}
                    disabled={!hasSavedGame() || isBusy}
                  >
                    <span className="flex items-center gap-2">
                      <LoadIcon size={14} className={loadCfg.spin ? 'animate-spin' : ''} />
                      {loadCfg.label}
                    </span>
                  </PixelButton>
                </div>

                <AnimatePresence>
                  {saveError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="pixel-panel pixel-panel-danger p-3"
                    >
                      <p className="pixel-font-mono text-xs text-[var(--pixel-danger)] flex items-center gap-2">
                        <AlertCircle size={14} />
                        {saveError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} className="text-[var(--pixel-danger)]" />
                    <div>
                      <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                        删除存档
                      </p>
                      <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                        清除所有游戏进度
                      </p>
                    </div>
                  </div>
                  <PixelButton
                    variant="danger"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={!hasSavedGame()}
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 size={14} />
                      删除存档
                    </span>
                  </PixelButton>
                </div>
              </div>
            </PixelPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PixelPanel title="关于游戏" variant="dark">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-[var(--pixel-info)]" />
                  <div>
                    <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
                      百年酒店
                    </p>
                    <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
                      v1.0.0 · 像素风格管理叙事游戏
                    </p>
                  </div>
                </div>
                <PixelButton variant="info" onClick={() => setShowAbout(true)}>
                  查看详情
                </PixelButton>
              </div>
            </PixelPanel>
          </motion.div>
        </div>
      </div>

      <PixelWindow
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认删除存档"
        width="400px"
      >
        <div className="space-y-4">
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)]">
            确定要删除所有游戏存档吗？此操作不可撤销！
          </p>
          <div className="flex gap-3">
            <PixelButton
              variant="default"
              className="flex-1"
              onClick={() => setShowClearConfirm(false)}
            >
              取消
            </PixelButton>
            <PixelButton
              variant="danger"
              className="flex-1"
              onClick={handleClearSave}
            >
              确认删除
            </PixelButton>
          </div>
        </div>
      </PixelWindow>

      <PixelWindow
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="关于百年酒店"
        width="500px"
      >
        <div className="space-y-4 text-center">
          <h3 className="pixel-font-display text-2xl text-[var(--pixel-gold)]">
            百年酒店
          </h3>
          <p className="pixel-font-mono text-sm text-[var(--pixel-text-secondary)]">
            CENTURY HOTEL
          </p>
          <div className="w-24 h-1 bg-[var(--pixel-gold)] mx-auto" />
          <div className="pixel-panel pixel-panel-light p-4">
            <p className="pixel-font-mono text-sm text-[var(--pixel-text-primary)] leading-relaxed">
              一款像素风格的复古管理叙事游戏。
              <br /><br />
              你接手了一家有着百年历史的老牌酒店，
              在经营管理的同时，揭开这家酒店尘封的往事。
              <br /><br />
              管理员工、服务客人、收集线索、解开谜团...
              <br />
              你能发现百年酒店隐藏的秘密吗？
            </p>
          </div>
          <p className="pixel-font-mono text-xs text-[var(--pixel-text-secondary)]">
            © 2024 Pixel Studio · 用像素讲述故事
          </p>
          <PixelButton
            variant="primary"
            className="w-full"
            onClick={() => setShowAbout(false)}
          >
            关闭
          </PixelButton>
        </div>
      </PixelWindow>
    </div>
  );
};

export default SettingsPage;
