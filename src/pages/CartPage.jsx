// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { formatCurrency } from '@/utils';

const CartPage = () => {
  const { user } = useAuthStore();
  const { items, removeItem, updateQty } = useCartStore();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <ShoppingBag size={56} className="text-gray-200 dark:text-gray-700 mb-4" />
      <h2 className="font-display font-bold text-2xl mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex items-center gap-4">
              <Link to={`/product/${item.productId}`}>
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 dark:bg-gray-800 flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="font-semibold text-sm hover:text-brand-600 transition-colors line-clamp-2">{item.name}</Link>
                <p className="text-brand-600 font-bold mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                  <button onClick={() => updateQty(user?.uid, item.productId, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">−</button>
                  <span className="px-3 py-1.5 font-medium">{item.qty}</span>
                  <button onClick={() => updateQty(user?.uid, item.productId, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">+</button>
                </div>
                <span className="font-bold text-sm w-20 text-right">{formatCurrency(item.price * item.qty)}</span>
                <button onClick={() => removeItem(user?.uid, item.productId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="font-display font-bold text-lg mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-500 truncate flex-1 pr-3">{item.name} ×{item.qty}</span>
                <span className="font-medium flex-shrink-0">{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Shipping</span>
              <span className="text-green-600">{total >= 50 ? 'Free' : formatCurrency(9.99)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(total >= 50 ? total : total + 9.99)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full gap-2">
            Checkout <ArrowRight size={16} />
          </button>
          <Link to="/products" className="btn-secondary w-full mt-3 justify-center">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
