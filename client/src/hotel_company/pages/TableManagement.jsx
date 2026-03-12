import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Table as TableIcon, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ChevronRight,
  History,
  Info,
  Users
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

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  
  // Table CRUD State
  const [tableFormData, setTableFormData] = useState({ number: '', capacity: 2, status: 'Available' });
  const [editingTableId, setEditingTableId] = useState(null);

  // Reservation State
  const [resSearchTerm, setResSearchTerm] = useState('');
  const [resFilter, setResFilter] = useState('Active'); // Active, History

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesRes, reservationsRes] = await Promise.all([
        api.fetchDiningTables(),
        api.fetchTableReservations()
      ]);
      setTables(tablesRes.data);
      setReservations(reservationsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
      loadData();
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

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateTableReservationStatus(id, status);
      toast.success(`Reservation ${status}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = res.guestName.toLowerCase().includes(resSearchTerm.toLowerCase()) || 
                          res.guestPhone.includes(resSearchTerm);
    const isActive = ['Pending', 'Confirmed', 'Checked In'].includes(res.status);
    const isHistory = ['Completed', 'Cancelled'].includes(res.status);
    
    if (resFilter === 'Active') return matchesSearch && isActive;
    return matchesSearch && isHistory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Table <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Manage your restaurant flooring and reservations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="bg-transparent border-b border-[var(--border)]/10 w-full justify-start rounded-none h-auto p-0 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabsTrigger value="tables" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] shrink-0">Restaurant Layout</TabsTrigger>
          <TabsTrigger value="reservations" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] shrink-0">Active Reservations</TabsTrigger>
          <TabsTrigger value="history" className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--theme-primary)] data-[state=active]:bg-transparent font-semibold tracking-widest uppercase text-[10px] shrink-0">Reservation History</TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-normal italic uppercase tracking-tighter">Tables ({tables.length})</h2>
            <Button onClick={() => { setEditingTableId(null); setTableFormData({number:'', capacity:2, status:'Available'}); setIsTableModalOpen(true); }} className="rounded-xl bg-black text-white gap-2 h-10 px-4 text-xs font-bold uppercase tracking-widest">
              <Plus className="h-4 w-4" /> Add Table
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
             {tables.map(table => (
               <Card key={table.id} className={`rounded-2xl border-none shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${table.status === 'Available' ? 'bg-white' : 'bg-gray-50'}`}>
                 <CardContent className="p-0 flex flex-col relative overflow-hidden h-full">
                   <div className={`absolute top-0 w-full h-1 ${table.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
                   <div className="p-6 flex flex-col items-start gap-4 flex-1">
                     <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${table.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                       <TableIcon className="h-6 w-6" />
                     </div>
                     <div className="flex flex-col items-start overflow-hidden">
                       <h3 className="font-black text-xl text-gray-800 tracking-tighter truncate w-full uppercase leading-none">T-{table.number}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5"><Users className="h-3 w-3" /> {table.capacity} Seats</p>
                       <Badge variant="outline" className={`mt-3 rounded-lg text-[9px] uppercase font-black tracking-widest px-2.5 py-1 border-none ${table.status === 'Available' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{table.status}</Badge>
                     </div>
                   </div>
                   <div className="flex w-full border-t border-gray-100 bg-gray-50/50">
                     <button onClick={() => { setEditingTableId(table.id); setTableFormData(table); setIsTableModalOpen(true); }} className="flex-1 py-3 text-gray-500 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border-r border-gray-100"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                     <button onClick={() => handleDeleteTable(table.id)} className="flex-1 py-3 text-red-400 hover:text-red-600 hover:bg-white transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reservations">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by guest name or phone..." 
                className="pl-12 h-12 rounded-xl"
                value={resSearchTerm}
                onChange={e => setResSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setResFilter('Active')} variant={resFilter === 'Active' ? 'default' : 'outline'} className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 h-12">Active Only</Button>
          </div>

          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5 pl-8">Guest Details</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Time & Party</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Table</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5 text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.filter(r => ['Pending', 'Confirmed', 'Checked In'].includes(r.status)).length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={5} className="py-20 text-center text-gray-400 italic">
                        <Calendar className="h-10 w-10 mx-auto mb-4 opacity-20" />
                        No active reservations found
                     </TableCell>
                  </TableRow>
                ) : reservations.filter(r => ['Pending', 'Confirmed', 'Checked In'].includes(r.status)).map(res => (
                  <TableRow key={res.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="pl-8 py-5">
                       <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm text-gray-900">{res.guestName}</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium"><Phone className="h-3 w-3" /> {res.guestPhone}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(res.reservationTime).toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5"><Users className="h-3 w-3" /> {res.numberOfGuests} Guests</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       {res.DiningTable ? (
                         <Badge className="bg-black text-white font-black text-[10px] px-2 py-0.5 rounded-lg border-none uppercase tracking-tighter">Table {res.DiningTable.number}</Badge>
                       ) : (
                         <span className="text-[10px] text-gray-400 italic font-bold uppercase tracking-widest">Unassigned</span>
                       )}
                    </TableCell>
                    <TableCell>
                       <Badge className={`text-[9px] font-black uppercase tracking-widest border-none px-2.5 py-1 ${
                         res.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                         res.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' :
                         'bg-green-50 text-green-600'
                       }`}>{res.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2">
                          {res.status === 'Pending' && <Button size="sm" onClick={() => handleStatusChange(res.id, 'Confirmed')} className="bg-blue-600 hover:bg-blue-700 h-8 rounded-xl text-[10px] font-bold uppercase px-3 shadow-md">Confirm</Button>}
                          {res.status === 'Confirmed' && <Button size="sm" onClick={() => handleStatusChange(res.id, 'Checked In')} className="bg-black text-white h-8 rounded-xl text-[10px] font-bold uppercase px-3 shadow-md">Check In</Button>}
                          {res.status === 'Checked In' && <Button size="sm" onClick={() => handleStatusChange(res.id, 'Completed')} className="bg-green-600 hover:bg-green-700 h-8 rounded-xl text-[10px] font-bold uppercase px-3 shadow-md">Finish</Button>}
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(res.id, 'Cancelled')} className="h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 p-0"><XCircle className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="history">
           <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5 pl-8">Guest</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Table</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Final Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5 text-right pr-8">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.filter(r => ['Completed', 'Cancelled'].includes(r.status)).map(res => (
                  <TableRow key={res.id} className="border-b border-gray-50 opacity-60">
                    <TableCell className="pl-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-bold text-sm">{res.guestName}</span>
                          <span className="text-[10px] text-gray-400">{res.guestPhone}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{new Date(res.reservationTime).toDateString()}</TableCell>
                    <TableCell className="text-[10px] font-bold uppercase tracking-widest">{res.DiningTable?.number ? `T-${res.DiningTable.number}` : 'N/A'}</TableCell>
                    <TableCell>
                       <Badge className={`text-[9px] font-black uppercase tracking-widest border-none ${res.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-400'}`}>{res.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8 text-[10px] italic text-gray-400 max-w-[200px] truncate">{res.notes || 'No notes'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Table CRUD Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border-none animate-in zoom-in-95 duration-200">
            <CardHeader className="p-8 bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">{editingTableId ? 'Edit Table' : 'Add New Table'}</CardTitle>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Specify details for the dining unit</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Table Number</label>
                    <Input value={tableFormData.number} onChange={e => setTableFormData({...tableFormData, number: e.target.value})} placeholder="e.g. 101" className="rounded-2xl border-2 border-gray-100 h-14 font-bold text-lg focus:border-black transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Capacity</label>
                        <Input type="number" value={tableFormData.capacity} onChange={e => setTableFormData({...tableFormData, capacity: e.target.value})} className="rounded-2xl border-2 border-gray-100 h-14 font-bold focus:border-black" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Status</label>
                        <select 
                          value={tableFormData.status} 
                          onChange={e => setTableFormData({...tableFormData, status: e.target.value})}
                          className="w-full h-14 rounded-2xl border-2 border-gray-100 px-4 font-bold text-sm appearance-none outline-none focus:border-black transition-all bg-white"
                        >
                           <option value="Available">Available</option>
                           <option value="Occupied">Occupied</option>
                           <option value="Reserved">Reserved</option>
                        </select>
                     </div>
                  </div>
               </div>
               <div className="flex gap-3 pt-4">
                  <Button onClick={() => setIsTableModalOpen(false)} variant="outline" className="flex-1 rounded-2xl h-14 font-black uppercase text-xs tracking-widest hover:bg-gray-50 border-2">Cancel</Button>
                  <Button onClick={handleTableSubmit} className="flex-1 rounded-2xl h-14 bg-black text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">{editingTableId ? 'Save Changes' : 'Create Table'}</Button>
               </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
