// src/components/user/ProductCard.jsx
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import { formatCurrency } from '@/utils';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wished = has(product.id);

  const handleAddCart = async (e) => {
    e.preventDefault();
    await addItem(user?.uid, product);
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    await toggle(user?.uid, product);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  return (
    <Link to={`/product/${product.id}`} className="group card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 badge bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-gray-800 text-white text-sm px-3 py-1.5">Out of Stock</span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all ${wished ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
        >
          <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-brand-600 font-medium capitalize mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-gray-500">{product.rating} ({product.sales} sold)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-base">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAddCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <ShoppingCart size={12} /> Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
