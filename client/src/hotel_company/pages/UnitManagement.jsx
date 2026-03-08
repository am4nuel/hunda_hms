import React, { useState, useEffect } from 'react';
import { 
  Ruler, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Scale
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as api from '@/api';
import { toast } from 'sonner';

const UnitManagement = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ name: '', abbreviation: '' });

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    if (hotelId) loadUnits();
  }, [hotelId]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const res = await api.fetchUnits(hotelId);
      setUnits(res.data);
    } catch (error) {
      toast.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await api.updateUnit(editingUnit.id, formData);
        toast.success('Unit updated');
      } else {
        await api.createUnit({ ...formData, hotelId });
        toast.success('Unit created');
      }
      setIsModalOpen(false);
      loadUnits();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this unit?')) return;
    try {
      await api.deleteUnit(id);
      toast.success('Unit deleted');
      loadUnits();
    } catch (error) {
      toast.error('Failed to delete unit');
    }
  };

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-header-bg)] p-6 rounded-2xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Unit <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage measurement units & conversions</p>
        </div>
        <Button 
          onClick={() => {
            setEditingUnit(null);
            setFormData({ name: '', abbreviation: '' });
            setIsModalOpen(true);
          }}
          className="rounded-2xl h-12 px-6 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest text-xs"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Unit
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search units..."
          className="pl-11 h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl text-[var(--theme-text)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-header-bg)]">
        <Table>
          <TableHeader className="bg-[var(--theme-bg)]/50 border-b border-[var(--border)]/10">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Unit Name</TableHead>
              <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Abbreviation</TableHead>
              <TableHead className="text-right font-semibold uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}><TableCell colSpan={3} className="h-16 animate-pulse bg-gray-50/50" /></TableRow>
              ))
            ) : filteredUnits.map(unit => (
              <TableRow key={unit.id} className="group hover:bg-[var(--theme-bg)]/50 transition-colors border-b border-[var(--border)]/10">
                <TableCell className="py-4 font-semibold">{unit.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-[var(--theme-primary)]">
                    {unit.abbreviation || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingUnit(unit);
                      setFormData({ name: unit.name, abbreviation: unit.abbreviation || '' });
                      setIsModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(unit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredUnits.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-gray-400 font-normal uppercase tracking-widest text-xs italic">
                  No units found. Add your first unit to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold italic uppercase tracking-tighter">
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Unit Name (e.g. Kilogram)</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="rounded-xl border-[var(--border)]/10"
                placeholder="Kilogram"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Abbreviation (e.g. kg)</label>
              <Input 
                value={formData.abbreviation} 
                onChange={e => setFormData({...formData, abbreviation: e.target.value})} 
                className="rounded-xl border-[var(--border)]/10"
                placeholder="kg"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-bold uppercase tracking-widest rounded-2xl mt-4">
              {editingUnit ? 'Update Unit' : 'Save Unit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitManagement;
