// src/store/uiStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      darkMode: false,
      sidebarOpen: false,
      notifications: [],

      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        document.documentElement.classList.toggle('dark', next);
      },

      initDarkMode: () => {
        const dm = get().darkMode;
        document.documentElement.classList.toggle('dark', dm);
      },

      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addNotification: (n) => set(s => ({ notifications: [n, ...s.notifications] })),
      setNotifications: (notifications) => set({ notifications }),
      markRead: (id) =>
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        })),
    }),
    { name: 'ui-store', partialize: (s) => ({ darkMode: s.darkMode }) }
  )
);

export default useUIStore;
