import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import * as api from '@/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Phone,
  Mail,
  MapPin,
  Globe,
  Settings,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { toast } from 'sonner';

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-slate-200/50 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    active: true,
    apiKey: '',
    allowedUrls: '' // Comma separated for UI
  });

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const { data } = await api.fetchHotels();
      setHotels(data);
    } catch (error) {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const paginatedHotels = filteredHotels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      active: true
    });
    setOpen(true);
  };

  const handleOpenEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      address: hotel.address,
      phoneNumber: hotel.phoneNumber,
      email: hotel.email,
      active: hotel.active,
      apiKey: hotel.apiKey || '',
      allowedUrls: hotel.allowedUrls ? JSON.parse(hotel.allowedUrls).join(', ') : ''
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        allowedUrls: JSON.stringify(formData.allowedUrls.split(',').map(url => url.trim()).filter(url => url !== ''))
      };

      if (editingHotel) {
        await api.updateHotel(editingHotel.id, dataToSubmit);
        toast.success('Property updated successfully');
      } else {
        await api.createHotel(dataToSubmit);
        toast.success('New property added successfully');
      }
      setOpen(false);
      loadHotels();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This will affect related administrators and themes.')) {
      try {
        await api.deleteHotel(id);
        toast.success('Property deleted successfully');
        loadHotels();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            Property Management
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Manage and monitor all hotel properties within the system.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search properties..." 
              className="w-full pl-10 h-10 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-[var(--theme-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Property List</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Overview of all active and inactive hotel properties.</CardDescription>
          </div>
          <div className="flex items-center gap-6">
            {!loading && hotels.length > 0 && (
              <div className="flex items-center gap-4 bg-slate-50/50 px-4 py-2 rounded-xl ring-1 ring-slate-200/50">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <div className="flex gap-1">
                  <button 
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-all shadow-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-all shadow-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <button 
              onClick={loadHotels}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[var(--theme-border)]">
                <TableHead className="text-[10px] font-black uppercase tracking-widest opacity-40 px-8">Property Matrix</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest opacity-40">Location Node</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Connectivity</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest opacity-40 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHotels.map((hotel) => (
                <TableRow key={hotel.id} className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-sm ring-4 ring-[var(--theme-bg)]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 tracking-tight">{hotel.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {hotel.address || 'Location Unset'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {hotel.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {hotel.phoneNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hotel.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {hotel.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {hotel.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(hotel)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(hotel.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedHotels.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Building2 className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No properties found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl border-none p-0 overflow-hidden shadow-2xl rounded-3xl bg-[var(--theme-bg)] ring-1 ring-white/10">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 pb-4 bg-black/5 dark:bg-white/5 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                    {editingHotel ? 'Refine Property' : 'Deploy Property'}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium opacity-50 italic">
                    Configure the operational parameters for this hotel node.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-8 py-6 space-y-8">
              {/* Section: Core Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Globe className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Core Identity</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Property Name</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                      placeholder="e.g., Grand Hunda Hotel"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">System Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, active: !formData.active})}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${formData.active ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}
                    >
                      {formData.active ? <Activity className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      {formData.active ? 'Operational' : 'Restricted'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Geographic Node</span>
                </div>
                <div className="space-y-1.5">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 opacity-20" />
                    <input
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                      placeholder="Full physical address..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: API & Security */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Shield className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">API & Security</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Property API Key</label>
                    <div className="flex gap-2">
                       <input
                        readOnly
                        value={formData.apiKey}
                        className="flex-1 bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-xs font-mono font-bold opacity-70"
                        placeholder="Generated on deployment..."
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newKey = `hk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
                          setFormData({...formData, apiKey: newKey});
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition-all"
                        title="Regenerate Key"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Allowed Domains (CORS)</label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-3 h-4 w-4 opacity-20" />
                      <input
                        value={formData.allowedUrls}
                        onChange={(e) => setFormData({...formData, allowedUrls: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder="e.g. http://localhost:5173, https://hotel.com"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium italic">Comma-separated list of allowed origins. Use '*' to allow all (not recommended for production).</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 bg-black/5 dark:bg-white/5 border-t border-[var(--theme-border)]">
              <button 
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[var(--theme-primary)] hover:opacity-90 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[var(--theme-primary)]/20 active:scale-95 border border-white/10"
              >
                {editingHotel ? 'Commit Changes' : 'Initialize Node'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Hotels;
