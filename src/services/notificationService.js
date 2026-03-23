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
  // Fetch without orderBy to avoid needing composite index
  const q = query(collection(db, COL), where('userId', '==', userId));
  const snap = await getDocs(q);
  
  // Client-side sorting by createdAt descending
  const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  notifications.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  
  return notifications;
};

export const markAsRead = async (id) => updateDoc(doc(db, COL, id), { isRead: true });

export const subscribeToNotifications = (userId, callback) => {
  // Fetch without orderBy to avoid needing composite index
  const q = query(collection(db, COL), where('userId', '==', userId));
  return onSnapshot(q, (snap) => {
    // Client-side sorting by createdAt descending
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(notifications);
  });
};
