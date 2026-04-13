import { useAuth } from '../../context/AuthContext';
import { LogOut, Hotel, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

interface TopbarProps { onToggleSidebar?: () => void; sidebarOpen?: boolean; }

export const Topbar = ({ onToggleSidebar, sidebarOpen }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="lb-topbar h-16 flex items-center justify-between px-4 shrink-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lb-topbar-icon-btn p-2 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
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
        <button
          onClick={() => navigate('/login')}
          className="lb-topbar-signin-btn px-5 py-2 rounded-lg text-sm font-medium transition-all"
        >
          Sign In
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium lb-topbar-username">{user.name}</p>
            <p className="text-xs lb-topbar-role capitalize">{user.role}</p>
          </div>
          <div className="lb-avatar w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="lb-topbar-logout-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
