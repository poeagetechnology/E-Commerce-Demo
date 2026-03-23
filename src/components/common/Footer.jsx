// src/components/common/Footer.jsx
import { Store } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-gray-100 dark:border-gray-800 mt-auto py-8 bg-white dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
          <Store size={12} className="text-white" />
        </div>
        <span className="font-display font-bold text-sm">NexCart</span>
      </div>
      <p className="text-xs text-gray-400">© {new Date().getFullYear()} NexCart Enterprise. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
