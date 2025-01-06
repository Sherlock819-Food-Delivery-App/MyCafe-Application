import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { API_BASE_URL } from '../config/config';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    let socket;

    if (isAuthenticated && user) {
      // Only connect to WebSocket if user is authenticated
      socket = io(API_BASE_URL);
      
      socket.on('connect', () => {
        // Identify user to socket server
        socket.emit('authenticate', { userId: user.id });
      });

      socket.on('orderUpdate', (data) => {
        addNotification({
          id: Date.now().toString(),
          message: `Order ${data.orderId} status: ${data.status}`,
        });
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  const addNotification = (notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // If user is not authenticated, just render children without context
  if (!isAuthenticated) {
    return children;
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

