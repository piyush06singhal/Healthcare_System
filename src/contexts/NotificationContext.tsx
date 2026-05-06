import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import { markNotificationRead, setNotifications as setReduxNotifications } from '../store/healthSlice';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const reduxNotifications = useSelector((state: RootState) => state.health.notifications);
  const dispatch = useDispatch();

  const formattedNotifications: Notification[] = reduxNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type === 'alert' ? 'urgent' : n.type as any || 'info',
    time: new Date(n.timestamp).toLocaleTimeString(),
    isRead: n.read
  }));

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

      socket.on('new-notification', (notification: any) => {
        // Handle legacy socket notifications if any
        toast.info(notification.title, {
          description: notification.message,
        });
      });

      socket.on('appointment-created', (appointment: any) => {
        toast.success('New Appointment Request', {
          description: `New consultation request from ${appointment.patient?.name || 'a patient'}.`,
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
    dispatch(markNotificationRead(id));
  };

  const deleteNotification = (id: string) => {
    // Optionally implement delete in DB if needed, for now just filter in store if possible
    // But store doesn't have deleteNotification action yet, I'll stick to read for now
  };

  const clearAll = () => {
    dispatch(setReduxNotifications([]));
  };

  const sendNotification = (userId: string, notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => {
    if (socket) {
      socket.emit('send-notification', { userId, notification });
    }
  };

  const unreadCount = reduxNotifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: formattedNotifications,
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
