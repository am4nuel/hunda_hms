import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  X,
  Eye,
  EyeOff,
  Phone,
  Key,
  Database,
  Building2,
  Receipt,
  Users2,
  FileText,
  CreditCard,
  Package,
  Truck,
  History,
  Briefcase,
  Settings,
  ChefHat,
  ShoppingBag,
  Utensils,
  LayoutDashboard,
  BarChart3
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Users } from 'lucide-react';
import * as api from '@/api';
import { toast } from 'sonner';

const statusConfig = {
  'Active': { color: 'bg-green-500', text: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle2 },
  'Inactive': { color: 'bg-red-500', text: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
};

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hotel_manager', label: 'Hotel Manager' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'restaurant_manager', label: 'Restaurant Manager' },
  { value: 'kitchen_staff', label: 'Kitchen Staff' },
  { value: 'cashier', label: 'Cashier' },
];

const SystemUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'hotel_manager',
    status: 'Active',
    staffId: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isStaffListModalOpen, setIsStaffListModalOpen] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);

  // Permissions state
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);

  const allModules = [
    { id: 'hotel-dashboard', name: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', name: 'Analytics & Reports', icon: BarChart3 },
    { id: 'room-management', name: 'Rooms', icon: Building2 },
    { id: 'bookings', name: 'Bookings', icon: Receipt },
    { id: 'guest-management', name: 'Guests', icon: Users2 },
    { id: 'menu-management', name: 'Menu Items', icon: Utensils },
    { id: 'recipe-management', name: 'Recipes', icon: ChefHat },
    { id: 'order-management', name: 'Orders', icon: ShoppingBag },
    { id: 'kitchen-display', name: 'Kitchen Display', icon: ChefHat },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'supplier-management', name: 'Suppliers', icon: Truck },
    { id: 'activity-logs', name: 'Activity Logs', icon: History },
    { id: 'banks', name: 'Banks', icon: CreditCard },
    { id: 'staff', name: 'Staff', icon: Briefcase },
    { id: 'system-users', name: 'System Users', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleSelectAll = () => {
    if (selectedModules.length === allModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(allModules.map(m => m.id));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.fetchSystemUsers();
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load system users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.updateSystemUser(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await api.createSystemUser(formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteSystemUser(id);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handlePermissionsChange = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await api.updateSystemUser(permissionsUser.id, {
        allowedModules: selectedModules
      });
      toast.success('Permissions updated successfully!');
      setIsPermissionsOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update permissions');
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            User <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage system access & security roles</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              className="pl-10 h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                const res = await api.fetchStaff();
                setAvailableStaff(res.data.filter(s => !s.systemUserId));
                setIsStaffListModalOpen(true);
              } catch (error) {
                toast.error('Failed to load staff');
              }
            }}
            className="border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 flex items-center gap-2 rounded-xl"
          >
            <Users className="h-4 w-4" /> Add from Staff
          </Button>
          <Button 
            onClick={() => {
              setEditingUser(null);
              setFormData({ firstName: '', lastName: '', userName: '', email: '', phoneNumber: '', password: '', role: 'hotel_manager', status: 'Active' });
              setIsModalOpen(true);
            }}
            className="bg-[var(--theme-primary)] hover:opacity-90 flex items-center gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
        </div>
      ) : (
        <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-[var(--theme-header-bg)] text-[var(--theme-text)]">
          <Table>
            <TableHeader className="bg-[var(--theme-bg)] border-b border-[var(--border)]/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold uppercase tracking-widest text-[10px]">User</TableHead>
                <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Username</TableHead>
                <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Role</TableHead>
                <TableHead className="font-semibold uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="text-right font-semibold uppercase tracking-widest text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const config = statusConfig[user.status] || statusConfig['Active'];
                return (
                  <TableRow key={user.id} className="group hover:bg-[var(--theme-bg)]/50 transition-colors border-b border-[var(--border)]/10">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-normal">{user.firstName} {user.lastName}</span>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {user.email && <span className="text-[10px] opacity-60 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>}
                          {user.phoneNumber && <span className="text-[10px] opacity-60 flex items-center gap-1"><Phone className="h-3 w-3" /> {user.phoneNumber}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{user.userName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px] font-normal">
                        <Shield className="h-3 w-3 mr-1" /> {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tighter ${config.bg} ${config.text}`}>
                        <config.icon className="h-3 w-3" />
                        {user.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setPermissionsUser(user);
                          setSelectedModules(user.allowedModules || []);
                          setIsPermissionsOpen(true);
                        }} className="h-8 w-8 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Manage Permissions">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingUser(user);
                          setFormData({ ...user, password: '' });
                          setIsModalOpen(true);
                        }} className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-gray-400 font-normal uppercase tracking-widest text-xs">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-semibold text-gray-900 italic uppercase">{editingUser ? 'Edit User' : 'New User Account'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">First Name</label>
                  <Input required placeholder="e.g. John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Last Name</label>
                  <Input required placeholder="e.g. Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Username</label>
                  <Input required placeholder="e.g. jdoe" value={formData.userName} onChange={e => setFormData({...formData, userName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Email (Optional)</label>
                  <Input type="email" placeholder="e.g. john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Phone Number (Optional)</label>
                  <Input placeholder="e.g. +251..." value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-gray-400">Password {editingUser && '(leave blank to keep current)'}</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      required={!editingUser} 
                      placeholder="Enter a secure password..."
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Role</label>
                  <select 
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none border" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Status</label>
                  <select 
                    className="w-full h-10 px-3 bg-gray-50 rounded-xl text-sm outline-none border" 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 bg-[var(--theme-primary)] text-white font-black uppercase tracking-widest mt-4">
                {editingUser ? 'Update Account' : 'Create Account'}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Staff List Modal */}
      <Dialog open={isStaffListModalOpen} onOpenChange={setIsStaffListModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-[var(--theme-text)]">Select Staff Member</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider opacity-60">Choose a staff member to create a system account for</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {availableStaff.map((person) => (
              <Button 
                key={person.id}
                variant="outline"
                className="w-full justify-between rounded-xl h-14 border-[var(--border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-primary)] hover:text-white group"
                onClick={() => {
                  setFormData({
                    firstName: person.firstName,
                    lastName: person.lastName,
                    userName: (person.firstName[0] + person.lastName).toLowerCase(),
                    email: person.email,
                    phoneNumber: person.phoneNumber || '',
                    password: '',
                    role: person.position?.toLowerCase().includes('manager') ? 'hotel_manager' : 'receptionist',
                    status: 'Active',
                    staffId: person.id
                  });
                  setEditingUser(null);
                  setIsStaffListModalOpen(false);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-sm">{person.firstName} {person.lastName}</span>
                  <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-60">{person.position}</span>
                </div>
                <Users className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))}
            {availableStaff.length === 0 && (
              <div className="text-center py-6 opacity-40">
                <p className="text-[10px] font-black uppercase">No unlinked staff found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Slide-out */}
      {isPermissionsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsPermissionsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-[var(--theme-header-bg)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-[var(--border)]/10 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]/10 bg-[var(--theme-bg)]/50">
              <div>
                <h2 className="text-xl font-semibold text-[var(--theme-text)] drop-shadow-sm">Module Permissions</h2>
                <p className="text-[10px] uppercase font-bold text-[var(--theme-text)] opacity-40 mt-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Configuring access for {permissionsUser?.firstName} {permissionsUser?.lastName}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsPermissionsOpen(false)} className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-primary)] rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-indigo-500/10 text-indigo-500 border-none uppercase text-[10px] tracking-widest font-bold">
                  {permissionsUser?.role.replace('_', ' ')}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSelectAll}
                  className="text-xs uppercase tracking-wider font-bold text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl px-4"
                >
                  {selectedModules.length === allModules.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="grid gap-3 pb-8">
                {allModules.map((module) => {
                  const isSelected = selectedModules.includes(module.id);
                  const Icon = module.icon;
                  return (
                    <div 
                      key={module.id}
                      onClick={() => handlePermissionsChange(module.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100/50' : 'bg-[var(--theme-bg)] border-[var(--border)]/10 hover:border-indigo-300 hover:shadow-sm'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-indigo-900' : 'text-[var(--theme-text)] opacity-80 group-hover:text-indigo-600 group-hover:opacity-100'}`}>{module.name}</span>
                      </div>
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${isSelected ? 'bg-indigo-500 border-indigo-500 rotate-0 scale-100' : 'bg-transparent border-gray-300 group-hover:border-indigo-300 rotate-12 scale-90'}`}>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)]/10 bg-[var(--theme-bg)] relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <Button 
                onClick={handleSavePermissions}
                disabled={selectedModules.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-6 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
              >
                <Database className="mr-3 h-5 w-5" /> {selectedModules.length === 0 ? 'Select Modules' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default SystemUserManagement;
