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
  UserPlus, 
  RefreshCcw,
  ShieldCheck,
  Building2,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  Fingerprint,
  Users,
  Key,
  AtSign,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from 'sonner';

const HotelAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    hotelId: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adminsRes, hotelsRes] = await Promise.all([
        api.fetchHotelAdmins(),
        api.fetchHotels()
      ]);
      setAdmins(adminsRes.data);
      setHotels(hotelsRes.data);
    } catch (error) {
      toast.error('Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      hotelId: hotels[0]?.id || ''
    });
    setOpen(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      userName: admin.userName || '',
      email: admin.email,
      password: '', // Don't show password
      hotelId: admin.hotelId
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        // If password is empty, don't update it
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.updateHotelAdmin(editingAdmin.id, payload);
        toast.success('Administrator updated successfully');
      } else {
        await api.createHotelAdmin(formData);
        toast.success('New administrator added successfully');
      }
      setOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authorization failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this administrator?')) {
      try {
        await api.deleteHotelAdmin(id);
        toast.success('Administrator deleted successfully');
        loadData();
      } catch (error) {
        toast.error('Revocation failed');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            Property Administrators
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Manage administrative access for each hotel property.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[var(--theme-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all shadow-lg"
        >
          <UserPlus className="h-4 w-4" />
          Add Administrator
        </button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Administrator List</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Overview of all administrators and their assigned properties.</CardDescription>
          </div>
          <button 
            onClick={loadData}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-[var(--theme-border)]">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Administrator</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Property</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Level</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)] shadow-sm">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 tracking-tight">{admin.firstName} {admin.lastName}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          <Mail className="h-3 w-3" />
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded bg-foreground/5 flex items-center justify-center">
                        <AtSign className="h-3 w-3 opacity-40" />
                      </div>
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wide">
                        {admin.userName || 'NODE_UNNAMED'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-3 w-3 text-slate-400" />
                      </div>
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wide">
                        {admin.Hotel?.name || 'PROPERTY_UNKNOWN'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" />
                        Property Admin
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(admin)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <ShieldCheck className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No administrators found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl border-none p-0 overflow-hidden shadow-2xl rounded-3xl bg-[var(--theme-bg)] ring-1 ring-white/10">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 pb-4 bg-black/5 dark:bg-white/5 border-b border-[var(--theme-border)]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--theme-primary)] flex items-center justify-center text-white shadow-lg shadow-[var(--theme-primary)]/20">
                  <Fingerprint className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                    {editingAdmin ? 'Refine Clearance' : 'Provision Admin'}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium opacity-50 italic">
                    Establish administrative authority and node access.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-8 py-6 space-y-8">
              {/* Section: Personal Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <UserIcon className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Forename</label>
                    <input
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                      placeholder="e.g., Yohannes"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Surname</label>
                    <input
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                      placeholder="e.g., Bekele"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Administrative Handle (Username)</label>
                    <div className="relative group">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 opacity-20 group-focus-within:text-[var(--theme-primary)] group-focus-within:opacity-100 transition-all" />
                      <input
                        required
                        value={formData.userName}
                        onChange={(e) => setFormData({...formData, userName: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder="e.g., yohannes_admin"
                      />
                    </div>
                  </div>
              </div>

              {/* Section: Access Authorization */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Shield className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compute Node Access</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Assigned Property Node</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 opacity-20 group-focus-within:text-[var(--theme-primary)] transition-all" />
                    <select 
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.hotelId}
                      onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                    >
                      <option value="" disabled>Select Property Node</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: Security Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Key className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security Credentials</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Authorized Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 opacity-20 group-focus-within:text-[var(--theme-primary)] group-focus-within:opacity-100 transition-all" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder="admin@node.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Access Secret</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 opacity-20 group-focus-within:text-[var(--theme-primary)] group-focus-within:opacity-100 transition-all" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!editingAdmin}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-12 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder={editingAdmin ? "••••••••" : "System Access Key"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--theme-primary)] transition-colors p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {editingAdmin && <p className="text-[9px] font-medium opacity-30 mt-1 italic">Leave empty to retain existing secret.</p>}
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
                {editingAdmin ? 'Commit Changes' : 'Authorize Admin'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default HotelAdmins;
