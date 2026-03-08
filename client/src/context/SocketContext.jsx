import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState({
    bookings: 0,
    orders: 0
  });

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const hotelId = profile.user?.hotelId;

    if (hotelId) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('joinHotel', hotelId);
      });

      newSocket.on('newBooking', (data) => {
        setNotifications(prev => ({ ...prev, bookings: prev.bookings + 1 }));
      });

      newSocket.on('newOrder', (data) => {
        setNotifications(prev => ({ ...prev, orders: prev.orders + 1 }));
      });

      newSocket.on('lowStockAlert', (data) => {
        import('sonner').then(({ toast }) => {
          toast.warning(`Low Stock: ${data.name}`, {
            description: `Only ${data.currentStock} remaining. Reorder threshold is ${data.threshold}.`,
            duration: 8000,
          });
        });
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, []);

  const clearNotifications = (type) => {
    setNotifications(prev => ({ ...prev, [type]: 0 }));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
