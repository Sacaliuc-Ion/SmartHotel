import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Bell, LogOut, Hotel, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { PreferencesControls } from './PreferencesControls';
import { useTranslation } from 'react-i18next';

interface TopbarProps { onToggleSidebar?: () => void; sidebarOpen?: boolean; }

const getNotificationTarget = (notification: any) => {
  const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();

  if (text.includes('maintenance')) return '/maintenance';
  if (text.includes('housekeeping')) return '/housekeeping';
  if (notification.reservationId) return '/profile';

  return null;
};

export const Topbar = ({ onToggleSidebar, sidebarOpen }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const next = await api.get<any[]>('/auth/notifications');
      const normalized = next || [];
      setNotifications(normalized);
      window.dispatchEvent(new CustomEvent('notifications:updated', { detail: normalized }));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    loadNotifications();

    const intervalId = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  const markRead = async (notification: any) => {
    if (!notification.isRead) {
      await api.patch(`/auth/notifications/${notification.id}/read`);
      setNotifications((prev) => {
        const next = prev.map((item) => item.id === notification.id ? { ...item, isRead: true } : item);
        window.dispatchEvent(new CustomEvent('notifications:updated', { detail: next }));
        return next;
      });
    }

    const target = getNotificationTarget(notification);
    if (target) {
      navigate(target);
    }
  };

  return (
    <div className="lb-topbar h-16 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lb-topbar-icon-btn p-2 rounded-lg transition-colors"
            aria-label={t('toggleSidebar')}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="lb-logo-icon p-1.5 rounded-lg">
            <Hotel className="h-5 w-5 text-white" />
          </div>
          <Link to="/">
            <h1 className="text-xl font-semibold lb-topbar-title">Smart Hotel</h1>
          </Link>
        </div>
      </div>

      {!user ? (
        <div className="flex items-center gap-2">
          <PreferencesControls compact />
          <button
            onClick={() => navigate('/login')}
            className="lb-topbar-signin-btn px-5 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {t('signIn')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <PreferencesControls compact />
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              className="lb-topbar-icon-btn relative p-2 rounded-lg transition-colors"
              aria-label="Notificari"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="px-3 py-2 text-sm font-semibold text-gray-800 dark:text-slate-100">Notificari</div>
                {notifications.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-gray-500 dark:text-slate-400">Nu ai notificari noi.</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markRead(notification)}
                        className="w-full rounded-md px-3 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{notification.title}</p>
                          {!notification.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{notification.message}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <Link to="/profile" className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium lb-topbar-username">{user.name}</p>
              <p className="text-xs lb-topbar-role capitalize">{user.role}</p>
            </div>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="lb-avatar h-9 w-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="lb-avatar w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="lb-topbar-logout-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
