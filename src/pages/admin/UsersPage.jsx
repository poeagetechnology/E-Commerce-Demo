// src/pages/admin/UsersPage.jsx
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, toggleBlockUser } from '@/services/userService';
import DataTable from '@/components/ui/DataTable';
import { formatDate } from '@/utils';
import { ROLES } from '@/constants';
import { Shield, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const ROLE_COLORS = {
  superadmin: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  vendor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const AdminUsersPage = () => {
  const { profile: myProfile } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const all = await getAllUsers();
    setUsers(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRole = async (uid, role) => {
    await updateUserRole(uid, role);
    toast.success('Role updated');
    load();
  };

  const handleBlock = async (uid, isBlocked) => {
    await toggleBlockUser(uid, !isBlocked);
    toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    load();
  };

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const isSuperAdmin = myProfile?.role === ROLES.SUPERADMIN;

  const columns = [
    { key: 'photoURL', label: '', render: (v, row) => (
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
        {row.displayName?.[0]?.toUpperCase()}
      </div>
    )},
    { key: 'displayName', label: 'Name', render: (v, row) => (
      <div>
        <p className="font-medium text-sm">{v}</p>
        <p className="text-xs text-gray-400">{row.email}</p>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v, row) => (
      isSuperAdmin ? (
        <select
          value={v}
          onChange={e => handleRole(row.uid, e.target.value)}
          className={`text-xs font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer focus:ring-1 focus:ring-brand-500 ${ROLE_COLORS[v]}`}
        >
          {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      ) : <span className={`badge ${ROLE_COLORS[v]}`}>{v}</span>
    )},
    { key: 'createdAt', label: 'Joined', render: (v) => <span className="text-xs text-gray-400">{formatDate(v)}</span> },
    { key: 'isBlocked', label: 'Status', render: (v) => (
      v
        ? <span className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1 w-fit"><Ban size={10} /> Blocked</span>
        : <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1 w-fit"><CheckCircle size={10} /> Active</span>
    )},
    { key: 'uid', label: 'Actions', render: (v, row) => (
      row.role !== ROLES.SUPERADMIN && (
        <button
          onClick={() => handleBlock(v, row.isBlocked)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${row.isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400' : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400'}`}
        >
          {row.isBlocked ? 'Unblock' : 'Block'}
        </button>
      )
    )},
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-brand-600" />
          <span className="text-xs text-gray-400">Manage roles and access</span>
        </div>
      </div>
      <div className="card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <input className="input max-w-xs text-sm" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} />
      </div>
    </div>
  );
};

export default AdminUsersPage;
