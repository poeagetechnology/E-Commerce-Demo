// src/app/App.jsx
import { useEffect, useState } from 'react';
import AppRouter from '@/routes/AppRouter';
import { useAuthListener } from '@/hooks/useAuth';
import useUIStore from '@/store/uiStore';
import { isSeedRequired, seedDatabase } from '@/services/seedService';
import { Store } from 'lucide-react';

const SeedOverlay = ({ progress }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white dark:bg-gray-950">
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse-slow">
        <Store size={32} className="text-white" />
      </div>
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl mb-1">NexCart</h2>
        <p className="text-sm text-gray-400">Setting up demo data…</p>
      </div>
      <div className="w-64 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-brand-600 rounded-full animate-pulse w-1/2" />
      </div>
      <p className="text-xs text-gray-400">{progress}</p>
    </div>
  </div>
);

const App = () => {
  useAuthListener();
  const { initDarkMode } = useUIStore();
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState('Checking database…');

  useEffect(() => {
    initDarkMode();
  }, []);

  useEffect(() => {
    const runSeed = async () => {
      try {
        const needed = await isSeedRequired();
        if (needed) {
          setSeeding(true);
          await seedDatabase(setProgress);
          setSeeding(false);
        }
      } catch (err) {
        console.warn('Seed skipped:', err.message);
        setSeeding(false);
      }
    };
    runSeed();
  }, []);

  if (seeding) return <SeedOverlay progress={progress} />;

  return <AppRouter />;
};

export default App;
