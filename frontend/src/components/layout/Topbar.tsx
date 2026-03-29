import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { LogOut, Hotel, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router';

interface TopbarProps { onToggleSidebar?: () => void; sidebarOpen?: boolean; }

export const Topbar = ({ onToggleSidebar, sidebarOpen }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4 shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors" aria-label="Toggle sidebar">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg"><Hotel className="h-5 w-5 text-white" /></div>
          <h1 className="text-xl font-semibold text-gray-800">Grand Hotel</h1>
        </div>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </div>
  );
};
