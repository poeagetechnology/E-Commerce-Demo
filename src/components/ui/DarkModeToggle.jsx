// src/components/ui/DarkModeToggle.jsx
import { Sun, Moon } from 'lucide-react';
import useUIStore from '@/store/uiStore';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useUIStore();
  return (
    <button onClick={toggleDarkMode} className="btn-ghost p-2" aria-label="Toggle dark mode">
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default DarkModeToggle;
