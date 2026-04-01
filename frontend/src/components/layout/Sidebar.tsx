import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router';
import { Home, DoorOpen, Calendar, Sparkles, Wrench, Settings, BarChart3, Building } from 'lucide-react';

interface NavItem { label: string; path: string; icon: React.ElementType; roles: string[]; }

const navItems: NavItem[] = [
  { label: 'Home',         path: '/',            icon: Home,      roles: ['client','reception','housekeeping','maintenance','admin','manager'] },
  { label: 'Rooms',        path: '/rooms',        icon: Building,  roles: ['client','reception','housekeeping','maintenance','admin','manager'] },
  { label: 'Front Desk',   path: '/front-desk',  icon: DoorOpen,  roles: ['reception','admin','manager'] },
  { label: 'Room Board',   path: '/room-board',  icon: Calendar,  roles: ['reception','admin','manager'] },
  { label: 'Housekeeping', path: '/housekeeping', icon: Sparkles,  roles: ['housekeeping','admin','manager'] },
  { label: 'Maintenance',  path: '/maintenance',  icon: Wrench,    roles: ['maintenance','admin','manager'] },
  { label: 'Dashboard',    path: '/dashboard',   icon: BarChart3, roles: ['admin','manager'] },
  { label: 'Admin',        path: '/admin',        icon: Settings,  roles: ['admin'] },
];

export const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user } = useAuth();
  const filtered = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes('client')
  );

  return (
    <div
      className="lb-sidebar h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
      style={{ width: isOpen ? '16rem' : '0px' }}
    >
      <div className="w-64 h-full flex flex-col">
        <nav className="p-3 space-y-0.5 flex-1 pt-4">
          {filtered.map((item) => {
            const Icon = item.icon;
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
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="lb-sidebar-footer p-4 border-t">
          <p className="text-xs text-center lb-sidebar-footer-text">Smart Hotel © 2026</p>
        </div>
      </div>
    </div>
  );
};
