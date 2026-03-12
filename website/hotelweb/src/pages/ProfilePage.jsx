import { useState, useEffect, useCallback } from 'react';
import { apiFetch, apiPut, apiPatch, apiDelete } from '../lib/api';
import {
  User, Calendar, Mail, Phone, MapPin, Edit3, Save, X, Loader2,
  Clock, CheckCircle2, LogIn, LogOut, XCircle, BedDouble,
  UtensilsCrossed, ShoppingBag, Receipt, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import apiConfig from '../config/apiConfig';
import { getUserId, getGuestData, saveGuestData } from '../lib/storage';

// Socket singleton
let _socket = null;
function getSocket() {
  if (!_socket) _socket = io(apiConfig.baseUrl, { transports: ['websocket', 'polling'] });
  return _socket;
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtAmt  = (n) => `ETB ${parseFloat(n || 0).toFixed(0)}`;

// ── Status badge config ───────────────────────────────────────────────────────
const BOOKING_STATUS = {
  'Pending':    { cls: 'bg-amber-50 text-amber-600 border-amber-100',   Icon: Clock         },
  'Confirmed':  { cls: 'bg-green-50 text-green-600 border-green-100',   Icon: CheckCircle2  },
  'Checked In': { cls: 'bg-blue-50 text-blue-600 border-blue-100',      Icon: LogIn         },
  'Checked Out':{ cls: 'bg-purple-50 text-purple-700 border-purple-100',Icon: LogOut        },
  'Cancelled':  { cls: 'bg-red-50 text-red-600 border-red-100',         Icon: XCircle       },
};
const ORDER_STATUS = {
  'Pending':   { cls: 'bg-amber-50 text-amber-600 border-amber-100',  Icon: Clock        },
  'Preparing': { cls: 'bg-blue-50 text-blue-600 border-blue-100',     Icon: Loader2      },
  'Ready':     { cls: 'bg-green-50 text-green-600 border-green-100',  Icon: CheckCircle2 },
  'Delivered': { cls: 'bg-purple-50 text-purple-700 border-purple-100',Icon: CheckCircle2},
  'Cancelled': { cls: 'bg-red-50 text-red-600 border-red-100',        Icon: XCircle      },
};
const TABLE_RES_STATUS = {
  'Pending':    { cls: 'bg-amber-50 text-amber-600 border-amber-100',   Icon: Clock         },
  'Confirmed':  { cls: 'bg-green-50 text-green-600 border-green-100',   Icon: CheckCircle2  },
  'Checked In': { cls: 'bg-blue-50 text-blue-600 border-blue-100',      Icon: LogIn         },
  'Completed':  { cls: 'bg-purple-50 text-purple-700 border-purple-100',Icon: CheckCircle2   },
  'Cancelled':  { cls: 'bg-red-50 text-red-600 border-red-100',         Icon: XCircle       },
};
const ORDER_TYPE_ICON = { 'Dine-in': UtensilsCrossed, 'Takeaway': ShoppingBag, 'Room Service': BedDouble };

function StatusBadge({ status, map }) {
  const cfg = map[status] || { cls: 'bg-gray-50 text-gray-500 border-gray-100', Icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2 py-1 border ${cfg.cls}`}>
      <cfg.Icon className="w-2.5 h-2.5" />
      {status}
    </span>
  );
}

// ── Tab component ─────────────────────────────────────────────────────────────
function Tab({ label, count, active, onClick, Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${
        active
          ? 'border-chalet-gold text-chalet-gold'
          : 'border-transparent text-chalet-gray hover:text-chalet-dark'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-chalet-gold text-white' : 'bg-black/10 text-chalet-gray'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [tableRes, setTableRes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('reservations');
  const [resFilter, setResFilter] = useState('All');
  const [orderFilter, setOrderFilter] = useState('All');
  const [tableFilter, setTableFilter] = useState('All');
  const userId = getUserId();

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const savedGuest = getGuestData();
      const emailQ = savedGuest.email ? `&email=${encodeURIComponent(savedGuest.email)}` : '';

      const [profileData, bookingsData, ordersData, tableResData] = await Promise.all([
        apiFetch(`/guests/profile?userId=${userId}${emailQ}`).catch(() => null),
        apiFetch(`/bookings?userId=${userId}`),
        apiFetch(`/orders?userId=${userId}`).catch(() => []),
        apiFetch(`/table-reservations?userId=${userId}`).catch(() => []),
      ]);

      setProfile(profileData);
      setFormData(profileData || {});
      if (profileData) {
        saveGuestData(profileData);
      }
      setBookings(bookingsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTableRes(Array.isArray(tableResData) ? tableResData : []);
    } catch (err) {
      console.error('Profile fetch failed:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Real-time refresh ─────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    const handler = (data) => { if (data.userId === userId) fetchData(true); };
    
    socket.on('bookingStatusUpdate', handler);
    socket.on('orderStatusUpdate', handler);
    socket.on('tableReservationStatusUpdate', handler);
    
    return () => {
      socket.off('bookingStatusUpdate', handler);
      socket.off('orderStatusUpdate', handler);
      socket.off('tableReservationStatusUpdate', handler);
    };
  }, [userId, fetchData]);

  // ── Profile update ────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await apiPut(`/guests/${profile.id}`, formData);
      setProfile(updated);
      setEditing(false);
      localStorage.setItem('guestData', JSON.stringify(updated));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally { setLoading(false); }
  };

  // ── Resource cancellation ─────────────────────────────────────────────────
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      setLoading(true);
      await apiPatch(`/bookings/${id}/cancel`);
      toast.success('Reservation cancelled');
      fetchData(true);
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally { setLoading(false); }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setLoading(true);
      await apiDelete(`/orders/${id}`);
      toast.success('Order cancelled');
      fetchData(true);
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally { setLoading(false); }
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (loading && !profile) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-chalet-bg">
        <Loader2 className="w-8 h-8 text-chalet-gold animate-spin" />
        <p className="mt-4 text-chalet-gray text-sm tracking-widest uppercase">Loading your sanctuary…</p>
      </div>
    );
  }
  if (!loading && !profile && bookings.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto text-center bg-chalet-bg">
        <div className="bg-white p-12 shadow-xl border border-black/5">
          <User className="w-16 h-16 text-chalet-gold mx-auto mb-6" />
          <h1 className="text-3xl font-serif text-chalet-dark mb-4">No Profile Found</h1>
          <p className="text-chalet-gray mb-8">You haven't made any reservations or orders yet.</p>
          <a href="/rooms" className="inline-block px-8 py-4 bg-chalet-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all">
            Explore Our Rooms
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-chalet-bg font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Profile Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-xl border border-black/5 sticky top-28">
            <div className="px-8 pt-8 pb-6 border-b border-black/5 flex items-center justify-between">
              <h2 className="text-xl font-serif text-chalet-dark">My Profile</h2>
              <button onClick={() => setEditing(!editing)} className="text-chalet-gold hover:opacity-70 transition-opacity" title={editing ? 'Cancel' : 'Edit'}>
                {editing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </button>
            </div>

            <div className="p-8">
              {/* Fallback to local data if profile hasn't been created yet */}
              {(() => {
                const guestInfo = profile || getGuestData();
                const displayName = guestInfo.firstName && guestInfo.lastName
                  ? `${guestInfo.firstName} ${guestInfo.lastName}`
                  : (guestInfo.firstName || 'Guest Profile');
                const displayEmail = guestInfo.email || 'No email provided';
                const displayPhone = guestInfo.phone || 'No phone provided';
                const displayUserId = (guestInfo.userId || userId || '').slice(0, 8);
                
                return editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[['First Name', 'firstName'], ['Last Name', 'lastName']].map(([lbl, key]) => (
                        <div key={key}>
                          <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 block">{lbl}</label>
                          <input className="w-full text-sm p-3 bg-chalet-bg border border-black/5 focus:outline-none focus:border-chalet-gold"
                            value={formData[key] || ''} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 block">Email</label>
                      <input className="w-full text-sm p-3 bg-chalet-bg border border-black/5 opacity-50 cursor-not-allowed" value={formData.email || ''} disabled />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 block">Phone</label>
                      <input className="w-full text-sm p-3 bg-chalet-bg border border-black/5 focus:outline-none focus:border-chalet-gold"
                        value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full mt-4 py-4 bg-chalet-gold text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-chalet-gold/10 rounded-full flex items-center justify-center border border-chalet-gold/20">
                        <User className="w-7 h-7 text-chalet-gold" />
                      </div>
                      <div>
                        <p className="text-lg font-serif text-chalet-dark">{displayName}</p>
                        <p className="text-[9px] text-chalet-gold uppercase tracking-widest font-bold">
                          {profile ? 'Verified Guest' : 'Guest History'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-black/5">
                      {[
                        [Mail, displayEmail],
                        [Phone, displayPhone],
                        [MapPin, `ID: ${displayUserId}…`],
                      ].map(([Icon, val], i) => (
                        <div key={i} className="flex items-center gap-3 text-chalet-gray">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-sm">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/5">
                      <div className="bg-chalet-bg p-3 text-center">
                        <p className="text-2xl font-serif text-chalet-gold">{bookings.length}</p>
                        <p className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold">Stays</p>
                      </div>
                      <div className="bg-chalet-bg p-3 text-center">
                        <p className="text-2xl font-serif text-chalet-gold">{orders.length}</p>
                        <p className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold">Orders</p>
                      </div>
                      <div className="bg-chalet-bg p-3 text-center">
                        <p className="text-2xl font-serif text-chalet-gold">{tableRes.length}</p>
                        <p className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold">Dining</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ── Tabbed Content ── */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-xl border border-black/5 overflow-hidden">

            {/* Tab Bar & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 bg-chalet-bg/30">
              <div className="flex overflow-x-auto hide-scrollbar">
                <Tab label="Reservations" count={bookings.length} active={activeTab === 'reservations'}
                  onClick={() => setActiveTab('reservations')} Icon={BedDouble} />
                <Tab label="Dining" count={tableRes.length} active={activeTab === 'dining'}
                  onClick={() => setActiveTab('dining')} Icon={UtensilsCrossed} />
                <Tab label="Orders" count={orders.length} active={activeTab === 'orders'}
                  onClick={() => setActiveTab('orders')} Icon={ShoppingBag} />
              </div>
              <div className="px-6 py-3 sm:py-0 border-t sm:border-t-0 border-black/5 bg-white sm:bg-transparent">
                <select
                  className="w-full sm:w-auto text-[11px] font-bold uppercase tracking-widest text-chalet-gray bg-transparent border-0 focus:ring-0 cursor-pointer outline-none hover:text-chalet-dark transition-colors"
                  value={activeTab === 'reservations' ? resFilter : activeTab === 'dining' ? tableFilter : orderFilter}
                  onChange={(e) => {
                    if (activeTab === 'reservations') setResFilter(e.target.value);
                    else if (activeTab === 'dining') setTableFilter(e.target.value);
                    else setOrderFilter(e.target.value);
                  }}
                >
                  <option value="All">Filter: All Statuses</option>
                  {activeTab === 'reservations' ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Checked Out">Checked Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  ) : activeTab === 'dining' ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="p-6 md:p-8 min-h-[500px]">

              {/* ── RESERVATIONS TAB ── */}
              {activeTab === 'reservations' && (
                <>
                  {bookings.filter(b => resFilter === 'All' || b.status === resFilter).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-chalet-gray/30">
                      <BedDouble className="w-16 h-16 mb-4" />
                      <p className="font-serif text-lg">
                        {bookings.length === 0 ? 'No reservations yet' : `No ${resFilter.toLowerCase()} reservations`}
                      </p>
                      {bookings.length === 0 && (
                        <a href="/rooms" className="mt-4 text-[10px] uppercase tracking-widest font-bold text-chalet-gold hover:opacity-70 transition-opacity flex items-center gap-1">
                          Browse Rooms <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {bookings.filter(b => resFilter === 'All' || b.status === resFilter).map(b => (
                        <div key={b.id} className="border border-black/5 hover:border-chalet-gold/30 transition-all p-5 md:p-6 group">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-chalet-gold/10 text-chalet-gold border border-chalet-gold/20">
                                  #{b.id}
                                </span>
                                <StatusBadge status={b.status} map={BOOKING_STATUS} />
                              </div>
                              <h3 className="text-lg font-serif text-chalet-dark">
                                {b.Rooms?.map(r => `Room ${r.roomNumber}`).join(', ') || 'Accommodation'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-chalet-gray uppercase tracking-widest">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  {fmtDate(b.checkInDate)} — {fmtDate(b.checkOutDate)}
                                </span>
                                <span className="text-black/20">·</span>
                                <span>{b.bookedNights} night{b.bookedNights !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end justify-between gap-4">
                              <div className="sm:text-right">
                                <p className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-0.5">Total</p>
                                <p className="text-xl font-serif text-chalet-gold">{fmtAmt(b.totalAmount)}</p>
                              </div>
                              {['Pending', 'Confirmed'].includes(b.status) && (
                                <button 
                                  onClick={() => handleCancelBooking(b.id)}
                                  disabled={loading}
                                  className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                  Cancel Reservation
                                </button>
                              )}
                            </div>
                          </div>
                          {b.specialRequests && (
                            <p className="mt-4 pt-4 border-t border-black/5 text-[11px] text-chalet-gray italic">
                              "{b.specialRequests}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── DINING RESERVATIONS TAB ── */}
              {activeTab === 'dining' && (
                <>
                  {tableRes.filter(tr => tableFilter === 'All' || tr.status === tableFilter).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-chalet-gray/30">
                      <UtensilsCrossed className="w-16 h-16 mb-4" />
                      <p className="font-serif text-lg">
                        {tableRes.length === 0 ? 'No dining reservations yet' : `No ${tableFilter.toLowerCase()} reservations`}
                      </p>
                      {tableRes.length === 0 && (
                        <a href="/restaurant" className="mt-4 text-[10px] uppercase tracking-widest font-bold text-chalet-gold hover:opacity-70 transition-opacity flex items-center gap-1">
                          Visit Restaurant <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {tableRes.filter(tr => tableFilter === 'All' || tr.status === tableFilter).map(tr => (
                        <div key={tr.id} className="border border-black/5 hover:border-chalet-gold/30 transition-all p-5 md:p-6">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-chalet-gold/10 text-chalet-gold border border-chalet-gold/20">
                                  Dining #{tr.id}
                                </span>
                                <StatusBadge status={tr.status} map={TABLE_RES_STATUS} />
                              </div>
                              <h3 className="text-lg font-serif text-chalet-dark">
                                {tr.DiningTable ? `Table ${tr.DiningTable.number}` : 'Dining Area'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-chalet-gray uppercase tracking-widest">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(tr.reservationTime).toLocaleString()}
                                </span>
                                <span className="text-black/20">·</span>
                                <span>{tr.numberOfGuests} Guests</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end justify-center">
                              {tr.status === 'Pending' && (
                                <button 
                                  onClick={async () => {
                                    if (!window.confirm('Cancel this reservation?')) return;
                                    try {
                                      setLoading(true);
                                      await apiPatch(`/table-reservations/${tr.id}/status`, { status: 'Cancelled' });
                                      toast.success('Reservation cancelled');
                                      fetchData(true);
                                    } catch (err) { toast.error(err.message); }
                                    finally { setLoading(false); }
                                  }}
                                  disabled={loading}
                                  className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                  Cancel Reservation
                                </button>
                              )}
                            </div>
                          </div>
                          {tr.notes && (
                            <p className="mt-4 pt-4 border-t border-black/5 text-[11px] text-chalet-gray italic">
                              "{tr.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === 'orders' && (
                <>
                  {orders.filter(o => orderFilter === 'All' || o.status === orderFilter).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-chalet-gray/30">
                      <UtensilsCrossed className="w-16 h-16 mb-4" />
                      <p className="font-serif text-lg">
                        {orders.length === 0 ? 'No orders yet' : `No ${orderFilter.toLowerCase()} orders`}
                      </p>
                      {orders.length === 0 && (
                        <a href="/restaurant" className="mt-4 text-[10px] uppercase tracking-widest font-bold text-chalet-gold hover:opacity-70 transition-opacity flex items-center gap-1">
                          Visit Restaurant <ChevronRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {orders.filter(o => orderFilter === 'All' || o.status === orderFilter).map(order => {
                        const TypeIcon = ORDER_TYPE_ICON[order.orderType] || UtensilsCrossed;
                        const typeColor = order.orderType === 'Dine-in' ? '#C3A370' : order.orderType === 'Takeaway' ? '#3b82f6' : '#8b5cf6';
                        return (
                          <div key={order.id} className="border border-black/5 hover:border-chalet-gold/30 transition-all p-5 md:p-6">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-chalet-gold/10 text-chalet-gold border border-chalet-gold/20">
                                    Order #{order.id}
                                  </span>
                                  <StatusBadge status={order.status} map={ORDER_STATUS} />
                                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold px-2 py-1 border"
                                    style={{ background: `${typeColor}10`, color: typeColor, borderColor: `${typeColor}30` }}>
                                    <TypeIcon className="w-2.5 h-2.5" />
                                    {order.orderType}
                                  </span>
                                </div>

                                {/* Items list */}
                                <div className="space-y-0.5 pt-1">
                                  {(order.OrderItems || []).map((item, i) => (
                                    <p key={i} className="text-[12px] text-chalet-dark">
                                      {item.quantity}× {item.MenuItem?.name || 'Item'}
                                      {item.notes && <span className="text-chalet-gray italic ml-1">"{item.notes}"</span>}
                                    </p>
                                  ))}
                                  {(!order.OrderItems || order.OrderItems.length === 0) && (
                                    <p className="text-[12px] text-chalet-gray">Items unavailable</p>
                                  )}
                                </div>

                                <p className="text-[10px] font-bold text-chalet-gray uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {fmtDate(order.createdAt)}
                                </p>
                              </div>

                              <div className="flex flex-col sm:items-end justify-between gap-2">
                                <div className="sm:text-right">
                                  <p className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-0.5">Total</p>
                                  <p className="text-xl font-serif text-chalet-gold">{fmtAmt(order.totalAmount)}</p>
                                </div>
                                {order.tableNumber && (
                                  <p className="text-[10px] text-chalet-gray font-bold uppercase tracking-widest">Table {order.tableNumber}</p>
                                )}
                                {order.Booking?.Rooms?.[0]?.roomNumber && (
                                  <p className="text-[10px] text-chalet-gray font-bold uppercase tracking-widest">Room {order.Booking.Rooms[0].roomNumber}</p>
                                )}
                                {order.paymentReceipt && (
                                  <a href={`${apiConfig.baseUrl}${order.paymentReceipt}`} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-chalet-gold hover:opacity-70 transition-opacity font-bold uppercase tracking-widest">
                                    <Receipt className="w-3 h-3" /> Receipt
                                  </a>
                                )}
                                {order.status === 'Pending' && (
                                  <button 
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                  >
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
