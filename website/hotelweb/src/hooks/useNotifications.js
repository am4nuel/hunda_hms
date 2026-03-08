import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import apiConfig from '../config/apiConfig';

// Status messages for each booking state
const STATUS_MESSAGES = {
  'Confirmed':  { icon: '✅', title: 'Reservation Confirmed!', color: '#22c55e' },
  'Checked In': { icon: '🏨', title: 'Checked In!',            color: '#3b82f6' },
  'Checked Out':{ icon: '👋', title: 'Checked Out',            color: '#8b5cf6' },
  'Cancelled':  { icon: '❌', title: 'Reservation Cancelled',  color: '#ef4444' },
};

// LocalStorage key for persisted notifications
const STORAGE_KEY = 'hotelNotifications';
const MAX_STORED = 20;

function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStored(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
  } catch {}
}

let socket = null; // Singleton socket instance

/**
 * useNotifications — connects to the socket server and listens for
 * `bookingStatusUpdate` events that match the current guest's userId.
 * Provides a list of notifications and an unread count that persists across
 * page navigations.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState(loadStored);
  const [unreadCount, setUnreadCount] = useState(() => {
    const stored = loadStored();
    return stored.filter(n => !n.read).length;
  });

  // Get current userId from localStorage (set during booking)
  const getCurrentUserId = () => {
    try {
      const guestData = JSON.parse(localStorage.getItem('guestData') || '{}');
      return guestData.userId || localStorage.getItem('userId');
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Connect to socket server (singleton – won't reconnect if already connected)
    if (!socket) {
      socket = io(apiConfig.baseUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    const handleBookingStatusUpdate = (data) => {
      const userId = getCurrentUserId();
      // Only process events for this guest
      if (!userId || !data.userId || data.userId !== userId) return;

      const config = STATUS_MESSAGES[data.status] || { icon: '📩', title: data.status, color: '#C3A370' };

      const notification = {
        id: `${Date.now()}-${data.bookingId}`,
        bookingId: data.bookingId,
        status: data.status,
        title: config.title,
        message: data.message || `Booking #${data.bookingId} status: ${data.status}`,
        icon: config.icon,
        color: config.color,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, MAX_STORED);
        saveStored(updated);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    };

    socket.on('bookingStatusUpdate', handleBookingStatusUpdate);

    return () => {
      socket.off('bookingStatusUpdate', handleBookingStatusUpdate);
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveStored(updated);
      return updated;
    });
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveStored([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAllRead, clearAll };
}
