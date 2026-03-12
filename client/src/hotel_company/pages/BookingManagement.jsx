import React, { useState, useEffect, useMemo } from 'react';
import { useSocket } from '../../context/SocketContext';
import {
  Plus, Search, Edit2, Trash2, X, XCircle,
  CalendarDays, LogIn, LogOut, Ban, Users,
  CheckCircle2, Clock, DoorOpen, AlertCircle,
  ChevronDown, Bed, ChevronLeft, ChevronRight, Utensils, DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/table";
import * as api from '@/api';
import { toast } from 'sonner';

// Safe base URL for image/file paths stored as /uploads/... on the server
const SERVER_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const bookingStatusConfig = {
  'Pending':     { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: Clock },
  'Confirmed':   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: CheckCircle2 },
  'Checked In':  { bg: 'bg-green-50',  text: 'text-green-600',  icon: DoorOpen },
  'Checked Out': { bg: 'bg-gray-50',   text: 'text-gray-500',   icon: LogOut },
  'Cancelled':   { bg: 'bg-red-50',    text: 'text-red-500',    icon: Ban },
};

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = bookingStatusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-500', icon: AlertCircle };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tighter ${cfg.bg} ${cfg.text}`}>
      <cfg.icon className="h-3 w-3" />
      {status}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BookingManagement = () => {
  const [activeTab, setActiveTab] = useState('reservations');
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState(null); // { action, bookingId, guestName, roomNums }

  // Detail modal state
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);

  // Billing Summary Slider
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    guestId: '', roomIds: [], checkInDate: '', checkOutDate: '', specialRequests: ''
  });

  // Guest modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [guestForm, setGuestForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', idType: '', idNumber: '', notes: ''
  });

  // Guest search in booking modal
  const [guestSearch, setGuestSearch] = useState('');
  const [modalGuestTab, setModalGuestTab] = useState('select'); // 'select' | 'add'
  const [inlineGuestForm, setInlineGuestForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', idType: '', idNumber: ''
  });

  const { socket } = useSocket();

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newBooking', () => {
        loadAll();
      });
      return () => socket.off('newBooking');
    }
  }, [socket]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [bRes, gRes, rRes] = await Promise.all([
        api.fetchBookings(), api.fetchGuests(), api.fetchRooms()
      ]);
      setBookings(bRes.data);
      setGuests(gRes.data);
      setRooms(rRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ── Computed ────────────────────────────────────────────────────────────────
  const availableRooms = useMemo(() => {
    // If we have an isReserved flag from backend (date search), use it.
    // Otherwise fallback to status.
    return rooms.filter(r => {
      const isReserved = r.isReserved;
      const isMaintenance = r.status === 'Under maintenance';
      const isOccupied = r.status === 'Occupied';
      
      // If dates are selected, we trust isReserved flag.
      if (bookingForm.checkInDate && bookingForm.checkOutDate) {
        return !isReserved && !isMaintenance;
      }
      
      // Default dashboard view: only "Available" status
      return r.status === 'Available';
    });
  }, [rooms, bookingForm.checkInDate, bookingForm.checkOutDate]);

  const totalAmount = useMemo(() => {
    if (!bookingForm.roomIds.length || !bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
    const nights = calcNights(bookingForm.checkInDate, bookingForm.checkOutDate);
    return bookingForm.roomIds.reduce((sum, id) => {
      const room = rooms.find(r => r.id === parseInt(id));
      return sum + (parseFloat(room?.RoomType?.basePrice || 0) * nights);
    }, 0);
  }, [bookingForm, rooms]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = `${b.Guest?.firstName} ${b.Guest?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGuests = guests.filter(g =>
    `${g.firstName} ${g.lastName} ${g.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGuestSearch = guests.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(guestSearch.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil((activeTab === 'reservations' ? filteredBookings.length : filteredGuests.length) / itemsPerPage);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedGuests = filteredGuests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, activeTab]);

  // Re-fetch rooms with availability check if dates change in the booking modal
  useEffect(() => {
    if (isBookingModalOpen && bookingForm.checkInDate && bookingForm.checkOutDate) {
      setRoomLoading(true);
      const timer = setTimeout(async () => {
        try {
          const { data } = await api.fetchRooms({
            startDate: bookingForm.checkInDate,
            endDate: bookingForm.checkOutDate
          });
          setRooms(data);
        } catch (err) {
          console.error('Failed to fetch rooms for dates:', err);
        } finally {
          setRoomLoading(false);
        }
      }, 500); // Debounce to avoid too many requests while typing dates
      return () => clearTimeout(timer);
    } else if (!isBookingModalOpen) {
      // Refresh to default rooms when modal closes to restore dashboard stats
      loadAll();
    }
  }, [bookingForm.checkInDate, bookingForm.checkOutDate, isBookingModalOpen]);

  // ── Booking Handlers ────────────────────────────────────────────────────────
  const openNewBooking = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    setEditingBooking(null);
    setBookingForm({ 
      guestId: '', 
      roomIds: [], 
      checkInDate: today, 
      checkOutDate: tomorrow, 
      specialRequests: '' 
    });
    setGuestSearch('');
    setModalGuestTab('select');
    setInlineGuestForm({ firstName: '', lastName: '', email: '', phone: '', idType: '', idNumber: '' });
    setIsBookingModalOpen(true);
  };

  const openEditBooking = (b) => {
    setEditingBooking(b);
    setBookingForm({
      guestId: b.guestId,
      roomIds: b.Rooms?.map(r => r.id) || [],
      checkInDate: b.checkInDate?.split('T')[0] || '',
      checkOutDate: b.checkOutDate?.split('T')[0] || '',
      specialRequests: b.specialRequests || ''
    });
    setGuestSearch(`${b.Guest?.firstName} ${b.Guest?.lastName}`);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.guestId) return toast.error('Please select a guest');
    if (!bookingForm.roomIds.length) return toast.error('Please select at least one room');
    try {
      if (editingBooking) {
        await api.updateBooking(editingBooking.id, {
          checkInDate: bookingForm.checkInDate,
          checkOutDate: bookingForm.checkOutDate,
          specialRequests: bookingForm.specialRequests
        });
        toast.success('Booking updated');
      } else {
        await api.createBooking(bookingForm);
        toast.success('Reservation created');
      }
      setIsBookingModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleAction = async (action, bookingId) => {
    const labels = { 
      checkIn: 'Checked in', 
      checkOut: 'Checked out', 
      cancel: 'Cancelled',
      confirm: 'Reservation confirmed'
    };
    const fns = { 
      checkIn: api.checkInBooking, 
      checkOut: api.checkOutBooking, 
      cancel: api.cancelBooking,
      confirm: api.confirmBooking
    };
    try {
      await fns[action](bookingId);
      toast.success(labels[action]);
      setConfirmAction(null);
      if (selectedBookingForDetails?.id === bookingId) {
        // Refresh details modal if open
        const { data: updatedBooking } = await api.fetchBookings(); // A bit overkill but works
        const target = updatedBooking.find(b => b.id === bookingId);
        setSelectedBookingForDetails(target);
      }
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const requestAction = async (action, booking) => {
    if (action === 'cancel') {
      if (window.confirm(`Cancel booking for ${booking.Guest?.firstName} ${booking.Guest?.lastName}?`)) {
        handleAction('cancel', booking.id);
      }
      return;
    }

    if (action === 'checkOut') {
      try {
        setLoading(true);
        const { data } = await api.fetchBookingSummary(booking.id);
        setSummaryData(data);
        setIsSummaryOpen(true);
      } catch (err) {
        toast.error('Failed to load billing summary');
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setConfirmAction({
      action,
      bookingId: booking.id,
      guestName: `${booking.Guest?.firstName} ${booking.Guest?.lastName}`,
      roomNums: booking.Rooms?.map(r => `#${r.roomNumber}`).join(', ') || '—',
      checkInDate: fmtDate(booking.checkInDate),
      checkOutDate: fmtDate(booking.checkOutDate),
    });
  };

  const toggleRoom = (roomId) => {
    setBookingForm(prev => ({
      ...prev,
      roomIds: prev.roomIds.includes(roomId)
        ? prev.roomIds.filter(id => id !== roomId)
        : [...prev.roomIds, roomId]
    }));
  };

  // ── Inline Guest Create (inside booking modal) ───────────────────────────────
  const handleInlineGuestCreate = async (e) => {
    e.preventDefault();
    try {
      const { data: newGuest } = await api.createGuest(inlineGuestForm);
      // Refresh guest list and auto-select the new guest
      const { data: updatedGuests } = await api.fetchGuests();
      setGuests(updatedGuests);
      setBookingForm(p => ({ ...p, guestId: newGuest.id }));
      setGuestSearch(`${newGuest.firstName} ${newGuest.lastName}`);
      setModalGuestTab('select');
      setInlineGuestForm({ firstName: '', lastName: '', email: '', phone: '', idType: '', idNumber: '' });
      toast.success('Guest added and selected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create guest');
    }
  };

  // ── Guest Handlers ──────────────────────────────────────────────────────────
  const openNewGuest = () => {
    setEditingGuest(null);
    setGuestForm({ firstName: '', lastName: '', email: '', phone: '', idType: '', idNumber: '', notes: '' });
    setIsGuestModalOpen(true);
  };

  const openEditGuest = (g) => {
    setEditingGuest(g);
    setGuestForm({ firstName: g.firstName, lastName: g.lastName, email: g.email, phone: g.phone, idType: g.idType || '', idNumber: g.idNumber || '', notes: g.notes || '' });
    setIsGuestModalOpen(true);
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await api.updateGuest(editingGuest.id, guestForm);
        toast.success('Guest updated');
      } else {
        await api.createGuest(guestForm);
        toast.success('Guest registered');
      }
      setIsGuestModalOpen(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!window.confirm('Remove this guest?')) return;
    try {
      await api.deleteGuest(id);
      toast.success('Guest removed');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: bookings.length,
    checkedIn: bookings.filter(b => b.status === 'Checked In').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    revenue: bookings
      .filter(b => !['Cancelled'].includes(b.status))
      .reduce((s, b) => s + parseFloat(b.totalAmount || 0), 0)
  }), [bookings]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Booking <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage reservations, check-ins, and guest records.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search guests, status..." 
              className="pl-10 h-10 rounded-xl border-[var(--border)]/10 bg-[var(--theme-header-bg)]" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <Button
            onClick={() => activeTab === 'reservations' ? openNewBooking() : openNewGuest()}
            className="bg-[var(--theme-primary)] hover:opacity-90 flex items-center justify-center gap-2 rounded-xl h-10 px-6 shadow-lg shadow-[var(--theme-primary)]/20"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {activeTab === 'reservations' ? 'New Reservation' : 'Add Guest'}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, color: 'text-[var(--theme-text)]', icon: CalendarDays, bg: 'bg-gray-50' },
          { label: 'Checked In', value: stats.checkedIn, color: 'text-green-600', icon: LogIn, bg: 'bg-green-50' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-600', icon: CheckCircle2, bg: 'bg-blue-50' },
          { label: 'Total Revenue', value: `ETB ${stats.revenue.toLocaleString()}`, color: 'text-[var(--theme-primary)]', icon: DollarSign, bg: 'bg-[var(--theme-primary)]/5' },
        ].map(s => (
          <Card key={s.label} className="border-none shadow-sm rounded-xl bg-[var(--theme-header-bg)] text-[var(--theme-text)] overflow-hidden">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--theme-text)] opacity-40">{s.label}</p>
                <p className={`text-2xl font-black mt-2 italic tracking-tight ${s.color}`}>{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon && <s.icon className={`h-5 w-5 ${s.color}`} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reservations" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-[var(--theme-header-bg)] p-1 rounded-xl shadow-sm border-none flex w-full sm:w-fit overflow-x-auto noscrollbar">
            <TabsTrigger value="reservations" className="flex-1 sm:flex-none rounded-xl px-8 py-2.5 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
              Reservations
            </TabsTrigger>
            <TabsTrigger value="guests" className="flex-1 sm:flex-none rounded-xl px-8 py-2.5 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
              Guests
            </TabsTrigger>
          </TabsList>

          {!loading && (
            <div className="flex items-center justify-between sm:justify-end gap-4 bg-[var(--theme-header-bg)] px-4 py-2 rounded-xl shadow-sm border border-[var(--border)]/5 w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50 border border-[var(--border)]/10"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50 border border-[var(--border)]/10"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Reservations Tab ── */}
        <TabsContent value="reservations" className="mt-0 space-y-4">
          {/* Status Filter Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 noscrollbar">
            {['All', 'Confirmed', 'Checked In', 'Checked Out', 'Pending', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all border ${
                  statusFilter === status
                    ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                    : 'bg-[var(--theme-header-bg)] text-[var(--theme-text)] opacity-60 border-none hover:text-[var(--theme-primary)]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-[var(--theme-bg)]/40 border-b border-[var(--border)]/10">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 px-6">Guest</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Rooms</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Check-In</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Check-Out</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Nights</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Amount</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Status</TableHead>
                      <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map(b => (
                      <TableRow key={b.id} className="group hover:bg-[var(--theme-bg)]/20 transition-colors border-b border-[var(--border)]/5 last:border-0 relative">
                        <TableCell className="py-5 px-6">
                          <div>
                            <p className="font-bold text-[var(--theme-text)] text-sm">{b.Guest?.firstName} {b.Guest?.lastName}</p>
                            <p className="text-[10px] text-[var(--theme-text)] opacity-40 font-medium">{b.Guest?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                            {b.Rooms?.map(r => (
                              <span key={r.id} className="text-[9px] font-black px-2 py-1 bg-[var(--theme-bg)] text-[var(--theme-text)] border border-[var(--border)]/5 rounded-lg shadow-sm">#{r.roomNumber}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[var(--theme-text)] opacity-90 font-bold whitespace-nowrap">{fmtDate(b.checkInDate)}</TableCell>
                        <TableCell className="text-xs text-[var(--theme-text)] opacity-90 font-bold whitespace-nowrap">{fmtDate(b.checkOutDate)}</TableCell>
                        <TableCell className="text-[10px] font-black uppercase tracking-tighter text-[var(--theme-text)] opacity-50">
                          {calcNights(b.checkInDate, b.checkOutDate)}n
                        </TableCell>
                        <TableCell className="text-sm font-black italic tracking-tight text-[var(--theme-text)]">
                          ETB {parseFloat(b.totalAmount).toLocaleString()}
                        </TableCell>
                        <TableCell className="py-5"><StatusBadge status={b.status} /></TableCell>
                        <TableCell className="text-right py-5 px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBookingForDetails(b)}
                              className="h-8 text-[9px] font-black uppercase tracking-widest text-[var(--theme-text)] opacity-60 hover:opacity-100 bg-[var(--theme-bg)]/50 hover:bg-[var(--theme-bg)] rounded-xl px-3 border border-[var(--border)]/5">
                              Details
                            </Button>
                            
                            <div className="flex gap-1.5 border-l border-[var(--border)]/10 pl-2">
                              {b.status === 'Pending' && (
                                <Button variant="ghost" size="sm" onClick={() => handleAction('confirm', b.id)}
                                  className="h-8 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl px-3 gap-1.5 animate-pulse border border-blue-100/50">
                                  Confirm
                                </Button>
                              )}
                              {b.status === 'Confirmed' && (
                                <Button variant="ghost" size="sm" onClick={() => requestAction('checkIn', b)}
                                  className="h-8 text-[9px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50 rounded-xl px-3 gap-1.5 border border-green-100/50">
                                  <LogIn className="h-3 w-3" /> IN
                                </Button>
                              )}
                              {b.status === 'Checked In' && (
                                <Button variant="ghost" size="sm" onClick={() => requestAction('checkOut', b)}
                                  className="h-8 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl px-3 gap-1.5 border border-blue-100/50">
                                  <LogOut className="h-3 w-3" /> OUT
                                </Button>
                              )}
                              
                              {['Confirmed', 'Pending'].includes(b.status) && (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEditBooking(b)}
                                    className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => requestAction('cancel', b)}
                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedBookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-20 text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                          No reservations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ── Guests Tab ── */}
        <TabsContent value="guests" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-[var(--theme-bg)]/40 border-b border-[var(--border)]/10">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4 px-6">Name</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Email</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Phone</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">ID Details</TableHead>
                      <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGuests.map(g => (
                      <TableRow key={g.id} className="group hover:bg-[var(--theme-bg)]/20 transition-colors border-b border-[var(--border)]/5 last:border-0">
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-[var(--theme-primary)] mb-0.5 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-[var(--theme-primary)]/20 italic">
                              {g.firstName[0]}{g.lastName[0]}
                            </div>
                            <span className="font-bold text-[var(--theme-text)] text-sm tracking-tight">{g.firstName} {g.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 text-sm text-[var(--theme-text)] opacity-80 font-medium">{g.email}</TableCell>
                        <TableCell className="py-5 text-sm text-[var(--theme-text)] opacity-80 font-medium">{g.phone}</TableCell>
                        <TableCell className="py-5">
                          {g.idType && (
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-[var(--theme-bg)] rounded-lg border border-[var(--border)]/10 shadow-sm">
                              <span className="text-[9px] font-black uppercase text-[var(--theme-primary)]">{g.idType}</span>
                              <span className="text-[10px] font-bold text-[var(--theme-text)] opacity-60 tracking-wider overflow-hidden">{g.idNumber}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-5 px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditGuest(g)}
                              className="h-9 w-9 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all">
                              <Edit2 className="h-4.5 w-4.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteGuest(g.id)}
                              className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all">
                              <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedGuests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                          No guests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Checkout Billing Summary Slider ── */}
      {isSummaryOpen && summaryData && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSummaryOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
            {/* Slider Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-normal text-gray-900 italic tracking-tight">Checkout Review</h2>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">
                  Booking #{summaryData.bookingId} · {summaryData.guestName}
                </p>
              </div>
              <button onClick={() => setIsSummaryOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Slider Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Accommodation Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[var(--theme-primary)]">
                  <Bed className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Accommodation</h3>
                </div>
                <div className="space-y-3 bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                  {summaryData.roomCharges.map((charge, i) => (
                    <div key={i} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Room #{charge.roomNumber}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                          {charge.roomType} · {charge.billedNights} night{charge.billedNights !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">ETB {charge.total.toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Subtotal</span>
                    <span className="text-sm font-bold text-[var(--theme-primary)]">ETB {parseFloat(summaryData.roomTotal).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Food & Beverage Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Utensils className="h-4 w-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Unpaid Food Bills (Charged to Room)</h3>
                </div>
                {summaryData.foodOrders.length > 0 ? (
                  <div className="space-y-4">
                    {summaryData.foodOrders.map((order, i) => (
                      <div key={i} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order #{order.id} · {fmtDate(order.createdAt)}</span>
                          <span className="text-xs font-bold text-gray-900 border boder-gray-100 px-2 py-0.5 rounded-lg bg-white">ETB {parseFloat(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, j) => (
                            <p key={j} className="text-[11px] text-gray-600 flex justify-between">
                              <span>{item.quantity}× {item.name}</span>
                              <span className="opacity-40">ETB {parseFloat(item.price).toFixed(2)}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-5 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Food Subtotal</span>
                      <span className="text-sm font-bold text-orange-500">ETB {parseFloat(summaryData.foodTotal).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">No outstanding food bills</p>
                  </div>
                )}
              </div>
            </div>

            {/* Slider Footer */}
            <div className="p-8 bg-gray-50/80 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                  <p className="text-3xl font-normal text-gray-900 italic tracking-tight">ETB {parseFloat(summaryData.grandTotal).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSummaryOpen(false)}
                  className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setIsSummaryOpen(false);
                    handleAction('checkOut', summaryData.bookingId);
                  }}
                  className="h-12 rounded-xl bg-[var(--theme-primary)] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[var(--theme-primary)]/20 shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-header-bg)] border-none rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--theme-bg)]/50 flex-shrink-0">
              <h2 className="text-xl font-bold text-[var(--theme-text)] italic uppercase">
                {editingBooking ? 'Edit Reservation' : 'New Reservation'}
              </h2>
              {totalAmount > 0 && (
                <p className="text-sm font-normal text-[var(--theme-primary)] mt-1">
                  Estimated Total: ETB {totalAmount.toFixed(2)}
                </p>
              )}
              <button onClick={() => setIsBookingModalOpen(false)} className="text-[var(--theme-text)] opacity-30 hover:opacity-100 transition-opacity">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1 thin-scrollbar">
                {/* ── Guest Section with tabs ── */}
                {!editingBooking ? (
                  <div className="space-y-3">
                    {/* Mini tab switcher */}
                    <div className="flex items-center gap-1 bg-[var(--theme-bg)] p-1 rounded-xl w-fit">
                      <button type="button"
                        onClick={() => setModalGuestTab('select')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${
                          modalGuestTab === 'select' ? 'bg-[var(--theme-header-bg)] shadow text-[var(--theme-text)]' : 'text-[var(--theme-text)] opacity-40 hover:opacity-60'
                        }`}>
                        Select Guest
                      </button>
                      <button type="button"
                        onClick={() => setModalGuestTab('add')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all ${
                          modalGuestTab === 'add' ? 'bg-[var(--theme-header-bg)] shadow text-[var(--theme-text)]' : 'text-[var(--theme-text)] opacity-40 hover:opacity-60'
                        }`}>
                        + Add Guest
                      </button>
                    </div>

                    {/* Select Guest panel */}
                    {modalGuestTab === 'select' && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Search guest by name..."
                          value={guestSearch}
                          onChange={e => { setGuestSearch(e.target.value); setBookingForm(p => ({ ...p, guestId: '' })); }}
                          className="rounded-xl"
                        />
                        {guestSearch && !bookingForm.guestId && (
                          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm max-h-36 overflow-y-auto">
                            {filteredGuestSearch.slice(0, 6).map(g => (
                              <button key={g.id} type="button"
                                onClick={() => { setBookingForm(p => ({ ...p, guestId: g.id })); setGuestSearch(`${g.firstName} ${g.lastName}`); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0">
                                <span className="font-normal">{g.firstName} {g.lastName}</span>
                                <span className="text-gray-400 text-xs ml-2">{g.email}</span>
                              </button>
                            ))}
                            {filteredGuestSearch.length === 0 && (
                              <div className="px-4 py-3 text-xs text-gray-400 font-medium flex items-center justify-between">
                                <span>No guests found.</span>
                                <button type="button" onClick={() => setModalGuestTab('add')}
                                  className="text-[var(--theme-primary)] font-semibold hover:underline">+ Add Guest</button>
                              </div>
                            )}
                          </div>
                        )}
                        {bookingForm.guestId && (
                          <p className="text-xs text-green-600 font-normal flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Guest selected
                          </p>
                        )}
                      </div>
                    )}

                    {/* Add Guest panel */}
                    {modalGuestTab === 'add' && (
                      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">New Guest Details</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold uppercase text-gray-400">First Name *</label>
                            <Input required value={inlineGuestForm.firstName}
                              onChange={e => setInlineGuestForm(p => ({ ...p, firstName: e.target.value }))}
                              className="rounded-xl h-9 text-sm" placeholder="First name" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold uppercase text-gray-400">Last Name *</label>
                            <Input required value={inlineGuestForm.lastName}
                              onChange={e => setInlineGuestForm(p => ({ ...p, lastName: e.target.value }))}
                              className="rounded-xl h-9 text-sm" placeholder="Last name" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold uppercase text-gray-400">Email *</label>
                          <Input type="email" required value={inlineGuestForm.email}
                            onChange={e => setInlineGuestForm(p => ({ ...p, email: e.target.value }))}
                            className="rounded-xl h-9 text-sm" placeholder="email@example.com" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold uppercase text-gray-400">Phone *</label>
                          <Input required value={inlineGuestForm.phone}
                            onChange={e => setInlineGuestForm(p => ({ ...p, phone: e.target.value }))}
                            className="rounded-xl h-9 text-sm" placeholder="+251 912 345 678" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold uppercase text-[var(--theme-text)] opacity-40">ID Type</label>
                            <select value={inlineGuestForm.idType}
                              onChange={e => setInlineGuestForm(p => ({ ...p, idType: e.target.value }))}
                              className="w-full h-9 px-3 bg-[var(--theme-header-bg)] rounded-xl text-sm outline-none border border-[var(--border)] text-[var(--theme-text)]">
                              <option value="">None</option>
                              <option value="Passport">Passport</option>
                              <option value="National ID">National ID</option>
                              <option value="Driver License">Driver License</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-semibold uppercase text-[var(--theme-text)] opacity-40">ID Number</label>
                            <Input value={inlineGuestForm.idNumber}
                              onChange={e => setInlineGuestForm(p => ({ ...p, idNumber: e.target.value }))}
                              className="rounded-xl h-9 text-sm" placeholder="ID number" />
                          </div>
                        </div>
                        <Button type="button" onClick={handleInlineGuestCreate}
                          className="w-full h-10 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest rounded-xl text-xs">
                          Save Guest & Select
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Edit mode: just show the guest name, not editable */
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40 tracking-widest">Guest</label>
                    <Input value={guestSearch} disabled className="rounded-xl bg-[var(--theme-bg)]" />
                  </div>
                )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40 tracking-widest">Check-In Date</label>
                      <Input type="date" required value={bookingForm.checkInDate}
                        onChange={e => {
                          const newDate = e.target.value;
                          setBookingForm(p => {
                            let s = newDate;
                            let e = p.checkOutDate;
                            
                            // If checkout exists and is before/equal new checkin, decide whether to swap or clear
                            if (e && e <= s) {
                              // If they pick a date that makes the range invalid, 
                              // we follow the rolling logic: old checkin becomes start, but here it's easier to just swap
                              [s, e] = [e, s];
                            }
                            
                            return { ...p, checkInDate: s, checkOutDate: e };
                          });
                        }}
                        className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40 tracking-widest">Check-Out Date</label>
                      <Input type="date" required value={bookingForm.checkOutDate}
                        min={bookingForm.checkInDate}
                        onChange={e => {
                          const newDate = e.target.value;
                          setBookingForm(p => {
                            let s = p.checkInDate;
                            let end = newDate;
                            
                            if (s && end <= s) {
                              [s, end] = [end, s];
                            }
                            
                            return { ...p, checkInDate: s, checkOutDate: end };
                          });
                        }}
                      className="rounded-xl" />
                  </div>
                </div>

                {/* Room Selector (only for new bookings) */}
                {!editingBooking && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40 tracking-widest">
                        Select Rooms {roomLoading ? (
                          <span className="animate-pulse text-blue-500">(Checking availability...)</span>
                        ) : (
                          <span className="text-[var(--theme-text)] opacity-30">({availableRooms.length} available)</span>
                        )}
                      </label>
                      {bookingForm.roomIds.length > 0 && (
                        <span className="text-[10px] font-semibold text-[var(--theme-primary)]">{bookingForm.roomIds.length} selected</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 thin-scrollbar">
                      {availableRooms.map(room => {
                        const selected = bookingForm.roomIds.includes(room.id);
                        return (
                          <button key={room.id} type="button" onClick={() => toggleRoom(room.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selected ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5' : 'border-[var(--border)] hover:border-[var(--theme-primary)]/30'}`}>
                            <Bed className={`h-4 w-4 flex-shrink-0 ${selected ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)] opacity-30'}`} />
                            <div>
                              <p className={`text-xs font-semibold ${selected ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-text)] opacity-80'}`}>Room #{room.roomNumber}</p>
                              <p className="text-[9px] text-[var(--theme-text)] opacity-40 font-medium">{room.RoomType?.name} · ETB {room.RoomType?.basePrice}/night</p>
                            </div>
                            {selected && <CheckCircle2 className="h-4 w-4 text-[var(--theme-primary)] ml-auto" />}
                          </button>
                        );
                      })}
                      {availableRooms.length === 0 && (
                        <p className="col-span-2 text-center py-6 text-xs text-[var(--theme-text)] opacity-40 font-normal uppercase tracking-widest">No available rooms</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40 tracking-widest">Special Requests</label>
                  <textarea
                    rows={3}
                    value={bookingForm.specialRequests}
                    onChange={e => setBookingForm(p => ({ ...p, specialRequests: e.target.value }))}
                    placeholder="Any special requirements..."
                    className="w-full px-4 py-3 bg-[var(--theme-bg)] rounded-xl text-sm text-[var(--theme-text)] outline-none resize-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 transition-all border-none"
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--theme-bg)]/50 flex-shrink-0">
                <Button type="submit" className="w-full h-14 bg-[var(--theme-primary)] text-white font-bold uppercase tracking-widest rounded-none shadow-none active:brightness-90 transition-all">
                  {editingBooking ? 'Update Reservation' : 'Confirm Reservation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Guest Modal ── */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--theme-header-bg)] border-none rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--theme-bg)]/50 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-[var(--theme-text)] italic uppercase">
                {editingGuest ? 'Edit Guest' : 'Register Guest'}
              </h2>
              <button onClick={() => setIsGuestModalOpen(false)} className="text-[var(--theme-text)] opacity-30 hover:opacity-100">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleGuestSubmit} className="p-8 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">First Name</label>
                  <Input required placeholder="First name" value={guestForm.firstName} onChange={e => setGuestForm(p => ({ ...p, firstName: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Last Name</label>
                  <Input required placeholder="Last name" value={guestForm.lastName} onChange={e => setGuestForm(p => ({ ...p, lastName: e.target.value }))} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Email</label>
                <Input type="email" required placeholder="email@example.com" value={guestForm.email} onChange={e => setGuestForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Phone</label>
                <Input required placeholder="+251 912 345 678" value={guestForm.phone} onChange={e => setGuestForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40">ID Type</label>
                  <select value={guestForm.idType} onChange={e => setGuestForm(p => ({ ...p, idType: e.target.value }))}
                    className="w-full h-10 px-3 bg-[var(--theme-bg)] rounded-xl text-sm outline-none font-medium border border-[var(--border)] text-[var(--theme-text)]">
                    <option value="">None</option>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver License">Driver License</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-[var(--theme-text)] opacity-40">ID Number</label>
                  <Input placeholder="ID number" value={guestForm.idNumber} onChange={e => setGuestForm(p => ({ ...p, idNumber: e.target.value }))} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-400">Notes</label>
                <textarea rows={2} value={guestForm.notes} onChange={e => setGuestForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none resize-none" placeholder="Optional notes..." />
              </div>
              <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform">
                {editingGuest ? 'Update Guest' : 'Register Guest'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal (Check-In / Check-Out) ── */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--theme-header-bg)] border-none rounded-xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className={`p-6 ${confirmAction.action === 'checkIn' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${confirmAction.action === 'checkIn' ? 'bg-green-100' : 'bg-blue-100'}`}>
                {confirmAction.action === 'checkIn'
                  ? <LogIn className="h-6 w-6 text-green-600" />
                  : <LogOut className="h-6 w-6 text-blue-600" />
                }
              </div>
              <h3 className="text-lg font-semibold text-[var(--theme-text)] uppercase italic">
                {confirmAction.action === 'checkIn' ? 'Confirm Check-In' : 'Confirm Check-Out'}
              </h3>
              <p className="text-sm text-[var(--theme-text)] opacity-60 mt-1">
                {confirmAction.action === 'checkIn'
                  ? 'Please verify the guest details before checking in.'
                  : 'Please confirm before checking out this guest.'}
              </p>
            </div>
            <div className="p-6 space-y-1">
              {[
                { label: 'Guest', value: confirmAction.guestName },
                { label: 'Rooms', value: confirmAction.roomNums },
                { label: 'Check-In', value: confirmAction.checkInDate },
                { label: 'Check-Out', value: confirmAction.checkOutDate },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--theme-text)] opacity-40">{row.label}</span>
                  <span className="text-sm font-normal text-[var(--theme-text)]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <Button variant="outline" onClick={() => setConfirmAction(null)}
                className="flex-1 h-11 rounded-xl font-normal text-gray-600 border-gray-200 hover:bg-gray-50">
                Cancel
              </Button>
              <Button
                onClick={() => handleAction(confirmAction.action, confirmAction.bookingId)}
                className={`flex-1 h-11 rounded-xl font-semibold uppercase tracking-widest text-white shadow-lg active:scale-95 transition-transform ${
                  confirmAction.action === 'checkIn' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {confirmAction.action === 'checkIn' ? 'Check In' : 'Check Out'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* ── Booking Details Modal (ID, Receipt, etc.) ── */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-[var(--theme-header-bg)] border-none rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--theme-bg)]/50">
              <div>
                <h2 className="text-xl font-bold text-[var(--theme-text)] uppercase italic">Reservation Details</h2>
                <p className="text-xs text-[var(--theme-text)] opacity-40">Booking ID: #{selectedBookingForDetails.id}</p>
              </div>
              <button onClick={() => setSelectedBookingForDetails(null)} className="text-[var(--theme-text)] opacity-30 hover:opacity-100">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Grid Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--theme-text)] opacity-30 tracking-widest mb-1">Guest</p>
                    <p className="text-sm font-semibold">{selectedBookingForDetails.Guest?.firstName} {selectedBookingForDetails.Guest?.lastName}</p>
                    <p className="text-[10px] opacity-60">{selectedBookingForDetails.Guest?.phone}</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--theme-text)] opacity-30 tracking-widest mb-1">Status</p>
                    <StatusBadge status={selectedBookingForDetails.status} />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--theme-text)] opacity-30 tracking-widest mb-1">Check In</p>
                    <p className="text-sm font-semibold">{fmtDate(selectedBookingForDetails.checkInDate)}</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--theme-text)] opacity-30 tracking-widest mb-1">Check Out</p>
                    <p className="text-sm font-semibold">{fmtDate(selectedBookingForDetails.checkOutDate)}</p>
                 </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text)] opacity-40 border-l-4 border-[var(--theme-primary)] pl-3">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Image */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--theme-text)] opacity-40 uppercase tracking-widest">Guest ID (Front & Back)</p>
                    <div className="flex gap-2">
                      {selectedBookingForDetails.Guest?.idFront ? (
                        <a href={`${SERVER_BASE_URL}${selectedBookingForDetails.Guest.idFront}`} target="_blank" rel="noreferrer" 
                           className="flex-1 h-32 rounded-xl overflow-hidden border border-[var(--border)] group relative">
                          <img src={`${SERVER_BASE_URL}${selectedBookingForDetails.Guest.idFront}`} alt="ID Front" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Search className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      ) : (
                        <div className="flex-1 h-32 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200 uppercase tracking-widest">No Front ID</div>
                      )}
                      
                      {selectedBookingForDetails.Guest?.idBack ? (
                        <a href={`${SERVER_BASE_URL}${selectedBookingForDetails.Guest.idBack}`} target="_blank" rel="noreferrer" 
                           className="flex-1 h-32 rounded-xl overflow-hidden border border-[var(--border)] group relative">
                          <img src={`${SERVER_BASE_URL}${selectedBookingForDetails.Guest.idBack}`} alt="ID Back" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Search className="h-6 w-6 text-white" />
                          </div>
                        </a>
                      ) : (
                        <div className="flex-1 h-32 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200 uppercase tracking-widest">No Back ID</div>
                      )}
                    </div>
                  </div>

                  {/* Payment Receipt */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[var(--theme-text)] opacity-40 uppercase tracking-widest">Payment Receipt</p>
                    {selectedBookingForDetails.paymentReceipt ? (
                       <a href={`${SERVER_BASE_URL}${selectedBookingForDetails.paymentReceipt}`} target="_blank" rel="noreferrer" 
                          className="block h-32 rounded-xl overflow-hidden border border-[var(--border)] group relative">
                         <img src={`${SERVER_BASE_URL}${selectedBookingForDetails.paymentReceipt}`} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Search className="h-6 w-6 text-white" />
                         </div>
                       </a>
                    ) : (
                      <div className="h-32 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200 uppercase tracking-widest italic">No Receipt Uploaded</div>
                    )}
                    {selectedBookingForDetails.Bank && (
                      <p className="text-[10px] font-medium text-[var(--theme-primary)]">Selected Bank: {selectedBookingForDetails.Bank.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-text)] opacity-40 border-l-4 border-[var(--theme-primary)] pl-3">Notes & Requests</h3>
                 <div className="p-4 bg-[var(--theme-bg)] rounded-xl border border-[var(--border)]/10 text-sm italic opacity-80">
                    {selectedBookingForDetails.specialRequests || 'No special requests.'}
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex gap-3 bg-[var(--theme-bg)]/50">
               {selectedBookingForDetails.status === 'Pending' && (
                 <Button onClick={() => handleAction('confirm', selectedBookingForDetails.id)} className="flex-1 bg-[var(--theme-primary)] text-white gap-2 rounded-xl uppercase tracking-widest font-bold text-xs h-12 shadow-lg">
                    <CheckCircle2 className="h-4 w-4" /> Confirm Reservation
                 </Button>
               )}
               {selectedBookingForDetails.status === 'Confirmed' && (
                 <Button onClick={() => { handleAction('checkIn', selectedBookingForDetails.id); setSelectedBookingForDetails(null); }} className="flex-1 bg-green-600 text-white gap-2 rounded-xl uppercase tracking-widest font-bold text-xs h-12 shadow-lg">
                    <LogIn className="h-4 w-4" /> Check In Guest
                 </Button>
               )}
               <Button variant="outline" onClick={() => setSelectedBookingForDetails(null)} className="px-8 rounded-xl uppercase tracking-widest font-bold text-xs h-12 border-gray-200">
                  Close
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
