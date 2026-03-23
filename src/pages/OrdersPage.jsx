// src/pages/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { subscribeToUserOrders } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/utils';
import { STATUS_COLORS, ORDER_STATUSES } from '@/constants';

const TRACK_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserOrders(user.uid, (ords) => {
      setOrders(ords);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  if (!orders.length) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <Package size={56} className="text-gray-200 dark:text-gray-700 mb-4" />
      <h2 className="font-display font-bold text-2xl mb-2">No orders yet</h2>
      <p className="text-gray-400">Your order history will appear here.</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-8">My Orders</h1>
      <div className="space-y-3">
        {orders.map(order => {
          const isExpanded = expanded === order.id;
          const trackIdx = TRACK_STEPS.indexOf(order.status);
          return (
            <div key={order.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : order.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                  <Package size={18} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
                </div>
                <span className="font-bold text-brand-600 flex-shrink-0">{formatCurrency(order.total)}</span>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 animate-slide-up">
                  {/* Tracker */}
                  {order.status !== 'cancelled' && (
                    <div className="py-5">
                      <div className="flex items-center">
                        {TRACK_STEPS.map((s, i) => (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`flex flex-col items-center`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= trackIdx ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                {i + 1}
                              </div>
                              <span className={`text-xs mt-1.5 capitalize font-medium ${i <= trackIdx ? 'text-brand-600' : 'text-gray-400'}`}>{s}</span>
                            </div>
                            {i < TRACK_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < trackIdx ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-gray-50 dark:bg-gray-800" />
                        <span className="flex-1">{item.name} ×{item.qty}</span>
                        <span className="font-semibold">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400 mb-1">Shipping to</p>
                      <p className="text-sm">{order.address.street}, {order.address.city}, {order.address.state} {order.address.zip}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
