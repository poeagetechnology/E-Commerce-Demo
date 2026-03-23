// src/routes/AppRouter.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { ROLES } from '@/constants';
import PageLoader from '@/components/ui/PageLoader';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import VendorLayout from '@/layouts/VendorLayout';

// Lazy pages
const Login = lazy(() => import('@/pages/LoginPage'));
const Register = lazy(() => import('@/pages/RegisterPage'));
const Home = lazy(() => import('@/pages/HomePage'));
const Products = lazy(() => import('@/pages/ProductsPage'));
const ProductDetail = lazy(() => import('@/pages/ProductDetailPage'));
const Cart = lazy(() => import('@/pages/CartPage'));
const Wishlist = lazy(() => import('@/pages/WishlistPage'));
const Checkout = lazy(() => import('@/pages/CheckoutPage'));
const Orders = lazy(() => import('@/pages/OrdersPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('@/pages/admin/ProductsPage'));
const AdminOrders = lazy(() => import('@/pages/admin/OrdersPage'));
const AdminUsers = lazy(() => import('@/pages/admin/UsersPage'));
const AdminCategories = lazy(() => import('@/pages/admin/CategoriesPage'));

// Vendor pages
const VendorProducts = lazy(() => import('@/pages/vendor/ProductsPage'));
const VendorOrders = lazy(() => import('@/pages/vendor/OrdersPage'));

// Protected route wrapper
const Protected = ({ children, roles }) => {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/home" replace />;
  return children;
};

const AppRouter = () => {
  const { user, loading } = useAuthStore();

  if (loading) return <PageLoader />;

  return (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* User */}
      <Route element={<UserLayout />}>
        <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
        <Route path="/home" element={<Protected><Home /></Protected>} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Protected><Cart /></Protected>} />
        <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/orders" element={<Protected><Orders /></Protected>} />
      </Route>

      {/* Admin */}
      <Route element={
        <Protected roles={[ROLES.ADMIN, ROLES.SUPERADMIN]}>
          <AdminLayout />
        </Protected>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
      </Route>

      {/* Vendor */}
      <Route element={
        <Protected roles={[ROLES.VENDOR, ROLES.ADMIN, ROLES.SUPERADMIN]}>
          <VendorLayout />
        </Protected>
      }>
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </Suspense>
  );
};

export default AppRouter;
