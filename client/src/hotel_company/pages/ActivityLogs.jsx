import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Clock, 
  Shield, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  Smartphone,
  Globe
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from '@/api';
import { toast } from 'sonner';

const formatDate = (date, type) => {
  const d = new Date(date);
  if (type === 'year') return d.getFullYear();
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    if (hotelId) loadLogs();
  }, [hotelId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.fetchActivityLogs(hotelId);
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.includes('CREATE')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (action.includes('UPDATE')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const filteredLogs = logs.filter(log => 
    (log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     `${log.user?.firstName} ${log.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (moduleFilter === 'All' || log.module === moduleFilter)
  );

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const modules = ['All', ...new Set(logs.map(log => log.module))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-header-bg)] p-6 rounded-2xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Activity <span className="text-[var(--theme-primary)]">Logs</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Full accountability trail for staff & admins</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadLogs}
          className="rounded-2xl h-12 px-6 border-[var(--border)]/10 text-[var(--theme-text)] font-semibold uppercase tracking-widest text-xs"
        >
          <Activity className="h-4 w-4 mr-2" /> Refresh Logs
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by action, user, or details..."
            className="pl-11 h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl text-[var(--theme-text)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {modules.map(mod => (
            <Button
              key={mod}
              variant={moduleFilter === mod ? 'default' : 'outline'}
              onClick={() => setModuleFilter(mod)}
              className={`rounded-xl h-12 px-6 font-semibold uppercase tracking-widest text-[10px] whitespace-nowrap ${
                moduleFilter === mod ? 'bg-[var(--theme-primary)] text-white' : 'border-[var(--border)]/10 text-[var(--theme-text)] opacity-60'
              }`}
            >
              {mod}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--theme-header-bg)] rounded-2xl overflow-hidden border-none shadow-sm relative min-h-[400px]">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-[var(--theme-bg)]/50 border-b border-[var(--border)]/10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px] py-4 pl-6">Timestamp</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">User</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Action</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Module</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Details</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-[var(--theme-bg)]/50 transition-colors border-b border-[var(--border)]/10">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{formatDate(log.createdAt)}</span>
                        <span className="text-[9px] opacity-40 uppercase tracking-tighter">{formatDate(log.createdAt, 'year')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[var(--theme-primary)]/10 flex items-center justify-center text-[var(--theme-primary)]">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold underline decoration-dotted decoration-[var(--theme-primary)]/30">
                            {log.userName || (log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System')}
                          </span>
                          <span className="text-[9px] opacity-40 uppercase font-bold">
                            {log.userRole || log.user?.role || 'Service'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[9px] font-bold uppercase tracking-wider py-1 border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs opacity-60 uppercase font-bold tracking-tight">{log.module}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs italic opacity-80 leading-relaxed truncate group-hover:text-clip group-hover:overflow-visible overflow-hidden transition-all">
                        {log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Globe className="h-3 w-3" />
                          <span className="text-[9px] truncate">{log.ipAddress || 'Internal'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40">
                          <Smartphone className="h-3 w-3" />
                          <span className="text-[9px] truncate max-w-[80px]">{log.userAgent?.split(' ')[0] || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center opacity-40">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                      <p className="font-semibold uppercase tracking-widest text-xs">No activity logs recorded yet</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination controls */}
            <div className="flex items-center justify-between p-6 border-t border-[var(--border)]/10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Viewing {Math.min(paginatedLogs.length, logsPerPage)} of {filteredLogs.length} entries
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
