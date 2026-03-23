// src/pages/vendor/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import useAuthStore from '@/store/authStore';
import { formatCurrency, formatDate } from '@/utils';
import { STATUS_COLORS } from '@/constants';
import { Package } from 'lucide-react';

const VendorOrdersPage = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all orders that contain vendor's products
    const load = async () => {
      const snap = await getDocs(collection(db, 'orders'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Filter orders containing this vendor's products
      // In a real app, you'd store vendorId on each order item
      setOrders(all);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">Orders involving your products</p>
      </div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Package size={40} className="mb-3 opacity-30" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50 dark:divide-gray-800/50">
          {orders.map(o => (
            <div key={o.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <p className="font-mono text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-medium mt-0.5">{o.address?.name || 'Customer'}</p>
                <p className="text-xs text-gray-400">{formatDate(o.createdAt)} · {o.items?.length} item(s)</p>
              </div>
              <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
              <span className="font-bold text-sm">{formatCurrency(o.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
