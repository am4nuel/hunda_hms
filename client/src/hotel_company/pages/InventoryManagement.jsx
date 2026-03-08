import React, { useState, useEffect } from 'react';
import { 
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  History,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');
  const [transactions, setTransactions] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);

  // Form Data
  const [itemForm, setItemForm] = useState({
    name: '', description: '', category: 'Supplies', unitId: '',
    currentStock: 0, costPrice: 0, lowStockThreshold: 10, supplierId: null
  });

  const [restockForm, setRestockForm] = useState({
    quantity: '', costPrice: '', notes: ''
  });

  const hotelId = JSON.parse(localStorage.getItem('profile'))?.user?.hotelId;

  useEffect(() => {
    if (hotelId) loadData();
  }, [hotelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, transRes, unitsRes, suppliersRes] = await Promise.all([
        api.fetchInventoryItems(hotelId),
        api.fetchInventoryTransactions(hotelId),
        api.fetchUnits(hotelId),
        api.fetchSuppliers(hotelId)
      ]);
      setItems(itemsRes.data);
      setTransactions(transRes.data);
      setUnits(unitsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.restockInventoryItem(restockItem.id, restockForm);
      toast.success('Inventory restocked');
      setIsRestockModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Restock failed');
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateInventoryItem(editingItem.id, itemForm);
        toast.success('Item updated');
      } else {
        await api.createInventoryItem({ ...itemForm, hotelId });
        toast.success('Item added');
      }
      setIsItemModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };


  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.deleteInventoryItem(id);
      toast.success('Item deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };


  const filteredItems = items.filter(i => 
    (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === 'All' || i.category === categoryFilter)
  );


  const totalPages = Math.ceil((activeTab === 'items' ? filteredItems.length : transactions.length) / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, activeTab]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--theme-header-bg)] p-6 rounded-2xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Inventory <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Track stock, suppliers & supply chain
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setEditingItem(null);
              setItemForm({ name: '', description: '', category: 'Supplies', unitId: '', currentStock: 0, costPrice: 0, lowStockThreshold: 10, supplierId: null });
              setIsItemModalOpen(true);
            }}
            className="rounded-2xl h-12 px-6 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest text-xs"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search items or categories..."
            className="pl-11 h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl text-[var(--theme-text)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {activeTab === 'items' && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Beverage">Beverage</SelectItem>
              <SelectItem value="Supplies">Hotel Supplies</SelectItem>
              <SelectItem value="Toiletries">Toiletries</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="items" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-[var(--theme-header-bg)] p-1 rounded-xl shadow-sm border-none flex w-fit">
            <TabsTrigger value="items" className="rounded-xl px-8 py-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-normal uppercase tracking-widest text-[10px]">
              Stock Items
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl px-8 py-2 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-normal uppercase tracking-widest text-[10px]">
              History
            </TabsTrigger>
          </TabsList>

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

        <TabsContent value="items" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-header-bg)]">
              <div className="overflow-x-auto -mx-1 px-1">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-[var(--theme-bg)]/50 border-b border-[var(--border)]/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Item</TableHead>
                    <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Category</TableHead>
                    <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Stock</TableHead>
                    <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Unit Price</TableHead>
                    <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Supplier</TableHead>
                    <TableHead className="text-right font-semibold uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map(item => (
                    <TableRow key={item.id} className="group hover:bg-[var(--theme-bg)]/50 transition-colors border-b border-[var(--border)]/10">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.currentStock <= item.lowStockThreshold ? 'bg-red-50 text-red-500' : 'bg-[var(--theme-bg)] text-[var(--theme-primary)]'}`}>
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-[10px] opacity-40 uppercase tracking-wider">{item.unit || item.Unit?.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg text-[9px] font-semibold uppercase border-[var(--theme-primary)] text-[var(--theme-primary)]">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${item.currentStock <= item.lowStockThreshold ? 'text-red-500' : ''}`}>
                            {item.currentStock}
                          </span>
                          {item.currentStock <= item.lowStockThreshold && (
                            <span className="text-[9px] font-semibold uppercase text-red-500 animate-pulse">Low Stock</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">ETB {parseFloat(item.costPrice).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs opacity-60 uppercase">{item.supplier?.name || '-'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] uppercase font-bold text-[var(--theme-primary)] border-[var(--theme-primary)]/20 hover:bg-[var(--theme-primary)]/10" onClick={() => {
                            setRestockItem(item);
                            setRestockForm({ quantity: '', costPrice: item.costPrice, notes: '' });
                            setIsRestockModalOpen(true);
                          }}>
                            Restock
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingItem(item);
                            setItemForm({ ...item });
                            setIsItemModalOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-gray-400 font-normal uppercase tracking-widest text-xs">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
          )}
        </TabsContent>


        <TabsContent value="transactions" className="mt-0">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-header-bg)]">
            <div className="overflow-x-auto -mx-1 px-1">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-[var(--theme-bg)]/50 border-b border-[var(--border)]/10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Timestamp</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Item</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Action</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Change</TableHead>
                  <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(tr => (
                  <TableRow key={tr.id} className="group hover:bg-[var(--theme-bg)]/50 transition-colors border-b border-[var(--border)]/10 text-xs">
                    <TableCell className="opacity-60">{new Date(tr.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold uppercase">{tr.inventoryItem?.name}</TableCell>
                    <TableCell>
                      <Badge variant="ghost" className={`text-[9px] uppercase font-bold p-0 ${tr.type === 'Restock' ? 'text-green-500' : tr.type === 'Order_Usage' ? 'text-blue-500' : 'text-orange-500'}`}>
                        {tr.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-bold ${parseFloat(tr.changeAmount) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(tr.changeAmount) > 0 ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                      {tr.changeAmount} {tr.inventoryItem?.Unit?.abbreviation || tr.inventoryItem?.Unit?.name || tr.inventoryItem?.unit}
                    </TableCell>
                    <TableCell className="opacity-60 max-w-[200px] truncate">{tr.notes}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center opacity-40 font-semibold uppercase tracking-widest italic">
                      No transactions recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold italic uppercase tracking-tighter">
              {editingItem ? 'Edit Inventory Item' : 'Add New Stock Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Item Name</label>
                <Input required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Category</label>
                <Select value={itemForm.category} onValueChange={v => setItemForm({...itemForm, category: v})}>
                  <SelectTrigger className="rounded-xl border-[var(--border)]/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Supplies">Hotel Supplies</SelectItem>
                    <SelectItem value="Toiletries">Toiletries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Measurement Unit</label>
                <Select value={itemForm.unitId?.toString()} onValueChange={v => setItemForm({...itemForm, unitId: v})}>
                  <SelectTrigger className="rounded-xl border-[var(--border)]/10">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Object.entries(
                      units.reduce((acc, unit) => {
                        (acc[unit.category] = acc[unit.category] || []).push(unit);
                        return acc;
                      }, {})
                    ).map(([category, catUnits]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--theme-primary)] opacity-50 bg-[var(--theme-bg)]/50">
                          {category}
                        </div>
                        {catUnits.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            {u.name} ({u.abbreviation})
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Cost Price (ETB)</label>
                <Input type="number" step="0.01" required value={itemForm.costPrice} onChange={e => setItemForm({...itemForm, costPrice: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Current Stock</label>
                <Input type="number" required value={itemForm.currentStock} onChange={e => setItemForm({...itemForm, currentStock: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Low Stock Threshold</label>
                <Input type="number" required value={itemForm.lowStockThreshold} onChange={e => setItemForm({...itemForm, lowStockThreshold: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Supplier</label>
              <Select value={itemForm.supplierId?.toString()} onValueChange={v => setItemForm({...itemForm, supplierId: parseInt(v)})}>
                <SelectTrigger className="rounded-xl border-[var(--border)]/10">
                  <SelectValue placeholder="Select Supplier (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-bold uppercase tracking-widest rounded-2xl mt-4">
              {editingItem ? 'Update Stock Item' : 'Add to Inventory'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>


      {/* Restock Modal */}
      <Dialog open={isRestockModalOpen} onOpenChange={setIsRestockModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold italic uppercase tracking-tighter">
              Restock: {restockItem?.name}
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest opacity-60">
              Update inventory level and purchase cost info.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestockSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Quantity Added ({restockItem?.unit || restockItem?.Unit?.name})</label>
                <Input type="number" step="0.01" required value={restockForm.quantity} onChange={e => setRestockForm({...restockForm, quantity: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">New Unit Cost (ETB)</label>
                <Input type="number" step="0.01" value={restockForm.costPrice} onChange={e => setRestockForm({...restockForm, costPrice: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">Notes / Reference</label>
              <Input placeholder="Supplier invoice #, etc." value={restockForm.notes} onChange={e => setRestockForm({...restockForm, notes: e.target.value})} className="rounded-xl border-[var(--border)]/10" />
            </div>
            <Button type="submit" className="w-full h-12 bg-green-600 text-white font-bold uppercase tracking-widest rounded-2xl mt-4 hover:bg-green-700">
              Complete Restock
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;
