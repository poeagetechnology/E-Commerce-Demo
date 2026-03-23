// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Star, Package } from 'lucide-react';
import { getProduct } from '@/services/productService';
import { getProductReviews, addReview } from '@/services/reviewService';
import { subscribeToProduct } from '@/services/productService';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import StarRating from '@/components/ui/StarRating';
import { formatCurrency, formatDate, calcAvgRating } from '@/utils';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user, profile } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const wished = product ? has(product.id) : false;

  useEffect(() => {
    const loadAll = async () => {
      const [prod, revs] = await Promise.all([getProduct(id), getProductReviews(id)]);
      setProduct(prod);
      setReviews(revs);
      setLoading(false);
    };
    loadAll();
    // Real-time stock
    const unsub = subscribeToProduct(id, (prod) => setProduct(prod));
    return unsub;
  }, [id]);

  const handleAddCart = async () => {
    await addItem(user?.uid, product, qty);
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  const handleWishlist = async () => {
    await toggle(user?.uid, product);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview({ productId: id, userId: user.uid, userName: profile.displayName, ...reviewForm });
      const revs = await getProductReviews(id);
      setReviews(revs);
      setReviewForm({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-8 w-3/4" /><div className="skeleton h-5 w-1/4" /><div className="skeleton h-20 w-full" /><div className="skeleton h-12 w-1/3" />
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>;

  const avg = calcAvgRating(reviews);

  return (
    <div className="animate-fade-in">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
            <img src={product.images?.[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-brand-500' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs text-brand-600 font-medium capitalize mb-2">{product.category}</p>
            <h1 className="font-display font-bold text-3xl leading-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={14} className={n <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{avg} ({reviews.length} reviews)</span>
              <span className="text-xs text-gray-400">• {product.sales} sold</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-4xl text-brand-600">{formatCurrency(product.price)}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className={product.stock > 0 ? 'text-green-500' : 'text-red-500'} />
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left!`}
              </span>
            ) : <span className="text-red-500 font-medium">Out of Stock</span>}
          </div>

          {/* Qty + Actions */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">−</button>
                <span className="px-4 py-2 font-semibold text-sm min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">+</button>
              </div>
              <button onClick={handleAddCart} className="btn-primary flex-1 gap-2">
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button onClick={handleWishlist}
                className={`p-2.5 rounded-xl border transition-all ${wished ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-gray-700 hover:border-red-200 hover:text-red-400'}`}>
                <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14 border-t border-gray-100 dark:border-gray-800 pt-10">
        <h2 className="font-display font-bold text-2xl mb-8">Reviews ({reviews.length})</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Write review */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-gray-500">Rating</label>
                <StarRating value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">Comment</label>
                <textarea required rows={3} className="input resize-none" placeholder="Share your experience…"
                  value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 py-8 text-center">No reviews yet. Be the first!</p>
            ) : reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                      {r.userName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.userName}</p>
                      <StarRating value={r.rating} readonly />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
