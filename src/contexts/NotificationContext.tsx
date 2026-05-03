import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'urgent' | 'success' | 'info' | 'reminder';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  sendNotification: (userId: string, notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user?.id) {
      socket.emit('join-room', user.id);

      socket.on('new-notification', (notification: Notification) => {
        const fullNotification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          time: 'Just now',
          isRead: false,
        };
        setNotifications((prev) => [fullNotification, ...prev]);
        
        // Show toast for urgent notifications
        if (notification.type === 'urgent') {
          toast.error(notification.title, {
            description: notification.message,
          });
        } else {
          toast.info(notification.title, {
            description: notification.message,
          });
        }
      });

      socket.on('appointment-created', (appointment: any) => {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'info',
          title: 'New Appointment Request',
          message: `New consultation request from ${appointment.patient?.name || 'a patient'} for ${new Date(appointment.appointment_date).toLocaleDateString()}.`,
          time: 'Just now',
          isRead: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        toast.success(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'View Queue',
            onClick: () => window.location.href = '/dashboard/appointments'
          }
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('new-notification');
        socket.off('appointment-created');
      }
    };
  }, [socket, user?.id]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const sendNotification = (userId: string, notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => {
    if (socket) {
      socket.emit('send-notification', { userId, notification });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        clearAll,
        sendNotification,
        socket,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
