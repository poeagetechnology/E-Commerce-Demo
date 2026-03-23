// src/components/common/NotificationBell.jsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { subscribeToNotifications, markAsRead } from '@/services/notificationService';
import { formatDate } from '@/utils';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { notifications, setNotifications, markRead } = useUIStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
    });
    return unsub;
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = async (id) => {
    markRead(id);
    await markAsRead(id);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="btn-ghost relative p-2">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-80 card shadow-xl z-50 animate-fade-in max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">No notifications</p>
          ) : (
            notifications.slice(0, 10).map(n => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`p-3 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!n.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
