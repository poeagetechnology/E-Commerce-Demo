// src/pages/admin/OrdersPage.jsx
import { useEffect, useState } from 'react';
import { subscribeToAllOrders, updateOrderStatus } from '@/services/orderService';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/utils';
import { STATUS_COLORS, ORDER_STATUSES } from '@/constants';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const unsub = subscribeToAllOrders((ords) => {
      setOrders(ords);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    toast.success(`Order updated to "${status}"`);
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  const columns = [
    { key: 'id', label: 'Order ID', render: (v) => <span className="font-mono text-xs text-gray-500">#{v.slice(-8).toUpperCase()}</span> },
    { key: 'address', label: 'Customer', render: (v) => <span className="text-sm font-medium">{v?.name || '—'}</span> },
    { key: 'items', label: 'Items', render: (v) => <span className="text-sm text-gray-500">{v?.length || 0} item(s)</span> },
    { key: 'total', label: 'Total', render: (v) => <span className="font-semibold text-sm">{formatCurrency(v)}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span> },
    { key: 'status', label: 'Status', render: (v, row) => (
      <select
        value={v}
        onChange={e => handleStatus(row.id, e.target.value)}
        className={`text-xs font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-brand-500 ${STATUS_COLORS[v]}`}
      >
        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...ORDER_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <DataTable columns={columns} data={filtered} loading={loading} emptyMsg="No orders found" />
      </div>
    </div>
  );
};

export default AdminOrdersPage;
