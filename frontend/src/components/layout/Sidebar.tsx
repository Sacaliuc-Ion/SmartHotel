import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router';
import { useMemo } from 'react';
import { Home, DoorOpen, Calendar, Sparkles, Wrench, Settings, BarChart3, Building, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationsContext';

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
  const { notifications } = useNotifications();
  const { t } = useTranslation();
  const filtered = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes('client')
  );

  const notificationCounts = useMemo(() => {
    const unread = notifications.filter((item) => !item.isRead);

    return {
      frontDesk: unread.filter((item) => item.category === 'front-desk').length,
      maintenance: unread.filter((item) => item.category === 'maintenance').length,
      housekeeping: unread.filter((item) => item.category === 'housekeeping').length,
    };
  }, [notifications]);

  return (
    <div
      className={`lb-sidebar h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'lb-sidebar-open' : 'lb-sidebar-closed'}`}
      style={{ width: isOpen ? '16rem' : '0px', borderRightWidth: isOpen ? '1px' : '0px' }}
      aria-hidden={!isOpen}
    >
      <div className="w-64 h-full flex flex-col">
        <nav className="p-3 space-y-0.5 flex-1 pt-4">
          {filtered.map((item, index) => {
            const Icon = item.icon;
            const count =
              item.path === '/front-desk'
                ? notificationCounts.frontDesk
                : item.path === '/maintenance'
                ? notificationCounts.maintenance
                : item.path === '/housekeeping'
                  ? notificationCounts.housekeeping
                  : 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={{ transitionDelay: isOpen ? `${index * 45}ms` : '0ms' }}
                className={({ isActive }) =>
                  `lb-nav-link lb-sidebar-item flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
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
        <div
          className="lb-sidebar-footer lb-sidebar-item p-4 border-t"
          style={{ transitionDelay: isOpen ? `${filtered.length * 45}ms` : '0ms' }}
        >
          <p className="text-xs text-center lb-sidebar-footer-text">{t('sidebarFooter')}</p>
        </div>
      </div>
    </div>
  );
};
