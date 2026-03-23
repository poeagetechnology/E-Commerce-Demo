// src/pages/WishlistPage.jsx
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import useWishlistStore from '@/store/wishlistStore';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { user } = useAuthStore();
  const { items, toggle } = useWishlistStore();
  const addItem = useCartStore(s => s.addItem);

  const moveToCart = async (item) => {
    await addItem(user?.uid, { id: item.id, name: item.name, price: item.price, images: [item.image] });
    await toggle(user?.uid, item);
    toast.success('Moved to cart!');
  };

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <Heart size={56} className="text-gray-200 dark:text-gray-700 mb-4" />
      <h2 className="font-display font-bold text-2xl mb-2">Your wishlist is empty</h2>
      <p className="text-gray-400 mb-6">Save items you love to find them later.</p>
      <Link to="/products" className="btn-primary">Explore Products</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-8">Wishlist <span className="text-gray-400 font-normal text-2xl">({items.length})</span></h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="card overflow-hidden group">
            <Link to={`/product/${item.id}`} className="block aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <div className="p-4">
              <Link to={`/product/${item.id}`} className="font-semibold text-sm line-clamp-2 hover:text-brand-600 mb-2 block">{item.name}</Link>
              <p className="font-bold text-brand-600 mb-3">{formatCurrency(item.price)}</p>
              <div className="flex gap-2">
                <button onClick={() => moveToCart(item)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-all">
                  <ShoppingCart size={12} /> Cart
                </button>
                <button onClick={() => toggle(user?.uid, item)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
