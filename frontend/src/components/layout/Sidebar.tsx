import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { Home, DoorOpen, Calendar, Sparkles, Wrench, Settings, BarChart3, Building, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

interface NavItem { labelKey: string; path: string; icon: React.ElementType; roles: string[]; }

const navItems: NavItem[] = [
  { labelKey: 'navHome',         path: '/',            icon: Home,       roles: ['client', 'reception', 'housekeeping', 'maintenance', 'admin', 'manager'] },
  { labelKey: 'navRooms',        path: '/rooms',       icon: Building,   roles: ['client', 'reception', 'housekeeping', 'maintenance', 'admin', 'manager'] },
  { labelKey: 'navProfile',      path: '/profile',     icon: UserCircle, roles: ['client', 'reception', 'housekeeping', 'maintenance', 'admin', 'manager'] },
  { labelKey: 'navFrontDesk',    path: '/front-desk',  icon: DoorOpen,   roles: ['reception', 'admin', 'manager'] },
  { labelKey: 'navRoomBoard',    path: '/room-board',  icon: Calendar,   roles: ['reception', 'admin', 'manager'] },
  { labelKey: 'navHousekeeping', path: '/housekeeping', icon: Sparkles,  roles: ['housekeeping', 'admin', 'manager'] },
  { labelKey: 'navMaintenance',  path: '/maintenance', icon: Wrench,     roles: ['maintenance', 'admin', 'manager'] },
  { labelKey: 'navDashboard',    path: '/dashboard',   icon: BarChart3,  roles: ['admin', 'manager'] },
  { labelKey: 'navAdmin',        path: '/admin',       icon: Settings,   roles: ['admin', 'manager'] },
];

export const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const filtered = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes('client')
  );

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const next = await api.get<any[]>('/auth/notifications');
        setNotifications(next || []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15000);

    const handleNotificationsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<any[]>;
      setNotifications(customEvent.detail || []);
    };

    window.addEventListener('notifications:updated', handleNotificationsUpdated);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('notifications:updated', handleNotificationsUpdated);
    };
  }, [user]);

  const notificationCounts = useMemo(() => {
    const unread = notifications.filter((item) => !item.isRead);

    return {
      maintenance: unread.filter((item) => `${item.title || ''} ${item.message || ''}`.toLowerCase().includes('maintenance')).length,
      housekeeping: unread.filter((item) => `${item.title || ''} ${item.message || ''}`.toLowerCase().includes('housekeeping')).length,
    };
  }, [notifications]);

  return (
    <div
      className="lb-sidebar h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
      style={{ width: isOpen ? '16rem' : '0px' }}
    >
      <div className="w-64 h-full flex flex-col">
        <nav className="p-3 space-y-0.5 flex-1 pt-4">
          {filtered.map((item) => {
            const Icon = item.icon;
            const count =
              item.path === '/maintenance'
                ? notificationCounts.maintenance
                : item.path === '/housekeeping'
                  ? notificationCounts.housekeeping
                  : 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `lb-nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                    isActive ? 'lb-nav-active' : 'lb-nav-inactive'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex items-center gap-2">
                  <span>{t(item.labelKey)}</span>
                  {count > 0 && (
                    <span className="min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-semibold text-white">
                      {count}
                    </span>
                  )}
                </span>
              </NavLink>
            );
          })}
        </nav>
        <div className="lb-sidebar-footer p-4 border-t">
          <p className="text-xs text-center lb-sidebar-footer-text">{t('sidebarFooter')}</p>
        </div>
      </div>
    </div>
  );
};
