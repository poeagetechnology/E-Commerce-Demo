// src/layouts/VendorLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, LogOut, Store } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { logoutUser } from '@/services/authService';
import DarkModeToggle from '@/components/ui/DarkModeToggle';

const nav = [
  { to: '/vendor/products', label: 'My Products', icon: Package },
  { to: '/vendor/orders', label: 'My Orders', icon: ShoppingCart },
];

const VendorLayout = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <span className="font-display font-bold">Vendor Hub</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`
            }>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <p className="px-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{profile?.displayName}</p>
          <button onClick={async () => { await logoutUser(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
            <LogOut size={16} />Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-end gap-3">
          <DarkModeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
};

export default VendorLayout;
