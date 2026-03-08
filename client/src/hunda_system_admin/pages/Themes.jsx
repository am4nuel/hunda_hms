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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertCircle,
  Layout,
  Type,
  Monitor,
  Menu,
  Square,
  Building2,
  Paintbrush2,
  Plus,
  Edit,
  Trash2,
  Palette,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

const Themes = () => {
  const { applyTheme, activeTheme } = useTheme();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    accentColor: '#1d4ed8',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    sidebarColor: '#ffffff',
    sidebarTextColor: '#334155',
    headerColor: '#ffffff',
    headerTextColor: '#0f172a',
    hotelId: ''
  });

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const { data } = await api.fetchThemes();
      setThemes(data);
    } catch (error) {
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTheme(null);
    setFormData({
      name: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#60a5fa',
      accentColor: '#1d4ed8',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      sidebarColor: '#ffffff',
      sidebarTextColor: '#334155',
      headerColor: '#ffffff',
      headerTextColor: '#0f172a',
      hotelId: ''
    });
    setOpen(true);
  };

  const handleOpenEdit = (theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor,
      sidebarColor: theme.sidebarColor || '#ffffff',
      sidebarTextColor: theme.sidebarTextColor || '#334155',
      headerColor: theme.headerColor || '#ffffff',
      headerTextColor: theme.headerTextColor || '#0f172a',
      hotelId: theme.hotelId || ''
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, hotelId: formData.hotelId || null };
      if (editingTheme) {
        await api.updateTheme(editingTheme.id, payload);
        toast.success('Theme updated successfully');
      } else {
        await api.createTheme(payload);
        toast.success('Theme created successfully');
      }
      setOpen(false);
      loadThemes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      try {
        await api.deleteTheme(id);
        toast.success('Theme deleted successfully');
        loadThemes();
      } catch (error) {
        toast.error('Failed to delete theme');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            Theme Management
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic">
            Manage visual themes across all properties.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTheme && (
            <button 
              onClick={() => applyTheme(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset to System Default
            </button>
          )}
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-200"
          >
            <Plus className="h-4 w-4" />
            Create New Theme
          </button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase tracking-tight">All Themes</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Manage global and property-specific color profiles.</CardDescription>
          </div>
          <button 
            onClick={loadThemes}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Theme Name</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Visual Profile</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Color Palette</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Assignment</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.map((theme) => (
                <TableRow key={theme.id} className="border-slate-50 transition-colors hover:bg-slate-50/50 group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="font-bold text-sm text-slate-900 tracking-tight">{theme.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <div 
                        className="w-32 h-10 rounded-md border border-slate-200 flex items-center justify-center text-[9px] font-black uppercase tracking-tighter"
                        style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
                      >
                        Sample Preview
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[120px] mx-auto">
                      {[
                        { color: theme.primaryColor, label: 'Primary' },
                        { color: theme.secondaryColor, label: 'Secondary' },
                        { color: theme.accentColor, label: 'Accent' },
                        { color: theme.sidebarColor || '#ffffff', label: 'Sidebar' },
                        { color: theme.headerColor || '#ffffff', label: 'Header' }
                      ].map((c, i) => (
                        <div 
                          key={i}
                          className="w-5 h-5 rounded-full border border-slate-200 shadow-sm"
                          style={{ backgroundColor: c.color }}
                          title={c.label + ': ' + c.color}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {theme.hotelId ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                        PROPERTY_{theme.hotelId}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                        GLOBAL_CORE
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => applyTheme(theme)}
                        className={`p-2 rounded-lg transition-colors border ${activeTheme?.id === theme.id ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-100'}`}
                        title="Apply Preview"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(theme)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(theme.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {themes.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Palette className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No themes found</p>
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
                  <Paintbrush2 className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                    {editingTheme ? 'Edit Theme' : 'Create Theme'}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium opacity-50 italic">
                    Define the high-end visual identity for your property node.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[65vh] overflow-y-auto px-8 py-6 space-y-8">
              {/* Section: Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Layout className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identity & Brading</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Theme Alias</label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                      placeholder="e.g., Midnight Executive"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Property ID (Optional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 opacity-20" />
                      <input
                        type="number"
                        value={formData.hotelId || ''}
                        onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder="Node ID"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Core Palette */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Palette className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Core Color Palette</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Primary (Brand)', key: 'primaryColor' },
                    { label: 'Secondary', key: 'secondaryColor' },
                    { label: 'Accent', key: 'accentColor' },
                  ].map((input) => (
                    <div key={input.key} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{input.label}</label>
                      <div className="relative group">
                        <div 
                          className="absolute left-3 top-3 w-4 h-4 rounded-full border border-white/20 shadow-inner group-focus-within:scale-110 transition-transform"
                          style={{ backgroundColor: formData[input.key] }}
                        />
                        <input
                          type="text"
                          value={formData[input.key]}
                          onChange={(e) => setFormData({...formData, [input.key]: e.target.value})}
                          className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-black uppercase focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Global UI */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Monitor className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global UI Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Page Background', key: 'backgroundColor', icon: Layout },
                    { label: 'Global Text', key: 'textColor', icon: Type },
                  ].map((input) => (
                    <div key={input.key} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{input.label}</label>
                      <div className="relative group">
                        <div 
                          className="absolute left-3 top-3 w-4 h-4 rounded-full border border-white/20 group-focus-within:scale-110 transition-transform"
                          style={{ backgroundColor: formData[input.key] }}
                        />
                        <input
                          type="text"
                          value={formData[input.key]}
                          onChange={(e) => setFormData({...formData, [input.key]: e.target.value})}
                          className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-black uppercase focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Navigation Blocks */}
              <div className="space-y-4 pb-4">
                <div className="flex items-center gap-2 opacity-30">
                  <Menu className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Navigation Components</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: 'Sidebar Bg', key: 'sidebarColor' },
                    { label: 'Sidebar Text', key: 'sidebarTextColor' },
                    { label: 'Header Bg', key: 'headerColor' },
                    { label: 'Header Text', key: 'headerTextColor' },
                  ].map((input) => (
                    <div key={input.key} className="space-y-1.5 pb-2">
                       <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">{input.label}</label>
                        <div className="h-2 w-8 rounded-full border border-white/10" style={{ backgroundColor: formData[input.key] }} />
                      </div>
                      <input
                        type="text"
                        value={formData[input.key]}
                        onChange={(e) => setFormData({...formData, [input.key]: e.target.value})}
                        className="w-full bg-foreground/5 border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-[11px] font-black uppercase focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
                        placeholder="#000000"
                      />
                    </div>
                  ))}
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
                {editingTheme ? 'Update Identity' : 'Create Identity'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Themes;
