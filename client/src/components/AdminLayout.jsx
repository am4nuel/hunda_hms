import React from 'react';
import { 
  Hotel, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Palette,
  LogOut,
  Search, 
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Separator 
} from "@/components/ui/separator";
import { useTheme } from '@/context/ThemeContext';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useTheme();
  const profile = JSON.parse(localStorage.getItem('profile'))?.user || {};

  const handleLogout = () => {
    localStorage.removeItem('profile');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Appearance', path: '/themes', icon: Palette },
    { name: 'Properties', path: '/hotels', icon: Hotel },
    { name: 'Property Admins', path: '/hotel-admins', icon: Users },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      {/* Sidebar */}
      <aside 
        className="w-64 border-r flex flex-col pt-6 transition-all duration-300 shadow-xl z-20" 
        style={{ 
          backgroundColor: 'var(--theme-sidebar-bg)', 
          color: 'var(--theme-sidebar-text)',
          borderColor: 'var(--theme-border)' 
        }}
      >
        <div className="px-6 mb-8">
          <h1 className="text-xl font-extrabold flex items-center gap-2 tracking-tight" style={{ color: 'var(--theme-primary)' }}>
            <Hotel className="h-6 w-6" />
            <span>HUNDA ADMIN</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                }`}
                style={isActive ? { backgroundColor: 'var(--theme-primary)' } : {}}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header 
          className="h-16 border-b flex items-center justify-between px-8 sticky top-0 z-10 shrink-0 transition-colors duration-300" 
          style={{ 
            backgroundColor: 'var(--theme-header-bg)', 
            color: 'var(--theme-header-text)',
            borderColor: 'var(--theme-border)' 
          }}
        >
          <div className="flex items-center bg-foreground/5 rounded-lg px-3 py-2 w-96 border border-[var(--theme-border)] shadow-sm">
            <Search className="h-4 w-4 opacity-40" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 placeholder:opacity-40"
              style={{ color: 'inherit' }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMode}
              className="p-2.5 rounded-full hover:bg-foreground/5 transition-colors"
              title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            <button className="relative p-2.5 rounded-full hover:bg-foreground/5 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: 'var(--theme-header-bg)' }}></span>
            </button>
            
            <Separator orientation="vertical" className="h-8 mx-2 bg-[var(--theme-text)] opacity-10" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold uppercase tracking-wide truncate max-w-[150px]">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-[10px] font-extrabold uppercase tracking-widest leading-none mt-0.5" style={{ color: 'var(--theme-primary)' }}>
                  SYSTEM {profile.role}
                </p>
              </div>
              <Avatar className="h-10 w-10 border-2 shadow-sm" style={{ borderColor: 'var(--theme-border)' }}>
                <AvatarImage src={profile.profilePicture} />
                <AvatarFallback className="text-white font-black text-xs" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
