// src/hooks/useAuth.js
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { getUserProfile } from '@/services/authService';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';

export const useAuthListener = () => {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const loadCart = useCartStore(s => s.loadCart);
  const setWishlist = useWishlistStore(s => s.setItems);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setProfile(profile);
        loadCart(user.uid);
        setWishlist(profile?.wishlist || []);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);
};

export default useAuthStore;
