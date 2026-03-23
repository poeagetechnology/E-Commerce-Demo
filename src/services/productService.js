// src/services/productService.js
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/firebaseConfig';

const COL = 'products';

// Get all products with optional filters
export const getProducts = async ({ category, minPrice, maxPrice, sortBy = 'createdAt', sortDir = 'desc', pageSize = 20, lastDoc } = {}) => {
  let q = collection(db, COL);
  const constraints = [];

  if (category) constraints.push(where('category', '==', category));
  if (minPrice !== undefined) constraints.push(where('price', '>=', minPrice));
  if (maxPrice !== undefined) constraints.push(where('price', '<=', maxPrice));
  constraints.push(orderBy(sortBy, sortDir));
  constraints.push(limit(pageSize));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  const lastVisible = snap.docs[snap.docs.length - 1];
  return {
    products: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastVisible,
  };
};

// Get single product
export const getProduct = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Create product
export const createProduct = async (data) => {
  return addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
};

// Update product
export const updateProduct = async (id, data) => {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
};

// Delete product
export const deleteProduct = async (id) => {
  return deleteDoc(doc(db, COL, id));
};

// Upload product image
export const uploadProductImage = async (file, productId) => {
  const storageRef = ref(storage, `products/${productId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Delete product image
export const deleteProductImage = async (url) => {
  const fileRef = ref(storage, url);
  return deleteObject(fileRef);
};

// Real-time listener for stock
export const subscribeToProduct = (id, callback) => {
  return onSnapshot(doc(db, COL, id), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

// Get products by vendor
export const getVendorProducts = async (vendorId) => {
  const q = query(collection(db, COL), where('vendorId', '==', vendorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
