// src/pages/admin/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils';
import useUIStore from '@/store/uiStore';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="font-display font-bold text-2xl mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { darkMode } = useUIStore();
  const [stats, setStats] = useState({ orders: [], users: [], products: [], revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordSnap, usrSnap, prdSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
      ]);
      const orders = ordSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      setStats({
        orders,
        users: usrSnap.docs.map(d => d.data()),
        products: prdSnap.docs.map(d => d.data()),
        revenue,
      });
      setLoading(false);
    };
    load();
  }, []);

  // Build last 7 days revenue chart
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const revenueByDay = last7.map((label, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return stats.orders
      .filter(o => {
        const od = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      })
      .reduce((s, o) => s + (o.total || 0), 0);
  });

  const ordersByStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s =>
    stats.orders.filter(o => o.status === s).length
  );

  const textColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#1f2937' : '#f3f4f6';

  const chartOptions = (title) => ({
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
    },
  });

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your store's performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats.revenue)} color="bg-brand-600" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.orders.length} sub={`${stats.orders.filter(o => o.status === 'pending').length} pending`} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Users" value={stats.users.length} color="bg-emerald-500" />
        <StatCard icon={Package} label="Products" value={stats.products.length} sub={`${stats.products.filter(p => p.stock === 0).length} out of stock`} color="bg-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Revenue (Last 7 Days)</h3>
          <Line
            data={{
              labels: last7,
              datasets: [{
                data: revenueByDay,
                borderColor: '#d946ef',
                backgroundColor: 'rgba(217,70,239,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#d946ef',
                pointRadius: 4,
              }],
            }}
            options={chartOptions()}
          />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4 text-sm">Orders by Status</h3>
          <Bar
            data={{
              labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
              datasets: [{
                data: ordersByStatus,
                backgroundColor: ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f87171'],
                borderRadius: 8,
              }],
            }}
            options={chartOptions()}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {stats.orders.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
              <span className="text-xs font-mono text-gray-400">#{o.id.slice(-8).toUpperCase()}</span>
              <span className="text-sm flex-1 truncate">{o.address?.name || 'Customer'}</span>
              <span className={`badge ${{'pending':'bg-yellow-100 text-yellow-700','processing':'bg-blue-100 text-blue-700','shipped':'bg-purple-100 text-purple-700','delivered':'bg-green-100 text-green-700','cancelled':'bg-red-100 text-red-700'}[o.status] || ''}`}>{o.status}</span>
              <span className="font-semibold text-sm">{formatCurrency(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
