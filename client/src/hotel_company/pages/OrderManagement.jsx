import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Bell,
  Trash2,
  Timer,
  ShoppingBag,
  Utensils,
  Table as TableIcon,
  Bed,
  Edit2,
  MoreVertical,
  Minus,
  History,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as api from '@/api';
import { toast } from 'sonner';

const statusConfig = {
  'Pending': { color: 'text-orange-500', bg: 'bg-orange-50', icon: Timer, label: 'Pending' },
  'In Progress': { color: 'text-blue-500', bg: 'bg-blue-50', icon: ChefHat, label: 'Kitchen' },
  'Ready': { color: 'text-yellow-500', bg: 'bg-yellow-50', icon: Bell, label: 'Ready' },
  'Completed': { color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2, label: 'Served' },
  'Cancelled': { color: 'text-red-500', bg: 'bg-red-50', icon: XCircle, label: 'Cancelled' },
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const { socket } = useSocket();

  // History tab state
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'Completed' | 'Cancelled'
  const [historyDate, setHistoryDate] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Live Kitchen state
  const [kitchenStatusFilter, setKitchenStatusFilter] = useState('Pending'); // 'Pending' | 'In Progress' | 'Ready'

  // New Order State
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderFormData, setOrderFormData] = useState({
    orderType: 'Dine-in',
    tableNumber: '',
    bookingId: '',
    paymentType: 'Pay Now',
    items: []
  });

  // Table CRUD State
  const [tableFormData, setTableFormData] = useState({ number: '', capacity: 2, status: 'Available' });
  const [editingTableId, setEditingTableId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('orderStatusUpdate', (data) => {
        setOrders(prev => prev.map(o => o.id === data.id ? { ...o, status: data.status } : o));
      });
      socket.on('newOrder', (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        toast.success('New order received!', { icon: <Bell className="h-4 w-4" /> });
      });
      return () => {
        socket.off('orderStatusUpdate');
        socket.off('newOrder');
      };
    }
  }, [socket]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, menuRes, tablesRes, categoriesRes] = await Promise.all([
        api.fetchOrders(),
        api.fetchMenuItems(),
        api.fetchDiningTables(),
        api.fetchMenuCategories()
      ]);
      setOrders(ordersRes.data);
      setMenuItems(menuRes.data);
      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveBookings = async () => {
    try {
      const res = await api.fetchActiveBookings();
      setActiveBookings(res.data);
    } catch (error) {
      toast.error('Failed to load active rooms');
    }
  };

  // Order Handlers
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateOrder = async () => {
    if (selectedItems.length === 0) return toast.error('Add items to order');
    if (orderFormData.orderType === 'Dine-in' && !orderFormData.tableNumber) return toast.error('Select a table');
    if (orderFormData.orderType === 'Room Service' && !orderFormData.bookingId) {
      return toast.error('Select a room');
    }

    try {
      const data = {
        ...orderFormData,
        tableNumber: orderFormData.tableNumber || null,
        bookingId: orderFormData.bookingId || null,
        items: selectedItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: i.notes }))
      };
      await api.createOrder(data);
      toast.success('Order created');
      setIsOrderModalOpen(false);
      setSelectedItems([]);
      setOrderFormData({ orderType: 'Dine-in', tableNumber: '', bookingId: '', items: [] });
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  // Table CRUD Handlers
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTableId) {
        await api.updateDiningTable(editingTableId, tableFormData);
        toast.success('Table updated');
      } else {
        await api.createDiningTable(tableFormData);
        toast.success('Table created');
      }
      setIsTableModalOpen(false);
      setTableFormData({ number: '', capacity: 2, status: 'Available' });
      setEditingTableId(null);
      const res = await api.fetchDiningTables();
      setTables(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm('Delete this table?')) {
      try {
        await api.deleteDiningTable(id);
        setTables(tables.filter(t => t.id !== id));
        toast.success('Table deleted');
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  const addItemToOrder = (item) => {
    const existing = selectedItems.find(i => i.menuItemId === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, notes: '' }]);
    }
  };

  const removeItemFromOrder = (menuItemId) => {
    setSelectedItems(selectedItems.filter(i => i.menuItemId !== menuItemId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Order <span className="text-[var(--theme-primary)]">Terminal</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Manage kitchen workflow and dining hall layout.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsOrderModalOpen(true)} className="bg-[var(--theme-primary)] rounded-xl gap-2">
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="kitchen" className="w-full">
        <TabsList className="bg-transparent border-b border-[var(--border)]/10 w-full justify-start rounded-none h-auto p-0 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabsTrigger value="kitchen" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] shrink-0">Live Kitchen</TabsTrigger>
          <TabsTrigger value="tables" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] shrink-0">Table Management</TabsTrigger>
          <TabsTrigger value="history" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] flex items-center gap-2 shrink-0">
            <History className="h-3 w-3" /> Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kitchen">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders..." className="pl-10 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3 mb-6">
            {['Pending', 'In Progress', 'Ready'].map(status => {
              const Icon = statusConfig[status].icon;
              const isActive = kitchenStatusFilter === status;
              const count = orders.filter(o => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setKitchenStatusFilter(status)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-md scale-105'
                      : 'bg-[var(--theme-header-bg)] text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--theme-primary)]' : statusConfig[status].color}`} />
                  <span className="text-xs font-semibold uppercase tracking-widest">{statusConfig[status].label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-black/5'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders Table */}
          <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto -mx-1 px-1">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-[var(--theme-bg)]/30">
                  <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6">Order #</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Type</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Location & Guest</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Items</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Time</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {(() => {
                  const filteredOrders = orders
                    .filter(o => o.status === kitchenStatusFilter)
                    .filter(o => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (
                        String(o.id).includes(q) ||
                        o.orderType?.toLowerCase().includes(q) ||
                        String(o.tableNumber || '').toLowerCase().includes(q) ||
                        o.guestName?.toLowerCase().includes(q)
                      );
                    });

                  if (!filteredOrders.length) {
                    const Icon = statusConfig[kitchenStatusFilter].icon;
                    return (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center text-gray-400">
                          <Icon className="h-8 w-8 opacity-20 mx-auto mb-3" />
                          <p className="text-sm font-medium">No {kitchenStatusFilter.toLowerCase()} orders</p>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return filteredOrders.map(order => (
                    <TableRow key={order.id} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors">
                      <TableCell className="pl-6">
                        <span className="font-extrabold text-xs uppercase text-black">#{order.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide">{order.orderType}</span>
                          {order.paymentType === 'Charge to Room' && (
                            <Badge className="w-fit bg-amber-500/10 text-amber-500 border-none text-[8px] px-1.5 py-0 uppercase">Room Charge</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {order.orderType === 'Dine-in' ? `Table ${order.tableNumber}` : 
                             order.orderType === 'Room Service' ? `Room ${order.Booking?.Rooms?.[0]?.roomNumber}` : 'Takeaway'}
                          </span>
                          {order.guestName && <span className="text-[10px] text-gray-500">{order.guestName}</span>}
                          {order.phone && <span className="text-[10px] text-gray-400">📞 {order.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[200px]">
                          {order.OrderItems?.map(item => (
                            <div key={item.id} className="text-[11px] text-gray-700 leading-tight">
                              <span className="font-bold opacity-70 mr-1">{item.quantity}×</span>
                              <span>{item.MenuItem?.name}</span>
                              {item.notes && <span className="text-gray-400 italic block ml-3">"{item.notes}"</span>}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono font-medium opacity-70">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          {kitchenStatusFilter === 'Pending' && (
                            <Button size="sm" onClick={() => handleStatusChange(order.id, 'In Progress')} className="h-8 bg-blue-500 hover:bg-blue-600 rounded-xl text-[10px] uppercase tracking-wider font-bold">
                              Accept
                            </Button>
                          )}
                          {kitchenStatusFilter === 'In Progress' && (
                            <Button size="sm" onClick={() => handleStatusChange(order.id, 'Ready')} className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl text-[10px] uppercase tracking-wider font-bold hover:text-black">
                              Ready
                            </Button>
                          )}
                          {kitchenStatusFilter === 'Ready' && (
                            <Button size="sm" onClick={() => handleStatusChange(order.id, 'Completed')} className="h-8 bg-green-500 hover:bg-green-600 rounded-xl text-[10px] uppercase tracking-wider font-bold">
                              Serve
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(order.id, 'Cancelled')} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </Card>
        </TabsContent>

        <TabsContent value="tables">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-normal">Restaurant Layout</h2>
            <Button onClick={() => { setEditingTableId(null); setTableFormData({number:'', capacity:2, status:'Available'}); setIsTableModalOpen(true); }} className="rounded-xl bg-black text-white gap-2">
              <Plus className="h-4 w-4" /> Add Table
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
             {tables.map(table => (
               <Card key={table.id} className={`rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${table.status === 'Available' ? 'bg-white border-green-100 hover:border-green-300 shadow-sm' : 'bg-gray-50 border-red-100 opacity-95'}`}>
                 <CardContent className="p-0 flex flex-col relative overflow-hidden">
                   <div className={`absolute top-0 w-full h-1 ${table.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
                   <div className="p-4 flex flex-col items-start gap-3">
                     <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-inner ${table.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                       <TableIcon className="h-5 w-5" />
                     </div>
                     <div className="flex flex-col items-start overflow-hidden">
                       <h3 className="font-black text-lg text-gray-800 tracking-tight truncate w-full uppercase leading-none">T-{table.number}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{table.capacity} Seats</p>
                       <Badge variant="outline" className={`mt-2 rounded-lg text-[9px] uppercase font-black tracking-widest px-2 py-0.5 ${table.status === 'Available' ? 'text-green-600 border-green-100 bg-green-50' : 'text-red-600 border-red-100 bg-red-50'}`}>{table.status}</Badge>
                     </div>
                   </div>
                   <div className="flex w-full border-t border-gray-100 divide-x divide-gray-100 bg-gray-50/30">
                     <button onClick={() => { setEditingTableId(table.id); setTableFormData(table); setIsTableModalOpen(true); }} className="flex-1 py-2.5 text-gray-500 hover:text-indigo-600 hover:bg-white transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider"><Edit2 className="h-3 w-3" /> Edit</button>
                     <button onClick={() => handleDeleteTable(table.id)} className="flex-1 py-2.5 text-red-400 hover:text-red-600 hover:bg-white transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider"><Trash2 className="h-3 w-3" /> Delete</button>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ORDER HISTORY TAB ─────────────────────────────────────────────── */}
        <TabsContent value="history">
          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order #, type, or table..."
                className="pl-10 rounded-xl"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 opacity-40" />
              {['all', 'Completed', 'Cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${
                    historyFilter === f
                      ? f === 'Cancelled'
                        ? 'bg-red-500/10 text-red-500'
                        : f === 'Completed'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                      : 'bg-[var(--theme-header-bg)] opacity-50 hover:opacity-100'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
              <input
                type="date"
                value={historyDate}
                onChange={e => setHistoryDate(e.target.value)}
                className="h-8 rounded-xl border border-[var(--border)]/20 bg-[var(--theme-header-bg)] px-3 text-[10px] font-semibold focus:outline-none"
              />
              {historyDate && (
                <button onClick={() => setHistoryDate('')} className="text-[10px] opacity-40 hover:opacity-100 font-semibold">Clear</button>
              )}
            </div>
          </div>

          {/* Summary chips */}
          {(() => {
            const hist = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));
            const completed = hist.filter(o => o.status === 'Completed');
            const cancelled = hist.filter(o => o.status === 'Cancelled');
            const totalRevenue = completed.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
            return (
              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { label: 'Total Orders', value: hist.length, color: 'text-[var(--theme-primary)]', bg: 'bg-[var(--theme-primary)]/10' },
                  { label: 'Completed', value: completed.length, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { label: 'Cancelled', value: cancelled.length, color: 'text-red-500', bg: 'bg-red-500/10' },
                  { label: 'Revenue', value: `ETB ${totalRevenue.toFixed(2)}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                ].map(chip => (
                  <div key={chip.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${chip.bg}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-widest ${chip.color}`}>{chip.label}</p>
                    <p className={`font-bold text-sm ${chip.color}`}>{chip.value}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* History table */}
          <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto -mx-1 px-1">
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-[var(--theme-bg)]/30">
                  <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 pl-6 w-8" />
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">#</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Type</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Location</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Items</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Date &amp; Time</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Status</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-right pr-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {(() => {
                  const filtered = orders
                    .filter(o => ['Completed', 'Cancelled'].includes(o.status))
                    .filter(o => historyFilter === 'all' || o.status === historyFilter)
                    .filter(o => {
                      if (!historySearch) return true;
                      const q = historySearch.toLowerCase();
                      return (
                        String(o.id).includes(q) ||
                        o.orderType?.toLowerCase().includes(q) ||
                        String(o.tableNumber || '').toLowerCase().includes(q)
                      );
                    })
                    .filter(o => {
                      if (!historyDate) return true;
                      return new Date(o.createdAt).toLocaleDateString() === new Date(historyDate).toLocaleDateString();
                    })
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                  if (!filtered.length) {
                    return (
                      <TableRow>
                        <TableCell colSpan={8} className="py-16 text-center">
                          <History className="h-8 w-8 opacity-10 mx-auto mb-3" />
                          <p className="text-sm opacity-30 font-medium">No order history found</p>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return filtered.map(order => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/50 transition-colors cursor-pointer group"
                        onClick={() => setExpandedOrder(order)}
                      >
                        <TableCell className="pl-6">
                           <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full group-hover:bg-[var(--theme-primary)]/10 group-hover:text-[var(--theme-primary)]">
                             <ChevronRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-all" />
                           </Button>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-sm">#{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.orderType === 'Dine-in' && <TableIcon className="h-3.5 w-3.5 opacity-40" />}
                            {order.orderType === 'Room Service' && <Bed className="h-3.5 w-3.5 opacity-40" />}
                            {order.orderType === 'Takeaway' && <ShoppingBag className="h-3.5 w-3.5 opacity-40" />}
                            <span className="text-sm font-medium">{order.orderType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {order.tableNumber ? `Table ${order.tableNumber}` : order.Booking?.Rooms?.[0]?.roomNumber ? `Room ${order.Booking.Rooms[0].roomNumber}` : (order.orderType === 'Room Service' ? 'Room Service' : '—')}
                          {order.paymentType === 'Charge to Room' && <p className="text-[8px] text-amber-500 font-bold uppercase mt-0.5">Charged to Room</p>}
                          {order.guestName && <p className="text-[10px] opacity-40 font-sans mt-0.5">{order.guestName}</p>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] border-[var(--border)]/20">
                            {order.OrderItems?.length ?? 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="opacity-40">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] font-bold border-none ${
                            order.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {order.status === 'Completed' ? <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : <XCircle className="h-3 w-3 mr-1 inline" />}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <p className="font-bold text-sm">
                            ETB {parseFloat(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ));
                })()}
              </TableBody>
            </Table>
          </div>
        </Card>
        </TabsContent>

      </Tabs>

      {/* New Order Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-none md:rounded-xl w-full max-w-[1400px] h-full md:h-[95vh] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="px-6 py-4 md:px-8 md:py-4 border-b flex justify-between items-center bg-gray-50/50">
               <div>
                 <h2 className="text-2xl font-semibold text-gray-900 italic tracking-tighter uppercase leading-none">Order Terminal</h2>
                 <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-0.5">POS Session | {new Date().toLocaleDateString()}</p>
               </div>
               <button onClick={() => setIsOrderModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><XCircle className="h-6 w-6 text-gray-300" /></button>
             </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Menu Area */}
                <div className="flex-1 md:w-2/3 p-4 md:p-8 overflow-hidden flex flex-col bg-gray-50/30">
                  <div className="mb-6 flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input 
                        placeholder="Search menu items..." 
                        className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-lg font-medium"
                        value={menuSearchTerm}
                        onChange={e => setMenuSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="h-14 px-6 rounded-2xl bg-white border-none shadow-sm text-xs font-bold uppercase tracking-widest outline-none cursor-pointer focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                    >
                      <option value="all">All Items</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {menuItems
                        .filter(i => i.availability)
                        .filter(i => {
                          const matchesSearch = i.name.toLowerCase().includes(menuSearchTerm.toLowerCase());
                          const matchesCategory = selectedCategory === 'all' || i.categoryId === selectedCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map(item => (
                          <Card key={item.id} className="group cursor-pointer hover:scale-[1.02] transition-all bg-white border-none rounded-xl overflow-hidden shadow-sm" onClick={() => addItemToOrder(item)}>
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                              {item.image ? <img src={`http://localhost:5000${item.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} /> : <div className="flex items-center justify-center h-full text-gray-300"><Utensils className="h-12 w-12" /></div>}
                              <div className="absolute top-3 right-3"><Badge className="bg-black/80 backdrop-blur-md text-white font-bold rounded-lg border-none px-2 py-1 text-[10px]">ETB {item.price}</Badge></div>
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-bold text-xs uppercase text-gray-900 line-clamp-1">{item.name}</h4>
                              <p className="text-[9px] opacity-40 font-bold uppercase mt-1 tracking-tighter">{item.MenuCategory?.name}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                    {menuItems.filter(i => i.availability).filter(i => {
                      const matchesSearch = i.name.toLowerCase().includes(menuSearchTerm.toLowerCase());
                      const matchesCategory = selectedCategory === 'all' || i.categoryId === selectedCategory;
                      return matchesSearch && matchesCategory;
                    }).length === 0 && (
                      <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3 opacity-40 italic">
                        <Utensils className="h-12 w-12" />
                        <p className="text-sm font-medium uppercase tracking-widest">No matching items found</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkout Area */}
                <div className="h-[40vh] md:h-auto md:w-1/3 flex flex-col bg-white border-t md:border-t-0 md:border-l shadow-2xl">
                  <div className="p-4 md:p-8 flex-1 overflow-y-auto space-y-8">
                    {/* Order Meta */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em]">Service Type</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {id: 'Dine-in', icon: TableIcon},
                            {id: 'Room Service', icon: Bed},
                            {id: 'Takeaway', icon: ShoppingBag}
                          ].map(t => (
                            <button 
                              key={t.id}
                                onClick={() => {
                                  const updates = { orderType: t.id };
                                  if (t.id === 'Room Service') {
                                    loadActiveBookings();
                                    updates.paymentType = 'Charge to Room'; // Default to charge to room
                                  }
                                  setOrderFormData({...orderFormData, ...updates});
                                }}
                                className={`flex flex-col items-center justify-center py-4 rounded-xl border-none transition-all ${orderFormData.orderType === t.id ? 'bg-black border-black text-white shadow-xl translate-y-[-2px]' : 'bg-gray-50 text-gray-400'}`}
                              >
                                <t.icon className="h-5 w-5 mb-2" />
                                <span className="text-[7px] font-semibold uppercase tracking-widest">{t.id}</span>
                              </button>
                          ))}
                        </div>
                    </div>

                    {orderFormData.orderType === 'Dine-in' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em]">Select Table</label>
                        <div className="grid grid-cols-4 gap-2">
                          {tables.filter(t => t.status === 'Available').map(t => (
                            <button 
                              key={t.id} 
                              onClick={() => setOrderFormData({...orderFormData, tableNumber: t.number})}
                              className={`h-10 rounded-xl border-2 font-semibold text-xs transition-all ${orderFormData.tableNumber === t.number ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-black text-black'}`}
                            >
                              {t.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {orderFormData.orderType === 'Room Service' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em]">Select Room</label>
                          <select 
                            className="w-full h-12 rounded-xl border-2 border-gray-100 px-4 font-normal text-sm bg-white"
                            value={orderFormData.bookingId}
                            onChange={e => setOrderFormData({...orderFormData, bookingId: e.target.value})}
                          >
                            <option value="">Choose active room...</option>
                            {activeBookings.map(b => (
                              <option key={b.id} value={b.id}>
                                Room {b.Rooms?.[0]?.roomNumber} - {b.Guest?.firstName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em]">Payment Option</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['Pay Now', 'Charge to Room'].map(p => (
                              <button 
                                key={p}
                                type="button"
                                onClick={() => setOrderFormData({...orderFormData, paymentType: p})}
                                className={`h-10 rounded-xl border-2 font-semibold text-[10px] uppercase transition-all ${orderFormData.paymentType === p ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-md' : 'border-gray-100 text-gray-400'}`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          {orderFormData.paymentType === 'Charge to Room' && (
                            <p className="text-[9px] text-amber-600 font-medium italic mt-1">
                              * This will be itemized in the guest's checkout bill.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-4 pt-4 border-t border-[var(--border)]/10">
                      <h3 className="text-[10px] font-semibold uppercase text-gray-400 tracking-[0.2em]">Current Cart</h3>
                      {selectedItems.map(item => (
                        <div key={item.menuItemId} className="group animate-in fade-in slide-in-from-right-4">
                           <div className="flex justify-between items-start mb-2 gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-[11px] uppercase text-gray-900 truncate">{item.name}</h4>
                                <p className="text-[10px] font-bold text-[var(--theme-primary)]">ETB {item.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
                                  <button onClick={() => {
                                      if (item.quantity > 1) {
                                        setSelectedItems(selectedItems.map(si => si.menuItemId === item.menuItemId ? {...si, quantity: si.quantity - 1} : si))
                                      } else {
                                        removeItemFromOrder(item.menuItemId)
                                      }
                                  }} className="h-6 w-6 rounded-md hover:bg-white border hover:border-black flex items-center justify-center transition-all bg-white shadow-sm"><Minus className="h-3 w-3" /></button>
                                  <span className="text-[11px] font-bold w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => addItemToOrder({id: item.menuItemId, name: item.name, price: item.price})} className="h-6 w-6 rounded-md hover:bg-white border hover:border-black flex items-center justify-center transition-all bg-white shadow-sm"><Plus className="h-3 w-3" /></button>
                                </div>
                                <button 
                                  onClick={() => removeItemFromOrder(item.menuItemId)}
                                  className="h-8 w-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                           </div>
                           <Input 
                             placeholder="Instructions (e.g. No onions)" 
                             className="h-9 rounded-xl bg-gray-50 text-[10px] border-none italic font-medium placeholder:font-normal focus:bg-white transition-all" 
                             value={item.notes}
                             onChange={e => setSelectedItems(selectedItems.map(si => si.menuItemId === item.menuItemId ? {...si, notes: e.target.value} : si))}
                           />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-black text-white rounded-t-xl space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Total Bill</span>
                      <span className="text-3xl font-semibold italic">ETB {selectedItems.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.quantity), 0).toFixed(2)}</span>
                    </div>
                    <Button onClick={handleCreateOrder} className="w-full h-16 bg-white text-black hover:bg-white/90 rounded-[24px] font-semibold uppercase tracking-widest text-sm shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                      Finalize Order
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Order History Slide-Out Panel */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${expandedOrder ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col ${expandedOrder ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Order #{expandedOrder?.id}</h2>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 flex items-center gap-1">
                <History className="h-3 w-3" /> {expandedOrder ? new Date(expandedOrder.createdAt).toLocaleString() : ''}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setExpandedOrder(null)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-xl">
              <XCircle className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
            {/* Meta context */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Type & Location</p>
                <div className="flex items-center gap-2">
                  {expandedOrder?.orderType === 'Dine-in' && <TableIcon className="h-4 w-4 text-[var(--theme-primary)]" />}
                  {expandedOrder?.orderType === 'Room Service' && <Bed className="h-4 w-4 text-[var(--theme-primary)]" />}
                  {expandedOrder?.orderType === 'Takeaway' && <ShoppingBag className="h-4 w-4 text-[var(--theme-primary)]" />}
                  <span className="font-bold text-sm text-gray-900">{expandedOrder?.orderType}</span>
                </div>
                <p className="text-xs font-mono font-medium text-gray-600 mt-2 text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded-md">
                   {expandedOrder?.tableNumber ? `Table ${expandedOrder.tableNumber}` : expandedOrder?.Booking?.Rooms?.[0]?.roomNumber ? `Room ${expandedOrder.Booking.Rooms[0].roomNumber}` : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Status</p>
                <Badge className={`text-xs font-bold border-none uppercase tracking-wider py-1 ${
                  expandedOrder?.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  {expandedOrder?.status === 'Completed' ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 inline" /> : <XCircle className="h-3.5 w-3.5 mr-1 inline" />}
                  {expandedOrder?.status}
                </Badge>
              </div>
            </div>

            {/* Guest Context */}
            {(expandedOrder?.guestName || expandedOrder?.phone || expandedOrder?.paymentType === 'Charge to Room') && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Guest Context</p>
                {expandedOrder?.guestName && <p className="font-semibold text-amber-900">{expandedOrder.guestName}</p>}
                {expandedOrder?.phone && <p className="text-sm text-amber-700">📞 {expandedOrder.phone}</p>}
                {expandedOrder?.paymentType === 'Charge to Room' && (
                  <Badge className="bg-amber-500 text-white border-none mt-2 font-black uppercase text-[10px] tracking-widest">Charged to Room Bill</Badge>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">Order Items ({expandedOrder?.OrderItems?.length})</p>
              <div className="space-y-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                {expandedOrder?.OrderItems?.map(item => (
                  <div key={item.id} className="flex flex-col py-2 border-b border-gray-200/50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <span className="bg-white border shadow-sm h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black text-gray-500">×{item.quantity}</span>
                        <div>
                           <span className="text-sm font-bold text-gray-900">{item.MenuItem?.name ?? 'Item'}</span>
                           {item.notes && (
                             <span className="text-xs italic text-gray-500 block mt-0.5 border-l-2 border-gray-200 pl-2">"{item.notes}"</span>
                           )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">ETB {parseFloat(item.priceAtOrder || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative z-10">
             <div className="bg-gray-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-xl">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Charged</span>
               <span className="text-2xl font-black italic">ETB {parseFloat(expandedOrder?.totalAmount || 0).toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Table CRUD Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border-none">
            <CardHeader className="p-6 bg-gray-50">
              <CardTitle className="text-xl font-semibold italic uppercase tracking-tighter">{editingTableId ? 'Edit Table' : 'Add New Table'}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-gray-400">Table Number</label>
                    <Input value={tableFormData.number} onChange={e => setTableFormData({...tableFormData, number: e.target.value})} placeholder="e.g. 101" className="rounded-xl border-2 h-12 font-normal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-gray-400">Capacity (Seats)</label>
                    <Input type="number" value={tableFormData.capacity} onChange={e => setTableFormData({...tableFormData, capacity: e.target.value})} className="rounded-xl border-2 h-12 font-normal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase text-gray-400">Initial Status</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Available', 'Occupied'].map(s => (
                         <Button key={s} size="sm" variant={tableFormData.status === s ? 'default' : 'outline'} className={`rounded-xl font-semibold text-[10px] ${tableFormData.status === s ? 'bg-black text-white' : ''}`} onClick={() => setTableFormData({...tableFormData, status: s})}>{s}</Button>
                       ))}
                    </div>
                  </div>
               </div>
               <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsTableModalOpen(false)} variant="outline" className="flex-1 rounded-xl h-12 font-extrabold uppercase text-xs">Cancel</Button>
                  <Button onClick={handleTableSubmit} className="flex-1 rounded-xl h-12 bg-black text-white font-extrabold uppercase text-xs">{editingTableId ? 'Save Changes' : 'Create Table'}</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
