// src/components/ui/PageLoader.jsx
import { Store } from 'lucide-react';

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950 z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse-slow">
        <Store size={28} className="text-white" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
    </div>
  </div>
);

export default PageLoader;
