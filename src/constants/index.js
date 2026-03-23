// src/constants/index.js

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  VENDOR: 'vendor',
  USER: 'user',
};

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const DEMO_CREDENTIALS = [
  { role: 'Super Admin', email: 'superadmin@nexcart.com', password: 'SuperAdmin123!' },
  { role: 'Admin', email: 'admin@nexcart.com', password: 'Admin123!' },
  { role: 'Vendor', email: 'vendor@nexcart.com', password: 'Vendor123!' },
  { role: 'User', email: 'user1@nexcart.com', password: 'User123!' },
];
