import React, { useState, useEffect, useRef } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Timer,
  Bell,
  Utensils,
  Bed,
  ShoppingBag,
  Zap,
  X
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as api from '@/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { useTheme } from '../../context/ThemeContext';

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kitchenStatusFilter, setKitchenStatusFilter] = useState('Pending');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const socketRef = useRef();
  const { mode } = useTheme();

  useEffect(() => {
    loadOrders();

    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      const audio = new Audio('/notification.mp3'); // Optional: Add a sound later
      audio.play().catch(() => {}); 
      toast.success('New Order Received!', { 
        description: `${newOrder.orderType} order #${newOrder.id}`,
        icon: <Bell className="h-4 w-4 text-yellow-500" /> 
      });
    });

    socketRef.current.on('orderStatusUpdate', (data) => {
      setOrders(prev => prev.map(o => o.id === data.id ? { ...o, status: data.status } : o));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.fetchOrders();
      // Filter for active kitchen orders (Pending, In Progress, Ready)
      setOrders(res.data.filter(o => ['Pending', 'In Progress', 'Ready'].includes(o.status)));
    } catch (error) {
      toast.error('Failed to load kitchen orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      toast.success(`Order #${id} updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Priority Sorting: Room Service first, then by creation time
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.orderType === 'Room Service' && b.orderType !== 'Room Service') return -1;
    if (a.orderType !== 'Room Service' && b.orderType === 'Room Service') return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const getOrderTypeIcon = (type) => {
    switch(type) {
      case 'Room Service': return <Bed className="h-4 w-4" />;
      case 'Dine-in': return <Utensils className="h-4 w-4" />;
      case 'Takeaway': return <ShoppingBag className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeElapsed = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000);
    return minutes;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gap-6 -mt-6 -mx-6 bg-[var(--theme-bg)] p-6 overflow-hidden transition-colors duration-300 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <ChefHat className="h-7 w-7 text-black font-normal" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
              Kitchen <span className="text-[var(--theme-primary)]">Display</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Live Kitchen Feed</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-[var(--theme-header-bg)] px-6 py-2 rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--theme-text)] opacity-40 text-[9px] font-semibold uppercase tracking-widest mb-1">Pending Orders</p>
            <p className="text-2xl font-semibold text-[var(--theme-text)]">{orders.filter(o => o.status === 'Pending').length}</p>
          </div>
          <div className="bg-[var(--theme-header-bg)] px-6 py-2 rounded-2xl border border-[var(--border)]">
            <p className="text-[var(--theme-text)] opacity-40 text-[9px] font-semibold uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-2xl font-semibold text-yellow-500">{orders.filter(o => o.status === 'In Progress').length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Filter Chips */}
        <div className="flex gap-4 mb-6">
          {[
            { id: 'Pending', label: 'Pending', icon: Timer, color: 'text-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
            { id: 'In Progress', label: 'In Progress', icon: ChefHat, color: 'text-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
            { id: 'Ready', label: 'Ready', icon: Bell, color: 'text-yellow-500', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]' }
          ].map(status => {
            const isActive = kitchenStatusFilter === status.id;
            const count = orders.filter(o => o.status === status.id).length;
            const Icon = status.icon;
            
            return (
              <button
                key={status.id}
                onClick={() => setKitchenStatusFilter(status.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-[var(--theme-primary)] text-white shadow-md scale-[1.02]`
                    : 'bg-[var(--theme-header-bg)] border border-[var(--border)]/50 text-[var(--theme-text)] opacity-60 hover:opacity-100 hover:scale-[1.02]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-white' : 'text-[var(--theme-text)]'}`}>
                  {status.label}
                </span>
                {count > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--theme-bg)]/50 text-[var(--theme-text)]'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders Table */}
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden transition-all duration-300">
          <Table>
            <TableHeader className="bg-[var(--theme-bg)]/30">
              <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Order #</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Type</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Location</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4">Wait Time</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-widest py-4 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const filteredOrders = sortedOrders.filter(o => o.status === kitchenStatusFilter);

                if (!filteredOrders.length) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="py-20 text-center">
                        <ChefHat className="h-16 w-16 text-[var(--theme-text)] opacity-20 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-[var(--theme-text)] italic uppercase tracking-tighter opacity-50">Kitchen Clear</h2>
                        <p className="text-[var(--theme-text)] font-normal uppercase tracking-[0.3em] text-[10px] opacity-40">No {kitchenStatusFilter.toLowerCase()} orders</p>
                      </TableCell>
                    </TableRow>
                  );
                }

                return filteredOrders.map(order => (
                  <TableRow 
                    key={order.id}
                    className={`border-b border-[var(--border)]/5 transition-colors cursor-pointer ${
                      order.orderType === 'Room Service' ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-[var(--theme-bg)]/50'
                    } ${expandedOrder === order.id ? 'bg-[var(--theme-primary-transparent)]' : ''}`}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <TableCell className="pl-6">
                      <div className={`transition-transform duration-200 ${expandedOrder === order.id ? 'text-[var(--theme-primary)]' : 'opacity-40'}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-sm uppercase text-[var(--theme-text)]">#{order.id}</span>
                        {order.orderType === 'Room Service' && (
                          <Badge className="w-fit bg-yellow-500/20 text-yellow-600 border-none text-[8px] px-1.5 py-0 uppercase animate-pulse">
                            <Zap className="h-2 w-2 mr-1" /> Priority
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[var(--theme-text)] opacity-80">
                        {getOrderTypeIcon(order.orderType)}
                        <span className="text-xs font-semibold uppercase tracking-wide">{order.orderType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-[var(--theme-text)]">
                        {order.orderType === 'Dine-in' ? `Table ${order.tableNumber}` : 
                         order.orderType === 'Room Service' ? `Room ${order.Booking?.Rooms?.[0]?.roomNumber || '?'}` : 'Takeaway'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`h-3 w-3 ${getTimeElapsed(order.createdAt) > 15 && kitchenStatusFilter !== 'Ready' ? 'text-red-500' : 'text-[var(--theme-text)] opacity-60'}`} />
                        <span className={`text-xs font-mono font-medium ${getTimeElapsed(order.createdAt) > 15 && kitchenStatusFilter !== 'Ready' ? 'text-red-500 font-bold' : 'text-[var(--theme-text)] opacity-60'}`}>
                          {getTimeElapsed(order.createdAt)}m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      {kitchenStatusFilter === 'Pending' && (
                        <div className="flex justify-end gap-2">
                           <Button size="sm" onClick={() => handleStatusChange(order.id, 'In Progress')} className="h-8 bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/90 text-white rounded-xl text-[10px] uppercase tracking-wider font-bold shadow-[0_0_10px_var(--theme-primary-transparent)]">
                             Prepare
                           </Button>
                           <Button size="sm" variant="ghost" onClick={() => handleStatusChange(order.id, 'Cancelled')} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                           </Button>
                        </div>
                      )}
                      {kitchenStatusFilter === 'In Progress' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'Ready')} className="h-8 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-[10px] uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                          Ready
                        </Button>
                      )}
                      {kitchenStatusFilter === 'Ready' && (
                        <Button size="sm" onClick={() => handleStatusChange(order.id, 'Completed')} className="h-8 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                          Served
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Blurred Backdrop */}
      {expandedOrder && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setExpandedOrder(null)}
        />
      )}

      {/* Slide-out Panel for Order Details */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-[var(--theme-header-bg)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] border-l border-[var(--border)]/10 z-50 transform transition-transform duration-300 ease-in-out ${
          expandedOrder ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {expandedOrder && (() => {
          const order = orders.find(o => o.id === expandedOrder);
          if (!order) return null;

          return (
            <div className="h-full flex flex-col p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]/10">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--theme-text)]">Order #{order.id}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold text-[var(--theme-primary)] uppercase tracking-wider">{order.orderType}</span>
                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500">
                      {order.orderType === 'Dine-in' ? `Table ${order.tableNumber}` : 
                       order.orderType === 'Room Service' ? `Room ${order.Booking?.Rooms?.[0]?.roomNumber || '?'}` : 'Takeaway'}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setExpandedOrder(null)} className="h-8 w-8 rounded-full hover:bg-[var(--theme-bg)]">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                 {order.OrderItems?.map((item) => (
                  <div key={item.id} className="bg-[var(--theme-bg)]/50 p-4 rounded-xl border border-[var(--border)]/5">
                    <div className="flex gap-4 items-start">
                      <div className="h-10 w-10 rounded-lg bg-[var(--theme-header-bg)] flex items-center justify-center font-bold text-[var(--theme-primary)] text-sm shadow-sm border border-[var(--border)]/10">
                        {item.quantity}×
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-semibold text-[var(--theme-text)] leading-tight">{item.MenuItem?.name}</p>
                        {item.notes && (
                          <div className="flex items-start gap-2 mt-3 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-red-600 font-medium leading-tight">"{item.notes}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-6 border-t border-[var(--border)]/10 grid grid-cols-1 gap-3">
                 {order.status === 'Pending' && (
                    <Button onClick={() => { handleStatusChange(order.id, 'In Progress'); setExpandedOrder(null); }} className="w-full h-12 bg-[var(--theme-primary)] text-white hover:opacity-90 rounded-xl font-bold uppercase tracking-widest text-xs">
                      Start Preparing
                    </Button>
                  )}
                  {order.status === 'In Progress' && (
                    <Button onClick={() => { handleStatusChange(order.id, 'Ready'); setExpandedOrder(null); }} className="w-full h-12 bg-yellow-500 text-black hover:bg-yellow-600 rounded-xl font-bold uppercase tracking-widest text-xs">
                      Mark as Ready
                    </Button>
                  )}
                  {order.status === 'Ready' && (
                    <Button onClick={() => { handleStatusChange(order.id, 'Completed'); setExpandedOrder(null); }} className="w-full h-12 bg-green-500 text-white hover:bg-green-600 rounded-xl font-bold uppercase tracking-widest text-xs">
                      Served / Done
                    </Button>
                  )}
              </div>
            </div>
          );
        })()}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--theme-bg);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--theme-primary);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default KitchenDisplay;
