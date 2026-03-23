// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      logout: () => set({ user: null, profile: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);

export default useAuthStore;
