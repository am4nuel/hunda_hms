import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  RefreshCw,
  Send,
  Calendar,
  User,
  ExternalLink
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
import * as api from '@/api';
import { toast } from 'sonner';

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(dateString));
};

const typeConfig = {
  'PaymentConfirmation': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'CheckInReminder': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  'CheckOutReminder': { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
  'CheckInWelcome': { icon: User, color: 'text-purple-500', bg: 'bg-purple-50' },
  'CheckOutThankYou': { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' }
};

// Heart isn't imported from lucide-react in the top but used below, fix it
import { Heart } from 'lucide-react';

const GuestNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.fetchNotifications(hotelId);
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to load guest notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRunReminders = async () => {
    try {
      setIsProcessing(true);
      const res = await api.triggerReminders();
      toast.success(`Reminders processed! ${res.data.stats.checkIns} check-ins, ${res.data.stats.checkOuts} check-outs notified.`);
      loadNotifications();
    } catch (error) {
      toast.error('Failed to trigger reminders');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = notifications.filter(n => {
    const matchesSearch = 
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.Guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.Guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || n.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Guest <span className="text-[var(--theme-primary)]">Notifications</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage automated alerts & communications for reservation confirmations and reminders.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunReminders} 
            disabled={isProcessing}
            className="bg-black text-white hover:bg-black/90 rounded-xl gap-2 h-10 px-4"
          >
            {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Run Scheduled Reminders
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase opacity-40">Total Sent</p>
              <h3 className="text-xl font-bold">{notifications.length}</h3>
            </div>
          </CardContent>
        </Card>
        {/* Add more KPI cards if needed */}
      </div>

      <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]/10 bg-[var(--theme-bg)]/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
              <Input 
                placeholder="Search recipient or message..." 
                className="pl-10 rounded-xl bg-white/50" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="h-10 rounded-xl border border-[var(--border)]/10 bg-white px-4 text-xs font-semibold focus:outline-none"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="PaymentConfirmation">Confirmation</option>
              <option value="CheckInReminder">Arrival Reminder</option>
              <option value="CheckOutReminder">Departure Reminder</option>
              <option value="CheckInWelcome">Welcome Message</option>
              <option value="CheckOutThankYou">Thank You Note</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={loadNotifications} className="rounded-xl opacity-40 hover:opacity-100">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-[var(--border)]/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest pl-6">Guest</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Channel</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Message</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Sent Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-4 px-6"><div className="h-8 bg-gray-100 animate-pulse rounded-lg w-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center opacity-40 text-sm italic">No notifications found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((n) => {
                const Config = typeConfig[n.type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
                return (
                  <TableRow key={n.id} className="border-b border-[var(--border)]/5 hover:bg-[var(--theme-bg)]/10 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">
                          {n.Guest?.firstName[0]}{n.Guest?.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{n.Guest?.firstName} {n.Guest?.lastName}</p>
                          <p className="text-[10px] opacity-40">{n.recipient}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Config.icon className={`h-3.5 w-3.5 ${Config.color}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{n.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold border-gray-100">
                        {n.channel === 'Email' ? <Mail className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                        {n.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="text-xs line-clamp-2 opacity-70 italic">"{n.message}"</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(n.createdAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px]">
                        SENT
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default GuestNotifications;
