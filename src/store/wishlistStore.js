// src/store/wishlistStore.js
import { create } from 'zustand';
import { updateWishlist } from '@/services/userService';

const useWishlistStore = create((set, get) => ({
  items: [],

  setItems: (items) => set({ items }),

  toggle: async (userId, product) => {
    const { items } = get();
    const exists = items.find(i => i.id === product.id);
    const updated = exists
      ? items.filter(i => i.id !== product.id)
      : [...items, { id: product.id, name: product.name, price: product.price, image: product.images?.[0] }];
    set({ items: updated });
    if (userId) await updateWishlist(userId, updated);
  },

  has: (id) => get().items.some(i => i.id === id),
}));

export default useWishlistStore;
