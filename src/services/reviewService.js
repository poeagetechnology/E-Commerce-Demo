// src/services/reviewService.js
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const COL = 'reviews';

export const addReview = async ({ productId, userId, userName, rating, comment }) => {
  return addDoc(collection(db, COL), {
    productId, userId, userName, rating, comment,
    createdAt: serverTimestamp(),
  });
};

export const getProductReviews = async (productId) => {
  const q = query(collection(db, COL), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
