// src/services/seedService.js
// Auto-seeds Firestore with demo data on first load

import {
  collection, doc, setDoc, addDoc, getDocs, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/firebase/firebaseConfig';

const SEED_FLAG_DOC = 'seed_completed';

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '💻', slug: 'electronics', description: 'Latest gadgets and devices' },
  { id: 'clothing', name: 'Clothing', icon: '👗', slug: 'clothing', description: 'Fashion and apparel' },
  { id: 'home', name: 'Home & Garden', icon: '🏡', slug: 'home', description: 'For your home and garden' },
  { id: 'books', name: 'Books', icon: '📚', slug: 'books', description: 'Knowledge and entertainment' },
  { id: 'sports', name: 'Sports & Fitness', icon: '🏋️', slug: 'sports', description: 'Stay active and healthy' },
];

const PRODUCTS = [
  { name: 'MacBook Pro 16"', category: 'electronics', price: 2499, stock: 15, rating: 4.8, sales: 340, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'], description: 'Powerful laptop with M3 Pro chip, 18GB RAM, stunning Liquid Retina XDR display.' },
  { name: 'Sony WH-1000XM5 Headphones', category: 'electronics', price: 349, stock: 42, rating: 4.9, sales: 820, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], description: 'Industry-leading noise cancellation headphones with 30-hour battery life.' },
  { name: 'iPhone 15 Pro', category: 'electronics', price: 999, stock: 30, rating: 4.7, sales: 1200, images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'], description: 'Titanium design, A17 Pro chip, and professional camera system.' },
  { name: 'Samsung 4K OLED TV 55"', category: 'electronics', price: 1299, stock: 8, rating: 4.6, sales: 215, images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500'], description: 'Stunning 4K OLED display with quantum HDR and smart features.' },
  { name: 'iPad Air M2', category: 'electronics', price: 599, stock: 25, rating: 4.7, sales: 450, images: ['https://images.unsplash.com/photo-1544244015-0df4512791a6?w=500'], description: 'Powerful and versatile with M2 chip and all-day battery.' },
  { name: 'Nike Air Max 270', category: 'clothing', price: 150, stock: 60, rating: 4.5, sales: 980, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'], description: 'Lightweight and responsive with Max Air cushioning for all-day comfort.' },
  { name: 'Levi\'s 501 Original Jeans', category: 'clothing', price: 79, stock: 120, rating: 4.4, sales: 1560, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'], description: 'The original and most iconic denim jeans, straight fit.' },
  { name: 'Patagonia Fleece Jacket', category: 'clothing', price: 179, stock: 45, rating: 4.8, sales: 320, images: ['https://images.unsplash.com/photo-1604093542561-43b9e5e63bf2?w=500'], description: 'Sustainable, warm, and perfect for outdoor adventures.' },
  { name: 'Classic Oxford Shirt', category: 'clothing', price: 89, stock: 80, rating: 4.3, sales: 670, images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500'], description: 'Premium cotton Oxford shirt for every occasion.' },
  { name: 'Yoga Pants Set', category: 'clothing', price: 65, stock: 95, rating: 4.6, sales: 890, images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500'], description: 'High-waist, 4-way stretch yoga pants with moisture wicking.' },
  { name: 'Instant Pot Duo 7-in-1', category: 'home', price: 89, stock: 55, rating: 4.8, sales: 2100, images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'], description: 'Multi-use pressure cooker that replaces 7 kitchen appliances.' },
  { name: 'Dyson V15 Vacuum', category: 'home', price: 749, stock: 18, rating: 4.7, sales: 430, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], description: 'Powerful cordless vacuum with laser dust detection.' },
  { name: 'Succulent Plant Collection', category: 'home', price: 35, stock: 200, rating: 4.5, sales: 3200, images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500'], description: 'Beautiful set of 6 assorted succulents in ceramic pots.' },
  { name: 'Bamboo Cutting Board Set', category: 'home', price: 42, stock: 88, rating: 4.6, sales: 780, images: ['https://images.unsplash.com/photo-1568827999250-89e88d543c8e?w=500'], description: 'Eco-friendly bamboo cutting boards in 3 sizes.' },
  { name: 'Smart LED Desk Lamp', category: 'home', price: 55, stock: 70, rating: 4.4, sales: 560, images: ['https://images.unsplash.com/photo-1623718649591-311775a30c43?w=500'], description: 'USB-C charging, adjustable color temperature and brightness.' },
  { name: 'Atomic Habits', category: 'books', price: 18, stock: 300, rating: 4.9, sales: 5400, images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'], description: 'Tiny changes, remarkable results. James Clear\'s bestseller on habit formation.' },
  { name: 'The Design of Everyday Things', category: 'books', price: 22, stock: 150, rating: 4.7, sales: 1800, images: ['https://images.unsplash.com/photo-1589998059171-988d887df646?w=500'], description: 'Don Norman\'s seminal work on user-centered design.' },
  { name: 'Clean Code', category: 'books', price: 35, stock: 200, rating: 4.8, sales: 2300, images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=500'], description: 'A handbook of agile software craftsmanship by Robert C. Martin.' },
  { name: 'Adjustable Dumbbell Set', category: 'sports', price: 299, stock: 22, rating: 4.8, sales: 650, images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500'], description: '5-52.5 lbs adjustable dumbbells with easy weight selection.' },
  { name: 'Yoga Mat Premium', category: 'sports', price: 75, stock: 110, rating: 4.6, sales: 1100, images: ['https://images.unsplash.com/photo-1601925228040-11e8ecde1600?w=500'], description: 'Non-slip, eco-friendly TPE yoga mat with alignment lines.' },
  { name: 'Resistance Bands Set', category: 'sports', price: 29, stock: 180, rating: 4.5, sales: 2400, images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'], description: 'Set of 5 resistance bands for full-body workout.' },
];

const DEMO_USERS = [
  { email: 'superadmin@nexcart.com', password: 'SuperAdmin123!', displayName: 'Super Admin', role: 'superadmin' },
  { email: 'admin@nexcart.com', password: 'Admin123!', displayName: 'John Admin', role: 'admin' },
  { email: 'admin2@nexcart.com', password: 'Admin123!', displayName: 'Sarah Admin', role: 'admin' },
  { email: 'vendor@nexcart.com', password: 'Vendor123!', displayName: 'Tech Vendor', role: 'vendor' },
  { email: 'user1@nexcart.com', password: 'User123!', displayName: 'Alice Johnson', role: 'user' },
  { email: 'user2@nexcart.com', password: 'User123!', displayName: 'Bob Smith', role: 'user' },
  { email: 'user3@nexcart.com', password: 'User123!', displayName: 'Carol White', role: 'user' },
  { email: 'user4@nexcart.com', password: 'User123!', displayName: 'Dave Brown', role: 'user' },
  { email: 'user5@nexcart.com', password: 'User123!', displayName: 'Eva Martinez', role: 'user' },
];

// Check if seeding has been done
export const isSeedRequired = async () => {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.empty;
};

// Main seed function
export const seedDatabase = async (onProgress) => {
  try {
    onProgress?.('Seeding categories...');
    // Seed categories
    for (const cat of CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        createdAt: serverTimestamp(),
      });
    }

    onProgress?.('Seeding products...');
    // Seed products
    const productRefs = {};
    for (const product of PRODUCTS) {
      const ref = await addDoc(collection(db, 'products'), {
        ...product,
        vendorId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      productRefs[product.name] = ref.id;
    }

    onProgress?.('Creating demo users...');
    // Seed users
    const userIds = [];
    for (const u of DEMO_USERS) {
      try {
        const { user } = await createUserWithEmailAndPassword(auth, u.email, u.password);
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: u.email,
          displayName: u.displayName,
          role: u.role,
          isBlocked: false,
          createdAt: serverTimestamp(),
          photoURL: null,
        });
        userIds.push(user.uid);
      } catch {
        // User may already exist, continue
      }
    }

    onProgress?.('Creating sample orders...');
    // Seed sample orders
    const sampleOrders = [
      {
        userId: userIds[4] || 'demo',
        items: [
          { productId: Object.values(productRefs)[0], name: 'MacBook Pro 16"', price: 2499, qty: 1, image: PRODUCTS[0].images[0] },
        ],
        total: 2499,
        status: 'delivered',
        address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' },
      },
      {
        userId: userIds[5] || 'demo',
        items: [
          { productId: Object.values(productRefs)[1], name: 'Sony Headphones', price: 349, qty: 1, image: PRODUCTS[1].images[0] },
          { productId: Object.values(productRefs)[15], name: 'Atomic Habits', price: 18, qty: 2, image: PRODUCTS[15].images[0] },
        ],
        total: 385,
        status: 'shipped',
        address: { street: '456 Oak Ave', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      },
      {
        userId: userIds[6] || 'demo',
        items: [
          { productId: Object.values(productRefs)[18], name: 'Adjustable Dumbbells', price: 299, qty: 1, image: PRODUCTS[18].images[0] },
        ],
        total: 299,
        status: 'processing',
        address: { street: '789 Pine Rd', city: 'Chicago', state: 'IL', zip: '60601', country: 'US' },
      },
    ];

    for (const order of sampleOrders) {
      await addDoc(collection(db, 'orders'), {
        ...order,
        paymentStatus: 'paid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    onProgress?.('Seed complete!');
    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};
