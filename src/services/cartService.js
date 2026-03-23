// src/services/cartService.js
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const COL = 'carts';

export const getCart = async (userId) => {
  const snap = await getDoc(doc(db, COL, userId));
  return snap.exists() ? snap.data() : { items: [] };
};

export const saveCart = async (userId, items) => {
  return setDoc(doc(db, COL, userId), { items, updatedAt: serverTimestamp() });
};

export const clearCart = async (userId) => {
  return deleteDoc(doc(db, COL, userId));
};
