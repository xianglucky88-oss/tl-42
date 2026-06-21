import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import {
  StartScreen,
  DashboardPage,
  ManagementPage,
  InventoryPage,
  GuestsPage,
  StoryPage,
  SettingsPage,
} from './pages';
import {
  GameContainer,
  Header,
  Sidebar,
} from './components';
import { useGameStore } from './store/useGameStore';
import { useHotelStore } from './store/useHotelStore';
import { useEmployeeStore } from './store/useEmployeeStore';
import { useInventoryStore } from './store/useInventoryStore';
import { useGuestStore } from './store/useGuestStore';
import { useStoryStore } from './store/useStoryStore';
import { useSaveSystem } from './hooks/useSaveSystem';

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const { initAutoSave } = useSaveSystem(
    () => ({
      gameState: useGameStore.getState(),
      hotelState: useHotelStore.getState(),
      employeeState: useEmployeeStore.getState(),
      inventoryState: useInventoryStore.getState(),
      guestState: useGuestStore.getState(),
      storyState: useStoryStore.getState(),
    }),
    () => {}
  );

  useEffect(() => {
    initAutoSave();
    console.log('Game initialized');
  }, [initAutoSave]);

  if (gamePhase === 'start') {
    return <StartScreen />;
  }

  return (
    <Router>
      <GameContainer>
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--pixel-bg-dark)]">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/management" element={<ManagementPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/guests" element={<GuestsPage />} />
              <Route path="/story" element={<StoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </GameContainer>
    </Router>
  );
}

export default App;
