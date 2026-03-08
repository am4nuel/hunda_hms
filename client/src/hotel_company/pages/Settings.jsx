import React, { useState } from 'react';
import { 
  User, 
  Database, 
  FileText, 
  Smartphone, 
  LifeBuoy, 
  Key, 
  CreditCard, 
  Monitor,
  Lock,
  ShieldCheck,
  Save,
  Building2,
  Receipt,
  Users2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from '../../context/ThemeContext';
import * as api from '../../api';
import { toast } from 'sonner';

const Settings = () => {
  const { mode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const user = profile?.user || {};

  const navigationItems = [
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'hotel_details', label: 'Hotel Profile', icon: Building2 },
    { id: 'taxes_fees', label: 'Taxes & Fees', icon: Receipt },
    { id: 'booking_rules', label: 'Booking Rules', icon: Database },
    { id: 'staff_roles', label: 'Staff Roles', icon: Users2 },
    { id: 'integrations', label: 'Integrations', icon: Smartphone },
    { id: 'banks', label: 'Bank Accounts', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      return toast.error('Current password is required');
    }
    if (newPassword && newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      setIsUpdating(true);
      await api.changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.14)-theme(spacing.8))] bg-[var(--theme-bg)] transition-colors duration-300">
      
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--theme-text)] uppercase italic">
          System <span className="text-[var(--theme-primary)]">Settings</span>
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">Manage your account and platform preferences</p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-[var(--theme-text)] opacity-60 hover:opacity-100 hover:bg-[var(--theme-header-bg)]'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
          {activeTab === 'profile' && (
            <Card className="bg-[var(--theme-header-bg)] border-none shadow-sm rounded-2xl p-8 max-w-4xl">
              <div className="mb-10">
                <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">Admin Profile</h2>
                <p className="text-[var(--theme-text)] opacity-50 text-sm">Update your credentials and account security</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                
                {/* Username */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--theme-text)] opacity-80 uppercase tracking-widest pl-1">Username / Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text)] opacity-40" />
                    <input 
                      type="text" 
                      value={user.userName || user.email || ''}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--theme-bg)] border border-[var(--border)]/30 rounded-xl text-sm text-[var(--theme-text)] outline-none transition-all opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Current Password */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--theme-text)] opacity-80 uppercase tracking-widest pl-1">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text)] opacity-40" />
                    <input 
                      type="password" 
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--theme-text)] opacity-80 uppercase tracking-widest pl-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text)] opacity-40" />
                    <input 
                      type="password" 
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--theme-bg)] border border-[var(--border)]/30 rounded-xl text-sm text-[var(--theme-text)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--theme-text)] opacity-80 uppercase tracking-widest pl-1">Confirm New Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-text)] opacity-40" />
                    <input 
                      type="password" 
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[var(--theme-bg)] border border-[var(--border)]/30 rounded-xl text-sm text-[var(--theme-text)] focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:opacity-40"
                    />
                  </div>
                </div>

              </div>

              <div className="pt-6 border-t border-[var(--border)]/10">
                <Button 
                  onClick={handlePasswordChange}
                  disabled={isUpdating || !currentPassword || !newPassword}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>

            </Card>
          )}

          {activeTab !== 'profile' && (
            <div className="h-full flex flex-col items-center justify-center text-[var(--theme-text)] opacity-40">
              <Monitor className="h-16 w-16 mb-4 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">Configuration View</h2>
              <p className="text-sm">Settings for {navigationItems.find(i => i.id === activeTab)?.label} are coming soon.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
          opacity: 0.5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--theme-primary);
        }
      `}</style>
    </div>
  );
};

export default Settings;
