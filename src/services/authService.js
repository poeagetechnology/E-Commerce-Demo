// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase/firebaseConfig';

// Register with email/password
export const registerUser = async ({ email, password, displayName }) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email,
    displayName,
    role: 'user',
    isBlocked: false,
    createdAt: serverTimestamp(),
    photoURL: null,
  });
  return user;
};

// Login with email/password
export const loginUser = async ({ email, password }) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

// Google login
export const loginWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'user',
      isBlocked: false,
      createdAt: serverTimestamp(),
      photoURL: user.photoURL,
    });
  }
  return user;
};

// Logout
export const logoutUser = () => signOut(auth);

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

// Reset password
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
