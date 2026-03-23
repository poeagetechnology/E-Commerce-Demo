// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { getProducts } from '@/services/productService';
import ProductCard from '@/components/user/ProductCard';
import useAuthStore from '@/store/authStore';

const HomePage = () => {
  const { profile } = useAuthStore();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ products }, catSnap] = await Promise.all([
          getProducts({ sortBy: 'sales', sortDir: 'desc', pageSize: 8 }),
          getDocs(collection(db, 'categories')),
        ]);
        setFeatured(products);
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-purple-900 p-8 sm:p-14 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4">
            <Zap size={12} /> New arrivals every week
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Welcome back,<br />{profile?.displayName?.split(' ')[0] || 'Shopper'} 👋
          </h1>
          <p className="text-white/70 text-base mb-8">Discover thousands of products at the best prices. Your next favourite thing is just a click away.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 rounded-xl font-semibold hover:bg-brand-50 transition-all active:scale-95">
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
          { icon: Shield, title: 'Secure Payments', desc: '100% protected checkout' },
          { icon: Zap, title: 'Fast Delivery', desc: 'Get it within 2-3 days' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 flex-shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-2xl">Shop by Category</h2>
            <Link to="/products" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 card hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-2xl">Best Sellers</h2>
          <Link to="/products" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-square" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
