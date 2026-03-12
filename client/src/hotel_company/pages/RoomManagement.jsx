import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy,
  Bed,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  X,
  DoorOpen,
  Clock,
  Hammer,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  GripVertical,
  ChevronLeft,
  ChevronRight
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as api from '@/api';
import { toast } from 'sonner';

const statusConfig = {
  'Available': { color: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2 },
  'Booked': { color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50', icon: Clock },
  'Occupied': { color: 'bg-purple-500', text: 'text-purple-500', bg: 'bg-purple-50', icon: DoorOpen },
  'Under maintenance': { color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50', icon: Hammer },
};

const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-[var(--theme-primary)]/5 rounded-xl ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--theme-primary)]/10 to-transparent" />
  </div>
);

const RoomManagement = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    capacity: '',
    amenities: [],
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    status: 'Available',
    images: []
  });
  
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicatingRoom, setDuplicatingRoom] = useState(null);
  const [duplicateNumbers, setDuplicateNumbers] = useState(['']);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [typesRes, roomsRes] = await Promise.all([
        api.fetchRoomTypes(),
        api.fetchRooms()
      ]);
      setRoomTypes(typesRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Failed to sync management data');
    } finally {
      setLoading(false);
    }
  };

  // --- Room Type Handlers ---
  const addAmenity = () => {
    setTypeFormData({ ...typeFormData, amenities: [...typeFormData.amenities, ''] });
  };

  const removeAmenity = (index) => {
    setTypeFormData({ ...typeFormData, amenities: typeFormData.amenities.filter((_, i) => i !== index) });
  };

  const updateAmenity = (index, value) => {
    const newAmenities = [...typeFormData.amenities];
    newAmenities[index] = value;
    setTypeFormData({ ...typeFormData, amenities: newAmenities });
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...typeFormData,
        amenities: typeFormData.amenities.filter(a => a.trim()),
        basePrice: parseFloat(typeFormData.basePrice),
        capacity: parseInt(typeFormData.capacity)
      };

      if (editingType) {
        await api.updateRoomType(editingType.id, payload);
        toast.success('Category updated');
      } else {
        await api.createRoomType(payload);
        toast.success('Category created');
      }
      setIsTypeModalOpen(false);
      loadAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // --- Room Handlers ---
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, roomFormData);
        toast.success('Room updated');
      } else {
        await api.createRoom(roomFormData);
        toast.success('Room registered');
      }
      setIsRoomModalOpen(false);
      loadAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const addDuplicateField = () => setDuplicateNumbers([...duplicateNumbers, '']);
  const removeDuplicateField = (index) => setDuplicateNumbers(duplicateNumbers.filter((_, i) => i !== index));
  const updateDuplicateField = (index, value) => {
    const next = [...duplicateNumbers];
    next[index] = value;
    setDuplicateNumbers(next);
  };

  const handleDuplicateSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomNumbers = duplicateNumbers.map(n => n.trim()).filter(Boolean);
      
      if (roomNumbers.length === 0) {
        toast.error('Please enter at least one new room number');
        return;
      }

      // Local check for duplicates in the list itself
      if (new Set(roomNumbers).size !== roomNumbers.length) {
        toast.error('Duplicate room numbers found in your list');
        return;
      }

      await api.duplicateRoom(duplicatingRoom.id, roomNumbers);
      toast.success(`Succesfully created ${roomNumbers.length} new room(s)`);
      setIsDuplicateModalOpen(false);
      setDuplicateNumbers(['']);
      loadAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Duplication failed');
    }
  };

  // --- Image Handlers ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    try {
      toast.loading('Uploading images...');
      const { data } = await api.uploadImages(formData);
      setRoomFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      toast.dismiss();
      toast.success(`${data.urls.length} image(s) uploaded`);
    } catch (error) {
      toast.dismiss();
      toast.error('Upload failed');
    }
  };

  const removeImage = (index) => {
    setRoomFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (dragIndex, hoverIndex) => {
    const newImages = [...roomFormData.images];
    const [dragged] = newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, dragged);
    setRoomFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateRoomStatus(id, newStatus);
      toast.success(`Status: ${newStatus}`);
      setRooms(rooms.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredTypes = roomTypes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRooms = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.RoomType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Sync pagination when search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Room <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Organize categories and monitor live inventory status.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64 text-[var(--theme-text)]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Quick search..." 
              className="pl-10 h-10 rounded-xl border-[var(--border)]/10 bg-[var(--theme-header-bg)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              if (activeTab === 'types') {
                setEditingType(null);
                setTypeFormData({ name: '', description: '', basePrice: '', capacity: '', amenities: [] });
                setIsTypeModalOpen(true);
              } else {
                setEditingRoom(null);
                setRoomFormData({ roomNumber: '', roomTypeId: '', status: 'Available', images: [] });
                setIsRoomModalOpen(true);
              }
            }}
            className="bg-[var(--theme-primary)] hover:opacity-90 flex items-center justify-center gap-2 rounded-xl h-10 px-6 shadow-lg shadow-[var(--theme-primary)]/20"
          >
            <Plus className="h-4 w-4" /> 
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {activeTab === 'types' ? 'Add Category' : 'Add Room'}
            </span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-[var(--theme-header-bg)] p-1 rounded-xl shadow-sm border-none flex w-full sm:w-fit overflow-x-auto noscrollbar">
            <TabsTrigger value="inventory" className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
              Live Inventory
            </TabsTrigger>
            <TabsTrigger value="types" className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-white transition-all font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
              Room Categories
            </TabsTrigger>
          </TabsList>

          {activeTab === 'inventory' && !loading && (
            <div className="flex items-center justify-between sm:justify-end gap-4 bg-[var(--theme-header-bg)] px-4 py-2 rounded-xl shadow-sm border border-[var(--border)]/5 w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50 border border-[var(--border)]/10"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-[var(--theme-bg)]/50 border border-[var(--border)]/10"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <TabsContent value="inventory" className="mt-0">
          {loading ? (
             <div className="space-y-4">
               {[...Array(6)].map((_, i) => (
                 <Skeleton key={i} className="h-16 w-full" />
               ))}
             </div>
          ) : (
            <Card className="border-none shadow-sm rounded-xl bg-[var(--theme-header-bg)] text-[var(--theme-text)] overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader className="bg-[var(--theme-bg)]/40 border-b border-[var(--border)]/10">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-[120px] font-bold uppercase tracking-widest text-[10px] py-4 px-6">Room No.</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Category</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Status</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px] py-4">Quick Action</TableHead>
                      <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] py-4 px-6">Manage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRooms.map((room) => {
                      const config = statusConfig[room.status] || { text: 'text-gray-500', bg: 'bg-gray-100', icon: AlertCircle };
                      return (
                        <TableRow key={room.id} className="group hover:bg-[var(--theme-bg)]/20 transition-colors border-b border-[var(--border)]/5 last:border-0">
                          <TableCell className="py-5 px-6">
                            <span className="text-lg font-black text-[var(--theme-text)] italic tracking-tight">#{room.roomNumber}</span>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-[var(--theme-bg)] flex items-center justify-center border border-[var(--border)]/5 shadow-sm">
                                <Bed className="h-4 w-4 text-[var(--theme-primary)]" />
                              </div>
                              <span className="text-sm font-bold text-[var(--theme-text)] opacity-90">{room.RoomType?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.text} border border-current/10 shadow-sm`}>
                              <config.icon className="h-3 w-3" />
                              {room.status}
                            </div>
                          </TableCell>
                          <TableCell className="py-5 text-sm">
                            <select 
                              className="text-[10px] font-black uppercase tracking-tight border border-[var(--border)]/10 bg-[var(--theme-bg)]/50 rounded-lg px-2 py-1.5 outline-none text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
                              value={room.status} 
                              onChange={(e) => handleStatusUpdate(room.id, e.target.value)}
                            >
                              {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </TableCell>
                          <TableCell className="text-right py-5 px-6">
                            <div className="flex justify-end gap-2 px-1">
                              <Button variant="ghost" size="icon" onClick={() => {
                                 setDuplicatingRoom(room);
                                 setDuplicateNumbers(['']);
                                 setIsDuplicateModalOpen(true);
                              }} className="h-9 w-9 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-100 transition-all">
                                <Copy className="h-4.5 w-4.5" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingRoom(room);
                                setRoomFormData({ 
                                  roomNumber: room.roomNumber, 
                                  roomTypeId: room.roomTypeId, 
                                  status: room.status,
                                  images: room.images || []
                                });
                                setIsRoomModalOpen(true);
                              }} className="h-9 w-9 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all">
                                <Edit2 className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredRooms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-16 text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                          No rooms found matching your search
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="types" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {filteredTypes.map((type) => (
              <Card key={type.id} className="group hover:shadow-lg transition-all border-none shadow-sm rounded-xl overflow-hidden bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-[var(--theme-primary)]/10 rounded-xl"><Bed className="h-6 w-6 text-[var(--theme-primary)]" /></div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingType(type);
                        setTypeFormData({ ...type, amenities: Array.isArray(type.amenities) ? [...type.amenities] : [] });
                        setIsTypeModalOpen(true);
                      }} className="h-8 w-8"><Edit2 className="h-4 w-4 text-gray-400" /></Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-normal text-[var(--theme-text)]">{type.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-y border-[var(--border)]">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[var(--theme-text)] opacity-40" /><span className="text-sm font-medium">Max {type.capacity}</span></div>
                    <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-[var(--theme-text)] opacity-40" /><span className="text-sm font-normal text-[var(--theme-text)]">ETB {type.basePrice}</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {type.amenities?.map((a, i) => <span key={i} className="text-[9px] uppercase font-normal px-2 py-1 bg-gray-100 text-gray-500 rounded-md">{a}</span>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- Modals --- */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
             <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <div><h2 className="text-2xl font-semibold text-gray-900 italic uppercase">Category Config</h2></div>
               <button onClick={() => setIsTypeModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
             </div>
             <form onSubmit={handleTypeSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Name</label><Input required placeholder="e.g. Deluxe King Suite" value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Capacity</label><Input type="number" required placeholder="e.g. 2" value={typeFormData.capacity} onChange={e => setTypeFormData({...typeFormData, capacity: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Base Price</label><Input step="0.01" type="number" required placeholder="e.g. 1500" value={typeFormData.basePrice} onChange={e => setTypeFormData({...typeFormData, basePrice: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Amenities</label>
                  <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-400">Add features for this room type</span><Button size="sm" type="button" onClick={addAmenity} variant="outline" className="h-7 text-xs font-normal border-[var(--theme-primary)] text-[var(--theme-primary)]">+ Feature</Button></div>
                  <div className="grid grid-cols-2 gap-2">{typeFormData.amenities.map((a, i) => (
                    <div key={i} className="relative group"><Input placeholder="e.g. Free Wi-Fi" value={a} onChange={e => updateAmenity(i, e.target.value)} className="pr-8" /><X className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => removeAmenity(i)} /></div>
                  ))}</div>
                </div>
                <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest">{editingType ? 'Save Changes' : 'Create Category'}</Button>
             </form>
          </div>
        </div>
      )}

      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-8 border-b flex justify-between items-center bg-gray-50/50 flex-shrink-0">
               <div><h2 className="text-2xl font-semibold text-gray-900 italic uppercase">Room Entry</h2></div>
               <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
             </div>
             <form onSubmit={handleRoomSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Room Number</label><Input required placeholder="e.g. 101" value={roomFormData.roomNumber} onChange={e => setRoomFormData({...roomFormData, roomNumber: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Category</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none" value={roomFormData.roomTypeId} onChange={e => setRoomFormData({...roomFormData, roomTypeId: e.target.value})}>
                    <option value="">Select Category</option>
                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name} (ETB {t.basePrice})</option>)}
                  </select>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-semibold uppercase text-gray-400">Status</label>
                  <select className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none" value={roomFormData.status} onChange={e => setRoomFormData({...roomFormData, status: e.target.value})}>
                    {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase text-gray-400 tracking-widest">Room Gallery</label>
                    <label className="cursor-pointer">
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div className="flex items-center gap-1.5 text-xs font-normal text-[var(--theme-primary)] hover:opacity-70 transition-opacity">
                        <Upload className="h-3 w-3" /> Add Photos
                      </div>
                    </label>
                  </div>

                  {roomFormData.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {roomFormData.images.map((img, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('dragIndex', index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const dragIdx = parseInt(e.dataTransfer.getData('dragIndex'));
                            if (dragIdx !== index) moveImage(dragIdx, index);
                          }}
                          className="relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing border border-gray-100 shadow-sm"
                        >
                          <img src={`http://localhost:5000${img}`} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => removeImage(index)} className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg">
                              <X className="h-3 w-3" />
                            </button>
                            <GripVertical className="h-4 w-4 text-white/60" />
                          </div>
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-[var(--theme-primary)] text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-md shadow">MAIN</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 gap-2">
                      <ImageIcon className="h-8 w-8" />
                      <p className="text-[10px] font-normal uppercase tracking-widest">No images yet</p>
                      <p className="text-[9px] text-gray-400">Click "Add Photos" above to upload</p>
                    </div>
                  )}
                  {roomFormData.images.length > 0 && (
                    <p className="text-[9px] text-gray-400 italic">Drag to reorder · First image is the main photo</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform">
                  {editingRoom ? 'Update Room' : 'Register Room'}
                </Button>
             </form>
          </div>
        </div>
      )}

      {isDuplicateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col">
             <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
               <div>
                 <h2 className="text-2xl font-semibold text-gray-900 italic uppercase">Duplicate Room</h2>
                 <p className="text-xs text-gray-500 mt-1">Copying configuration from Room #{duplicatingRoom?.roomNumber}</p>
               </div>
               <button onClick={() => setIsDuplicateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
             </div>
             <form onSubmit={handleDuplicateSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase text-gray-400">New Room Numbers</label>
                    <Button 
                      type="button" 
                      onClick={addDuplicateField} 
                      size="sm" 
                      className="h-7 px-3 bg-amber-100 text-amber-600 hover:bg-amber-200 border-none shadow-none rounded-lg text-xs font-bold"
                    >
                      + Add More
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {duplicateNumbers.map((num, i) => (
                      <div key={i} className="relative group">
                        <Input 
                          required 
                          placeholder={`Room ${i + 1}`}
                          value={num} 
                          onChange={e => updateDuplicateField(i, e.target.value)}
                          className="pr-10 h-10 rounded-xl border-gray-100 focus:border-amber-400"
                        />
                        {duplicateNumbers.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeDuplicateField(i)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-xl space-y-2 border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> Info
                  </p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This will create new rooms with the same <strong>Category</strong>, <strong>Status</strong>, and <strong>Images</strong> as the source room.
                  </p>
                </div>

                <Button type="submit" className="w-full h-12 bg-amber-500 text-white font-semibold uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform hover:bg-amber-600">
                  Duplicate Room(s)
                </Button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
