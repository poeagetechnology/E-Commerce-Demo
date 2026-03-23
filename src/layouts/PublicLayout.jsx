// src/layouts/PublicLayout.jsx
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const PublicLayout = () => {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/home" replace />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
