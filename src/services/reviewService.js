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
  // Fetch without orderBy to avoid needing composite index
  const q = query(collection(db, COL), where('productId', '==', productId));
  const snap = await getDocs(q);
  
  // Client-side sorting by createdAt descending
  const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  reviews.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime; // Descending order
  });
  
  return reviews;
};
