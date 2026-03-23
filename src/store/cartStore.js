// src/store/cartStore.js
import { create } from 'zustand';
import { getCart, saveCart } from '@/services/cartService';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  loadCart: async (userId) => {
    set({ loading: true });
    try {
      const cart = await getCart(userId);
      set({ items: cart.items || [] });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (userId, product, qty = 1) => {
    const { items } = get();
    const existing = items.find(i => i.productId === product.id);
    let updated;
    if (existing) {
      updated = items.map(i =>
        i.productId === product.id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      updated = [...items, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        qty,
      }];
    }
    set({ items: updated });
    if (userId) await saveCart(userId, updated);
  },

  removeItem: async (userId, productId) => {
    const updated = get().items.filter(i => i.productId !== productId);
    set({ items: updated });
    if (userId) await saveCart(userId, updated);
  },

  updateQty: async (userId, productId, qty) => {
    if (qty <= 0) return get().removeItem(userId, productId);
    const updated = get().items.map(i => i.productId === productId ? { ...i, qty } : i);
    set({ items: updated });
    if (userId) await saveCart(userId, updated);
  },

  clearCart: () => set({ items: [] }),

  get total() {
    return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  get count() {
    return get().items.reduce((sum, i) => sum + i.qty, 0);
  },
}));

export default useCartStore;
