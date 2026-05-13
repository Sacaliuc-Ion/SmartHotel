import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: number;
  reservationId?: number | null;
  title: string;
  message: string;
  category: string;
  targetPath?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isInitializing } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      const next = await api.get<NotificationItem[]>('/auth/notifications');
      setNotifications(next || []);
    } catch {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (!user) {
      setNotifications([]);
      return;
    }

    void refreshNotifications();

    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, 15000);

    const handleRefreshRequest = () => {
      void refreshNotifications();
    };

    const handleWindowFocus = () => {
      void refreshNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshNotifications();
      }
    };

    window.addEventListener('notifications:refresh', handleRefreshRequest);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('notifications:refresh', handleRefreshRequest);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, isInitializing]);

  const markNotificationRead = useCallback(async (notificationId: number) => {
    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    await api.patch(`/auth/notifications/${notificationId}/read`);
    setNotifications((current) =>
      current.map((item) => item.id === notificationId ? { ...item, isRead: true } : item)
    );
  }, [notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!notifications.some((item) => !item.isRead)) {
      return;
    }

    await api.patch('/auth/notifications/read-all');
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }, [notifications]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  }), [notifications, unreadCount, refreshNotifications, markNotificationRead, markAllNotificationsRead]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};
