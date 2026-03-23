// src/services/userService.js
import {
  collection, doc, getDocs, updateDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const COL = 'users';

export const getAllUsers = async () => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = async (uid, role) => {
  return updateDoc(doc(db, COL, uid), { role, updatedAt: serverTimestamp() });
};

export const toggleBlockUser = async (uid, isBlocked) => {
  return updateDoc(doc(db, COL, uid), { isBlocked, updatedAt: serverTimestamp() });
};

export const updateWishlist = async (uid, wishlist) => {
  return updateDoc(doc(db, COL, uid), { wishlist, updatedAt: serverTimestamp() });
};

export const getWishlist = async (uid) => {
  const { getUserProfile } = await import('./authService.js');
  const profile = await getUserProfile(uid);
  return profile?.wishlist || [];
};
