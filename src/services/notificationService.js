// src/services/notificationService.js
import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const COL = 'notifications';

export const createNotification = async ({ userId, title, message, type = 'info' }) => {
  return addDoc(collection(db, COL), {
    userId, title, message, type,
    isRead: false,
    createdAt: serverTimestamp(),
  });
};

export const getUserNotifications = async (userId) => {
  const q = query(collection(db, COL), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const markAsRead = async (id) => updateDoc(doc(db, COL, id), { isRead: true });

export const subscribeToNotifications = (userId, callback) => {
  const q = query(collection(db, COL), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};
