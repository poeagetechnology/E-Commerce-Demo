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
  const constraints = [];

  // If filtering by category, fetch without orderBy to avoid needing composite index
  // Client-side sorting will be used instead
  if (category) {
    constraints.push(where('category', '==', category));
  } else {
    // Only use orderBy when not filtering by category (avoids composite index requirement)
    constraints.push(orderBy(sortBy, sortDir));
  }
  
  if (minPrice !== undefined) constraints.push(where('price', '>=', minPrice));
  if (maxPrice !== undefined) constraints.push(where('price', '<=', maxPrice));
  
  constraints.push(limit(pageSize * 2)); // Fetch more to account for client-side sorting
  if (lastDoc && !category) constraints.push(startAfter(lastDoc)); // Pagination only works without filtering

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  
  // Client-side sorting when category filter is applied
  let docs = snap.docs;
  if (category && sortBy) {
    docs.sort((a, b) => {
      const aVal = a.data()[sortBy];
      const bVal = b.data()[sortBy];
      
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Limit after sorting
    docs = docs.slice(0, pageSize);
  }
  
  const lastVisible = docs[docs.length - 1];
  return {
    products: docs.map(d => ({ id: d.id, ...d.data() })),
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
