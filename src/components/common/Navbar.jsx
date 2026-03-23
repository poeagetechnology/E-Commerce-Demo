// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Store, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { logoutUser } from '@/services/authService';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import NotificationBell from '@/components/common/NotificationBell';
import { ROLES } from '@/constants';

const Navbar = () => {
  const { user, profile } = useAuthStore();
  const cartCount = useCartStore(s => s.items.reduce((a, i) => a + i.qty, 0));
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const isAdmin = profile?.role === ROLES.ADMIN || profile?.role === ROLES.SUPERADMIN;
  const isVendor = profile?.role === ROLES.VENDOR;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">NexCart</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link to="/home" className="btn-ghost text-sm">Home</Link>
            <Link to="/products" className="btn-ghost text-sm">Products</Link>
          </nav>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <NotificationBell />

            <Link to="/wishlist" className="btn-ghost relative p-2">
              <Heart size={20} />
            </Link>

            <Link to="/cart" className="btn-ghost relative p-2">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-brand-600 text-white text-xs rounded-full font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link to="/admin/dashboard" className="btn-ghost p-2 text-brand-600" title="Admin Dashboard">
                <LayoutDashboard size={20} />
              </Link>
            )}
            {isVendor && (
              <Link to="/vendor/products" className="btn-ghost p-2 text-emerald-600" title="Vendor Hub">
                <Store size={20} />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 btn-ghost px-3 py-2"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                  {profile?.displayName?.[0]?.toUpperCase() || <User size={14} />}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-24 truncate">
                  {profile?.displayName?.split(' ')[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 card shadow-lg py-1 animate-fade-in z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium truncate">{profile?.displayName}</p>
                    <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
                  </div>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    Orders
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
