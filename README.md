# 🛒 NexCart — Enterprise E-Commerce Platform

A production-ready, full-stack e-commerce application built with React + Firebase.

---

## ✨ Features

- **Auth**: Email/Password + Google OAuth, role-based access (Super Admin / Admin / Vendor / User)
- **Smart Seeder**: Auto-seeds 20+ products, 5 categories, 9 demo users, and sample orders on first load
- **Product Catalog**: Search, filter, sort, image gallery, reviews & ratings
- **Cart & Wishlist**: Persistent (Firestore-backed), real-time stock updates
- **Checkout**: Address management, mock payment (success/failure simulation)
- **Order Tracking**: Real-time status updates with visual timeline
- **Admin Dashboard**: Revenue/order charts, product CRUD, user management, order management
- **Vendor Module**: Vendors manage their own products and view orders
- **Notifications**: Real-time bell notifications via Firestore listeners
- **Dark / Light Mode**: Persisted across sessions
- **Cloud Functions**: Stock management, notifications, role validation
- **Firestore Security Rules**: Granular per-collection access control

---

## 🚀 Quick Start

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create project**
2. Enable **Authentication** → Sign-in methods: **Email/Password** + **Google**
3. Enable **Firestore Database** (Start in **test mode** initially, then apply rules)
4. Enable **Storage**
5. (Optional) Enable **Cloud Functions** (requires Blaze plan)

### 2. Get Firebase Config

In your Firebase project → **Project Settings** → **Your apps** → Add a Web App → Copy the config object.

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Install & Run

```bash
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

The app opens at **http://localhost:5173**

On first load, the seeder will automatically create all demo data.

### 5. Build for Production

```bash
npm run build
```

---

## 🗂️ Project Structure

```
src/
├── app/              # Root App component, seed logic
├── components/
│   ├── ui/           # Modal, DataTable, StarRating, PageLoader, DarkModeToggle
│   ├── common/       # Navbar, Footer, NotificationBell
│   ├── admin/        # Admin-specific components
│   └── user/         # ProductCard, etc.
├── constants/        # ROLES, STATUS_COLORS, DEMO_CREDENTIALS
├── features/         # Feature modules (auth, products, etc.)
├── firebase/         # firebaseConfig.js
├── hooks/            # useAuth, useDebounce
├── layouts/          # PublicLayout, UserLayout, AdminLayout, VendorLayout
├── pages/
│   ├── admin/        # Dashboard, Products, Orders, Users, Categories
│   ├── vendor/       # Products, Orders
│   └── *.jsx         # Login, Register, Home, Products, Cart, etc.
├── routes/           # AppRouter with lazy loading + RBAC guards
├── services/         # authService, productService, orderService, etc.
├── store/            # Zustand stores (auth, cart, wishlist, ui)
├── styles/           # globals.css
└── utils/            # formatCurrency, formatDate, debounce, etc.

functions/            # Firebase Cloud Functions
firestore.rules       # Firestore security rules
storage.rules         # Storage security rules
firestore.indexes.json
```

---

## 🔐 Demo Credentials

| Role        | Email                     | Password        |
|-------------|---------------------------|-----------------|
| Super Admin | superadmin@nexcart.com    | SuperAdmin123!  |
| Admin       | admin@nexcart.com         | Admin123!       |
| Vendor      | vendor@nexcart.com        | Vendor123!      |
| User        | user1@nexcart.com         | User123!        |

> These are created automatically by the seeder on first app load.

---

## 📦 Pages & Routes

| Path                   | Access        | Description                    |
|------------------------|---------------|--------------------------------|
| `/login`               | Public        | Login page with demo shortcuts |
| `/register`            | Public        | Registration                   |
| `/home`                | User+         | Homepage with featured products|
| `/products`            | User+         | Full catalog with filters      |
| `/product/:id`         | User+         | Product detail + reviews       |
| `/cart`                | User+         | Shopping cart                  |
| `/wishlist`            | User+         | Saved items                    |
| `/checkout`            | User+         | Checkout + mock payment        |
| `/orders`              | User+         | Order history + live tracking  |
| `/admin/dashboard`     | Admin+        | Charts + KPIs                  |
| `/admin/products`      | Admin+        | Product CRUD                   |
| `/admin/orders`        | Admin+        | Order management               |
| `/admin/users`         | Admin+        | User + role management         |
| `/admin/categories`    | Admin+        | Category management            |
| `/vendor/products`     | Vendor+       | Vendor product management      |
| `/vendor/orders`       | Vendor+       | Vendor order view              |

---

## ☁️ Deploy Cloud Functions

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project)
firebase init

# Deploy functions
cd functions && npm install
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy hosting
npm run build
firebase deploy --only hosting
```

---

## 🔒 Firestore Security Rules

Rules are in `firestore.rules`. Key policies:

- **Products**: Public read, authenticated write (vendors/admins)
- **Orders**: Users read/write their own; admins have full access
- **Carts**: Users access only their own cart
- **Users**: Admins can update roles; users update their own profile
- **Reviews**: Public read; authenticated users write their own

Apply rules:
```bash
firebase deploy --only firestore:rules
```

---

## ⚡ Cloud Functions

| Function              | Trigger               | Description                              |
|-----------------------|-----------------------|------------------------------------------|
| `onOrderCreated`      | Firestore onCreate    | Decrements product stock, sends notification |
| `onOrderStatusUpdated`| Firestore onUpdate    | Sends status change notification         |
| `validateOrder`       | HTTPS Callable        | Validates stock before checkout          |
| `setUserRole`         | HTTPS Callable        | SuperAdmin-only role promotion           |
| `onUserDeleted`       | Auth onDelete         | Cleans up Firestore data                 |

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS        |
| State       | Zustand                             |
| Routing     | React Router v6 (lazy + RBAC)       |
| UI          | Headless UI, Lucide Icons           |
| Charts      | Chart.js + react-chartjs-2          |
| Backend     | Firebase (Auth, Firestore, Storage) |
| Functions   | Firebase Cloud Functions (Node 18)  |
| Deployment  | Firebase Hosting                    |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use for personal and commercial projects.
#   E - C o m m e r c e - D e m o  
 