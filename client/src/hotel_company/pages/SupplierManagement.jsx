import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import * as api from '@/api';
import { toast } from 'sonner';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', email: '', phoneNumber: '', address: ''
  });

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    if (hotelId) loadSuppliers();
  }, [hotelId]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.fetchSuppliers(hotelId);
      setSuppliers(res.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier updated');
      } else {
        await api.createSupplier({ ...formData, hotelId });
        toast.success('Supplier added');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await api.deleteSupplier(id);
      toast.success('Supplier deleted');
      loadSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-header-bg)] p-6 rounded-2xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Supplier <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage business partners & vendors</p>
        </div>
        <Button 
          onClick={() => {
            setEditingSupplier(null);
            setFormData({ name: '', contactPerson: '', email: '', phoneNumber: '', address: '' });
            setIsModalOpen(true);
          }}
          className="rounded-2xl h-12 px-6 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest text-xs"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Supplier
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search suppliers by name, contact or email..."
            className="pl-11 h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl text-[var(--theme-text)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--theme-header-bg)] px-4 py-2 rounded-xl shadow-sm border border-[var(--border)]/5">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-[var(--theme-bg)]/50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-[var(--theme-bg)]/50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-[var(--theme-header-bg)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedSuppliers.map(sup => (
            <Card key={sup.id} className="bg-[var(--theme-header-bg)] border-none rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-[var(--theme-bg)] rounded-xl flex items-center justify-center text-[var(--theme-primary)]">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditingSupplier(sup);
                      setFormData({ ...sup });
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(sup.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold uppercase tracking-tight">{sup.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-3 w-3 text-[var(--theme-primary)] opacity-60" />
                  <p className="text-[10px] font-bold text-[var(--theme-primary)] uppercase tracking-widest">{sup.contactPerson || 'No contact person'}</p>
                </div>
                
                <div className="mt-6 space-y-3 pt-4 border-t border-[var(--border)]/10">
                  <div className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 transition-opacity">
                    <div className="h-7 w-7 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center">
                      <Mail className="h-3 w-3" />
                    </div>
                    <span>{sup.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 transition-opacity">
                    <div className="h-7 w-7 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center">
                      <Phone className="h-3 w-3" />
                    </div>
                    <span>{sup.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs opacity-70 hover:opacity-100 transition-opacity">
                    <div className="h-7 w-7 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center shrink-0">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <span className="line-clamp-2">{sup.address || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {paginatedSuppliers.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--theme-header-bg)] rounded-2xl border border-dashed border-[var(--border)]/20">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-semibold uppercase tracking-widest opacity-40">No suppliers registered</p>
              <Button 
                variant="link" 
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-[var(--theme-primary)] font-bold uppercase text-[10px]"
              >
                Add your first supplier
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-2xl max-w-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold italic uppercase tracking-tighter">
              {editingSupplier ? 'Edit Supplier' : 'Register New Supplier'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Company Name</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="rounded-xl border-[var(--border)]/10 h-11"
                placeholder="ABC Logistics"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Contact Person (Optional)</label>
              <Input 
                value={formData.contactPerson} 
                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                className="rounded-xl border-[var(--border)]/10 h-11"
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Email (Optional)</label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="rounded-xl border-[var(--border)]/10 h-11"
                  placeholder="contact@supplier.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Phone Number (Optional)</label>
                <Input 
                  value={formData.phoneNumber} 
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  className="rounded-xl border-[var(--border)]/10 h-11"
                  placeholder="+251..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Address (Optional)</label>
              <Input 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                className="rounded-xl border-[var(--border)]/10 h-11"
                placeholder="123 Street, City"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-bold uppercase tracking-widest rounded-2xl mt-4 shadow-lg shadow-[var(--theme-primary)]/20 hover:scale-[1.02] transition-transform">
              {editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierManagement;
