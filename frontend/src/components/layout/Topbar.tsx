import { useAuth } from '../../context/AuthContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api';
import { Bell, LogOut, Hotel, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { PreferencesControls } from './PreferencesControls';
import { useTranslation } from 'react-i18next';
import { useHotel } from '../../context/HotelContext';

interface TopbarProps { onToggleSidebar?: () => void; sidebarOpen?: boolean; }

interface OperationalAlertItem {
  id: string;
  title: string;
  message: string;
  targetPath: string;
  isRead: false;
}

const extractRoomNumber = (value: string) =>
  value.match(/(?:camera|room)\s+([A-Za-z0-9-]+)/i)?.[1];

const extractDateRange = (value: string) =>
  value.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);

const extractTrailingDate = (value: string) =>
  value.match(/(\d{4}-\d{2}-\d{2})/g)?.at(-1);

const extractAfterLastColon = (value: string) => value.split(':').pop()?.trim();

const localizeStoredNotification = (notification: any, t: any) => {
  const title = notification.title || '';
  const message = notification.message || '';
  const room = extractRoomNumber(message) || extractRoomNumber(title) || '';
  const dateRange = extractDateRange(message);
  const singleDate = extractTrailingDate(message) || '';
  const trailingText = message.match(/pentru\s+(.+?)\.$/i)?.[1]
    || message.match(/oaspetelui\s+(.+?)\.$/i)?.[1]
    || '';
  const issue = extractAfterLastColon(message) || title;

  switch (title) {
    case 'Check-in confirmat':
      return {
        ...notification,
        title: t('notification.checkInConfirmedTitle'),
        message: t('notification.checkInConfirmedMessage', { room }),
      };
    case 'Rezervare confirmata':
      return {
        ...notification,
        title: t('notification.reservationConfirmedTitle'),
        message: t('notification.reservationConfirmedMessage', {
          room,
          checkIn: dateRange?.[1] || '',
          checkOut: dateRange?.[2] || '',
        }),
      };
    case 'Rezervare anulata':
      return {
        ...notification,
        title: t('notification.reservationCancelledTitle'),
        message: message.includes('echipa hotelului')
          ? t('notification.reservationCancelledByHotelMessage', { room })
          : t('notification.reservationCancelledMessage', { room }),
      };
    case 'Rezervare actualizata':
      return {
        ...notification,
        title: t('notification.reservationUpdatedTitle'),
        message: t('notification.reservationUpdatedMessage', {
          room,
          checkIn: dateRange?.[1] || '',
          checkOut: dateRange?.[2] || '',
        }),
      };
    case 'Rezervare marcata ca neprezentare':
      return {
        ...notification,
        title: t('notification.noShowTitle'),
        message: t('notification.noShowMessage', { room }),
      };
    case 'Ticket rezolvat':
      return {
        ...notification,
        title: t('notification.ticketResolvedTitle'),
        message: t('notification.ticketResolvedMessage', { room, issue }),
      };
    case 'Maintenance ticket nou':
      return {
        ...notification,
        title: t('notification.maintenanceNewTitle'),
        message: t('notification.maintenanceNewMessage', { room, issue }),
      };
    case 'Urgent maintenance ticket':
      return {
        ...notification,
        title: t('notification.maintenanceUrgentTitle'),
        message: t('notification.maintenanceUrgentMessage', { room, issue }),
      };
    case 'Housekeeping ticket nou':
      return {
        ...notification,
        title: t('notification.housekeepingNewTitle'),
        message: t('notification.housekeepingNewMessage', { room, issue }),
      };
    case 'Urgent housekeeping request':
      return {
        ...notification,
        title: t('notification.housekeepingUrgentTitle'),
        message: t('notification.housekeepingUrgentMessage', { room, issue }),
      };
    case 'Reminder check-in':
      return {
        ...notification,
        title: t('notification.checkInReminderTitle'),
        message: message.toLowerCase().includes('maine')
          ? t('notification.checkInReminderTomorrowMessage', { room })
          : t('notification.checkInReminderTodayMessage', { room }),
      };
    case 'Review pending':
      return {
        ...notification,
        title: t('notification.reviewPendingTitle'),
        message: t('notification.reviewPendingMessage', { room }),
      };
    case 'Checkout today':
      return {
        ...notification,
        title: t('notification.checkoutTodayTitle'),
        message: t('notification.checkoutTodayMessage', { room, guest: trailingText }),
      };
    case 'Room ready for check-in':
      return {
        ...notification,
        title: t('notification.roomReadyTitle'),
        message: t('notification.roomReadyMessage', { room, guest: trailingText }),
      };
    default:
      return notification;
  }
};

const getNotificationTarget = (notification: any) => {
  if (notification.targetPath) return notification.targetPath;

  const text = `${notification.title || ''} ${notification.message || ''}`.toLowerCase();

  if (text.includes('ticket rezolvat')) return '/profile';
  if (text.includes('checkout today') || text.includes('room ready for check-in') || text.includes('neprezentare')) return '/front-desk';
  if (text.includes('maintenance')) return '/maintenance';
  if (text.includes('housekeeping')) return '/housekeeping';
  if (notification.reservationId) return '/profile';

  return null;
};

export const Topbar = ({ onToggleSidebar, sidebarOpen }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { bookings } = useHotel();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };
  const scrollMainContentToTop = () => {
    const mainContent = document.querySelector('main');
    if (mainContent instanceof HTMLElement) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  };
  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (location.pathname === '/') {
      scrollMainContentToTop();
      return;
    }

    navigate('/', { state: { scrollToTop: true } });
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;
  const overdueCheckOuts = bookings.filter((booking) => booking.status === 'checked-in' && booking.checkOut < todayKey);
  const overdueCheckIns = bookings.filter((booking) => booking.status === 'confirmed' && booking.checkIn < todayKey);
  const operationalAlerts: OperationalAlertItem[] = [
    ...overdueCheckOuts.map((booking) => ({
      id: `operational-checkout-${booking.id}`,
      title: t('overdueCheckOutNotificationTitle'),
      message: t('overdueCheckOutNotificationMessage', { guest: booking.guestName, room: booking.roomNumber, date: booking.checkOut }),
      targetPath: '/front-desk',
      isRead: false as const,
    })),
    ...overdueCheckIns.map((booking) => ({
      id: `operational-checkin-${booking.id}`,
      title: t('overdueCheckInNotificationTitle'),
      message: t('overdueCheckInNotificationMessage', { guest: booking.guestName, room: booking.roomNumber, date: booking.checkIn }),
      targetPath: '/front-desk',
      isRead: false as const,
    })),
  ];
  const bellCount = unreadCount + operationalAlerts.length;
  const localizedNotifications = useMemo(
    () => notifications.map((notification) => localizeStoredNotification(notification, t)),
    [notifications, t]
  );
  const combinedNotifications = [...operationalAlerts, ...localizedNotifications];

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

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [notificationsOpen]);

  const markRead = async (notification: any) => {
    if (typeof notification.id === 'string' && notification.id.startsWith('operational-')) {
      setNotificationsOpen(false);
      navigate(notification.targetPath || '/front-desk');
      return;
    }

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
      setNotificationsOpen(false);
      navigate(target);
    }
  };

  const markAllAsSeen = async () => {
    if (unreadCount === 0) return;

    await api.patch('/auth/notifications/read-all');
    setNotifications((prev) => {
      const next = prev.map((item) => ({ ...item, isRead: true }));
      window.dispatchEvent(new CustomEvent('notifications:updated', { detail: next }));
      return next;
    });
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
          <Link to="/" onClick={handleHomeClick}>
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
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              className="lb-topbar-icon-btn relative p-2 rounded-lg transition-colors"
              aria-label={t('notifications')}
            >
              <Bell className="h-5 w-5" />
              {bellCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                  {bellCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="text-sm font-semibold text-gray-800 dark:text-slate-100">{t('notifications')}</div>
                  <button
                    onClick={markAllAsSeen}
                    disabled={unreadCount === 0}
                    className="text-xs font-medium text-amber-600 transition hover:text-amber-500 disabled:cursor-default disabled:opacity-50 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    {t('markAllAsSeen')}
                  </button>
                </div>
                {combinedNotifications.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-gray-500 dark:text-slate-400">{t('noNewNotifications')}</p>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {combinedNotifications.map((notification) => (
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
