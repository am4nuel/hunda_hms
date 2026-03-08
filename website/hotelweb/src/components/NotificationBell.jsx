import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, CheckCircle2, LogIn, LogOut, XCircle, Mail, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import apiConfig from '../config/apiConfig';

// ── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'hotelWebNotifications';
const MAX_STORED = 20;

// Status icon mapping (keys stored in localStorage, components resolved at render)
const STATUS_CONFIG = {
  // Booking Statuses
  'Confirmed':   { iconKey: 'CheckCircle2', title: 'Reservation Confirmed!',   color: '#22c55e' },
  'Checked In':  { iconKey: 'LogIn',        title: 'Checked In Successfully!',  color: '#3b82f6' },
  'Checked Out': { iconKey: 'LogOut',       title: 'Thank You — Checked Out',   color: '#8b5cf6' },
  
  // Order Statuses
  'Preparing':   { iconKey: 'UtensilsCrossed', title: 'Order Preparing', color: '#3b82f6' },
  'Ready':       { iconKey: 'ShoppingBag',     title: 'Order Ready',     color: '#22c55e' },
  'Delivered':   { iconKey: 'CheckCircle2',    title: 'Order Delivered', color: '#8b5cf6' },
  
  // Shared
  'Cancelled':   { iconKey: 'XCircle',      title: 'Cancelled',     color: '#ef4444' },
};

// Resolve icon key → Lucide component
const ICON_MAP = { CheckCircle2, LogIn, LogOut, XCircle, Mail, UtensilsCrossed, ShoppingBag };
function StatusIcon({ iconKey, color, size = 18 }) {
  const Icon = ICON_MAP[iconKey] || Mail;
  return <Icon width={size} height={size} color={color} strokeWidth={2} />;
}

// ── Socket Singleton ─────────────────────────────────────────────────────────
let socketInstance = null;
function getSocket() {
  if (!socketInstance) {
    socketInstance = io(apiConfig.baseUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
}

// ── LocalStorage Helpers ─────────────────────────────────────────────────────
function loadNotifications() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveNotifications(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED))); }
  catch {}
}
function getCurrentUserId() {
  try {
    const guest = JSON.parse(localStorage.getItem('guestData') || '{}');
    return guest.userId || localStorage.getItem('userId') || null;
  } catch { return null; }
}
function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function NotificationBell({ showSolidNavbar }) {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const prevLengthRef = useRef(notifications.length);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Socket listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    const handleBookingUpdate = (data) => {
      const userId = getCurrentUserId();
      if (!userId || !data.userId || data.userId !== userId) return;

      const cfg = STATUS_CONFIG[data.status] || { iconKey: 'Mail', title: data.status, color: '#C3A370' };

      const notification = {
        id: `${Date.now()}-b-${data.bookingId}`,
        bookingId: data.bookingId,
        status: data.status,
        title: cfg.title,
        message: data.message || `Booking #${data.bookingId} is now ${data.status}.`,
        iconKey: cfg.iconKey,
        color: cfg.color,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, MAX_STORED);
        saveNotifications(updated);
        return updated;
      });
    };

    const handleOrderUpdate = (data) => {
      const userId = getCurrentUserId();
      if (!userId || !data.userId || data.userId !== userId) return;

      const cfg = STATUS_CONFIG[data.status] || { iconKey: 'Mail', title: `Order ${data.status}`, color: '#C3A370' };

      const notification = {
        id: `${Date.now()}-o-${data.id}`,
        status: data.status,
        title: cfg.title,
        message: `Your food order #${data.id} is now ${data.status.toLowerCase()}.`,
        iconKey: cfg.iconKey,
        color: cfg.color,
        timestamp: new Date().toISOString(),
        read: false,
      };

      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, MAX_STORED);
        saveNotifications(updated);
        return updated;
      });
    };

    socket.on('bookingStatusUpdate', handleBookingUpdate);
    socket.on('orderStatusUpdate', handleOrderUpdate);

    return () => {
      socket.off('bookingStatusUpdate', handleBookingUpdate);
      socket.off('orderStatusUpdate', handleOrderUpdate);
    };
  }, []);

  // ── Fire toast on new notification ────────────────────────────────────────
  useEffect(() => {
    if (notifications.length > prevLengthRef.current && notifications[0]) {
      const n = notifications[0];
      toast(n.title, {
        description: n.message,
        icon: <StatusIcon iconKey={n.iconKey} color={n.color} size={18} />,
        duration: 7000,
        style: { borderLeft: `4px solid ${n.color}` },
        action: {
          label: 'My Profile',
          onClick: () => { window.location.href = '/profile'; },
        },
      });
    }
    prevLengthRef.current = notifications.length;
  }, [notifications.length]);

  // ── Close panel on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) markAllRead();
  };

  const iconColor = showSolidNavbar ? 'text-[#4A4A4A] hover:text-chalet-dark' : 'text-white hover:opacity-70 drop-shadow-md';

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className={`relative p-2 transition-colors ${iconColor}`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-[200]"
          style={{ animation: 'slideDown 0.18s ease' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#C3A370]" />
              <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-widest">Notifications</h3>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button onClick={markAllRead} title="Mark all read"
                    className="p-1.5 text-gray-400 hover:text-[#C3A370] transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={clearAll} title="Clear all"
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-800 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Bell className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-[12px] font-medium text-gray-400">No notifications yet</p>
                <p className="text-[11px] text-gray-300 mt-1">We'll let you know when your booking status changes.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <a key={n.id} href="/profile"
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-amber-50/50' : ''}`}>
                  <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: `${n.color}18`, border: `1.5px solid ${n.color}30` }}>
                    <StatusIcon iconKey={n.iconKey} color={n.color} size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-bold text-gray-800 leading-tight">{n.title}</p>
                      {!n.read && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: n.color }} />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">{timeAgo(n.timestamp)}</p>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <a href="/profile"
                className="text-[11px] font-bold text-[#C3A370] uppercase tracking-widest hover:text-[#A8874A] transition-colors">
                View All Booking Details →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
