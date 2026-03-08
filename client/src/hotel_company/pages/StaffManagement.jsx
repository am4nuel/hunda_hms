import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Briefcase, 
  Calendar, 
  Clock, 
  GraduationCap, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Link,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import * as api from '@/api';
import { toast } from 'sonner';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]); // System users for linking
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  const [editingStaff, setEditingStaff] = useState(null);
  const [linkingStaff, setLinkingStaff] = useState(null);
  const [selectedStaffForAttendance, setSelectedStaffForAttendance] = useState(null);

  const [staffFormData, setStaffFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: '',
    salary: '',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [attendanceFormData, setAttendanceFormData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '',
    checkOut: '',
    notes: ''
  });

  const [shiftFormData, setShiftFormData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    status: 'Scheduled'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, usersRes] = await Promise.all([
        api.fetchStaff(),
        api.fetchSystemUsers()
      ]);
      setStaff(staffRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.updateStaff(editingStaff.id, staffFormData);
        toast.success('Staff updated');
      } else {
        await api.createStaff(staffFormData);
        toast.success('Staff added');
      }
      setIsStaffModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleLinkUser = async (userId) => {
    try {
      await api.updateStaff(linkingStaff.id, { systemUserId: userId });
      // Also update system user to have this staffId
      await api.updateSystemUser(userId, { staffId: linkingStaff.id });
      
      toast.success('Staff linked with system user');
      setIsLinkModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Linking failed');
    }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.markAttendance(attendanceFormData);
      toast.success('Attendance recorded');
      setIsAttendanceModalOpen(false);
      loadAttendance();
    } catch (error) {
      toast.error('Failed to record attendance');
    }
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createShift(shiftFormData);
      toast.success('Shift scheduled');
      setIsShiftModalOpen(false);
      loadShifts();
    } catch (error) {
      toast.error('Failed to schedule shift');
    }
  };

  const loadAttendance = async () => {
    try {
      const res = await api.fetchAttendance();
      setAttendance(res.data);
    } catch (error) {}
  };

  const loadShifts = async () => {
    try {
      const res = await api.fetchShifts();
      setShifts(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    loadAttendance();
    loadShifts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff profile?')) {
      try {
        await api.deleteStaff(id);
        toast.success('Staff deleted');
        loadData();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const filteredStaff = staff.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = ['Front Office', 'Housekeeping', 'F&B', 'Kitchen', 'Maintenance', 'Security', 'Management'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--theme-header-bg)] p-6 rounded-xl border-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
            Staff <span className="text-[var(--theme-primary)]">Management</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
            Manage personnel, attendance & shifts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            variant="outline"
            onClick={() => {
              setAvailableUsers(users.filter(u => !u.staffId));
              setIsUserListModalOpen(true);
            }}
            className="flex-1 sm:flex-none border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 rounded-2xl h-12 px-6 font-semibold uppercase tracking-widest text-xs"
          >
            <Users className="h-4 w-4 mr-2" />
            Add from Users
          </Button>
          <Button 
            onClick={() => {
              setEditingStaff(null);
              setStaffFormData({
                firstName: '', lastName: '', email: '', phoneNumber: '',
                department: 'Front Office', position: '', salary: '',
                hireDate: new Date().toISOString().split('T')[0], status: 'Active'
              });
              setIsStaffModalOpen(true);
            }}
            className="flex-1 sm:flex-none rounded-2xl h-12 px-6 bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest text-xs"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search staff by name, department, or role..."
          className="pl-11 h-12 bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-2xl text-[var(--theme-text)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredStaff.map((person) => (
            <Card key={person.id} className="bg-[var(--theme-header-bg)] border-none rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-[var(--theme-bg)] rounded-2xl flex items-center justify-center border border-[var(--border)]/10 text-[var(--theme-primary)] font-semibold text-xl">
                      {person.firstName[0]}{person.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--theme-text)] uppercase">{person.firstName} {person.lastName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-semibold uppercase border-[var(--theme-primary)] text-[var(--theme-primary)]">
                          {person.department}
                        </Badge>
                        <span className="text-[10px] font-normal text-[var(--theme-text)] opacity-40 uppercase tracking-widest">
                          {person.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {person.systemUserId ? (
                      <Badge className="bg-green-500/10 text-green-500 border-none rounded-lg text-[9px] font-semibold uppercase">
                        <Link className="h-3 w-3 mr-1" /> Linked to Account
                      </Badge>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 text-[9px] font-semibold uppercase rounded-lg"
                        onClick={() => {
                          setLinkingStaff(person);
                          setIsLinkModalOpen(true);
                        }}
                      >
                        Link System User
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingStaff(person);
                      setStaffFormData({ ...person });
                      setIsStaffModalOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(person.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-[9px] font-semibold text-gray-500 uppercase">Hire Date</p>
                      <p className="text-xs font-normal text-[var(--theme-text)]">{new Date(person.hireDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-[9px] font-semibold text-gray-500 uppercase">Salary</p>
                      <p className="text-xs font-normal text-[var(--theme-text)]">{parseFloat(person.salary).toLocaleString()} ETB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-[9px] font-semibold text-gray-500 uppercase">Status</p>
                      <p className="text-xs font-normal text-[var(--theme-text)]">{person.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-[var(--theme-header-bg)] border-none rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-widest text-[var(--theme-text)]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setIsAttendanceModalOpen(true)}
                className="w-full justify-start rounded-xl h-12 bg-[var(--theme-bg)] border border-[var(--border)]/10 text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-white group"
              >
                <ClipboardList className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-normal text-xs uppercase tracking-wider">Attendance Log</span>
              </Button>
              <Button 
                onClick={() => setIsShiftModalOpen(true)}
                className="w-full justify-start rounded-xl h-12 bg-[var(--theme-bg)] border border-[var(--border)]/10 text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-white group"
              >
                <Clock className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-normal text-xs uppercase tracking-wider">Shift Scheduling</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-none rounded-xl sm:max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase text-[var(--theme-text)]">
              {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStaffSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">First Name</label>
                <Input 
                  required
                  placeholder="e.g. John"
                  value={staffFormData.firstName}
                  onChange={(e) => setStaffFormData({...staffFormData, firstName: e.target.value})}
                  className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Last Name</label>
                <Input 
                  required
                  placeholder="e.g. Doe"
                  value={staffFormData.lastName}
                  onChange={(e) => setStaffFormData({...staffFormData, lastName: e.target.value})}
                  className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Email</label>
              <Input 
                type="email"
                required
                placeholder="e.g. john.doe@example.com"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Department</label>
                <Select 
                  value={staffFormData.department} 
                  onValueChange={(val) => setStaffFormData({...staffFormData, department: val})}
                >
                  <SelectTrigger className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Position</label>
                <Input 
                  required
                  placeholder="e.g. Head Chef"
                  value={staffFormData.position}
                  onChange={(e) => setStaffFormData({...staffFormData, position: e.target.value})}
                  className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Salary</label>
                <Input 
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={staffFormData.salary}
                  onChange={(e) => setStaffFormData({...staffFormData, salary: e.target.value})}
                  className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold uppercase text-gray-500 ml-1">Hire Date</label>
                <Input 
                  type="date"
                  required
                  value={staffFormData.hireDate}
                  onChange={(e) => setStaffFormData({...staffFormData, hireDate: e.target.value})}
                  className="bg-[var(--theme-bg)] border-[var(--border)]/10 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 rounded-2xl bg-[var(--theme-primary)] text-white font-semibold uppercase tracking-widest">
                {editingStaff ? 'Update Profile' : 'Confirm Registration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase text-[var(--theme-text)]">Link Staff Account</DialogTitle>
            <DialogDescription className="text-xs font-normal uppercase tracking-wider opacity-60">Select an existing system user account for {linkingStaff?.firstName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {users.filter(u => !u.staffId).map((user) => (
              <Button 
                key={user.id}
                variant="outline"
                className="w-full justify-between rounded-xl h-14 border-[var(--border)]/10 bg-[var(--theme-bg)] hover:bg-[var(--theme-primary)] hover:text-white group"
                onClick={() => handleLinkUser(user.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold uppercase text-xs">{user.userName}</span>
                  <span className="text-[9px] font-normal opacity-40 group-hover:opacity-60">{user.role}</span>
                </div>
                <UserCheck className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))}
            {users.filter(u => !u.staffId).length === 0 && (
              <div className="text-center py-6 opacity-40">
                <p className="text-[10px] font-semibold uppercase">No unlinked accounts found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl sm:max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase text-[var(--theme-text)]">Attendance Log</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4 custom-scrollbar pr-2">
            <form onSubmit={handleAttendanceSubmit} className="bg-[var(--theme-bg)] p-6 rounded-xl border-none space-y-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--theme-primary)]">Log New Entry</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Staff Member</label>
                  <Select onValueChange={(val) => setAttendanceFormData({...attendanceFormData, staffId: val})}>
                    <SelectTrigger className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl">
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Date</label>
                  <Input type="date" value={attendanceFormData.date} onChange={e => setAttendanceFormData({...attendanceFormData, date: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Status</label>
                  <Select value={attendanceFormData.status} onValueChange={(val) => setAttendanceFormData({...attendanceFormData, status: val})}>
                    <SelectTrigger className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Present', 'Late', 'Absent', 'Half Day'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Check In</label>
                  <Input type="datetime-local" onChange={e => setAttendanceFormData({...attendanceFormData, checkIn: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Check Out</label>
                  <Input type="datetime-local" onChange={e => setAttendanceFormData({...attendanceFormData, checkOut: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[var(--theme-primary)] text-white font-semibold uppercase h-10 rounded-xl">Record Attendance</Button>
            </form>

            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 ml-1">Recent Records</h4>
              <div className="space-y-2">
                {attendance.map((record) => (
                  <div key={record.id} className="bg-[var(--theme-bg)]/50 p-4 rounded-xl border-none flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${record.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-xs font-normal text-[var(--theme-text)]">{record.Staff?.firstName} {record.Staff?.lastName}</p>
                        <p className="text-[10px] opacity-40 font-semibold uppercase">{new Date(record.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-semibold uppercase">{record.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Modal */}
      <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl sm:max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold uppercase text-[var(--theme-text)]">Shift Scheduling</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4 custom-scrollbar pr-2">
            <form onSubmit={handleShiftSubmit} className="bg-[var(--theme-bg)] p-6 rounded-xl border border-[var(--border)]/10 space-y-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--theme-primary)]">Schedule New Shift</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Staff Member</label>
                  <Select onValueChange={(val) => setShiftFormData({...shiftFormData, staffId: val})}>
                    <SelectTrigger className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl">
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.firstName} {s.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Date</label>
                  <Input type="date" value={shiftFormData.date} onChange={e => setShiftFormData({...shiftFormData, date: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">Start Time</label>
                  <Input type="time" value={shiftFormData.startTime} onChange={e => setShiftFormData({...shiftFormData, startTime: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase text-gray-500">End Time</label>
                  <Input type="time" value={shiftFormData.endTime} onChange={e => setShiftFormData({...shiftFormData, endTime: e.target.value})} className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[var(--theme-primary)] text-white font-semibold uppercase h-10 rounded-xl">Create Schedule</Button>
            </form>

            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 ml-1">Scheduled Shifts</h4>
              <div className="space-y-2">
                {shifts.map((shift) => (
                  <div key={shift.id} className="bg-[var(--theme-bg)]/50 p-4 rounded-2xl border border-[var(--border)]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-[var(--theme-primary)]" />
                      <div>
                        <p className="text-xs font-bold text-[var(--theme-text)]">{shift.Staff?.firstName} {shift.Staff?.lastName}</p>
                        <p className="text-[10px] opacity-40 font-black uppercase">{shift.startTime} - {shift.endTime} | {new Date(shift.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] font-black uppercase">{shift.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* User List Modal */}
      <Dialog open={isUserListModalOpen} onOpenChange={setIsUserListModalOpen}>
        <DialogContent className="bg-[var(--theme-header-bg)] border-[var(--border)]/10 rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase text-[var(--theme-text)]">Add from System Users</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-wider opacity-60">Choose a user to create a staff profile for</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {availableUsers.map((user) => (
              <Button 
                key={user.id}
                variant="outline"
                className="w-full justify-between rounded-xl h-14 border-[var(--border)]/10 bg-[var(--theme-bg)] hover:bg-[var(--theme-primary)] hover:text-white group"
                onClick={() => {
                  setStaffFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    department: 'Front Office',
                    position: user.role.replace('_', ' ').toUpperCase(),
                    salary: '',
                    hireDate: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    systemUserId: user.id
                  });
                  setEditingStaff(null);
                  setIsUserListModalOpen(false);
                  setIsStaffModalOpen(true);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-sm">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] font-black uppercase opacity-40 group-hover:opacity-60">{user.role}</span>
                </div>
                <UserCheck className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))}
            {availableUsers.length === 0 && (
              <div className="text-center py-6 opacity-40">
                <p className="text-[10px] font-black uppercase">No unlinked users found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
