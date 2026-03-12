import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hotel, 
  Users, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  Search,
  Bed,
  DoorOpen,
  CalendarDays,
  Moon,
  Sun,
  Utensils,
  ShoppingBag as ShoppingBagIcon,
  ChefHat,
  Briefcase,
  BarChart3,
  CreditCard,
  Package,
  History,
  Truck,
  Table as TableIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from "@/components/ui/button";
import * as api from '@/api';
import { useSocket } from '../context/SocketContext';

const HotelDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useTheme();
  const { notifications, clearNotifications } = useSocket();
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  const [hotelName, setHotelName] = React.useState(profile.user?.hotelName || 'Hotel Admin');
  const [loadingHotel, setLoadingHotel] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const getHotelDetails = async () => {
      if (profile.user?.hotelId && !profile.user?.hotelName) {
        try {
          setLoadingHotel(true);
          const { data } = await api.fetchHotel(profile.user.hotelId);
          if (data?.name) {
            setHotelName(data.name);
            const updatedProfile = { ...profile, user: { ...profile.user, hotelName: data.name } };
            localStorage.setItem('profile', JSON.stringify(updatedProfile));
          }
        } catch (error) {
          console.error('Error fetching hotel details:', error);
        } finally {
          setLoadingHotel(false);
        }
      }
    };
    getHotelDetails();
  }, [profile.user?.hotelId, profile.user?.hotelName]);

  const handleLogout = () => {
    localStorage.removeItem('profile');
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'Main',
      items: [
        { name: 'Overview', icon: LayoutDashboard, path: '/hotel-dashboard' },
        { name: 'Analytics & Reports', icon: BarChart3, path: '/hotel-dashboard/analytics' },
      ]
    },
    {
      group: 'Hospitality',
      items: [
        { name: 'Rooms', icon: Bed, path: '/hotel-dashboard/room-management' },
        { name: 'Bookings', icon: CalendarDays, path: '/hotel-dashboard/bookings' },
      ]
    },
    {
      group: 'Dining',
      items: [
        { name: 'Menu Items', icon: Utensils, path: '/hotel-dashboard/menu-management' },
        { name: 'Recipes', icon: ChefHat, path: '/hotel-dashboard/recipe-management' },
        { name: 'Orders', icon: ShoppingBagIcon, path: '/hotel-dashboard/order-management' },
        { name: 'Table Management', icon: TableIcon, path: '/hotel-dashboard/table-management' },
        { name: 'Kitchen Display', icon: ChefHat, path: '/hotel-dashboard/kitchen-display' },
      ]
    },
    {
      group: 'Administration',
      items: [
        { name: 'Inventory', icon: Package, path: '/hotel-dashboard/inventory' },
        { name: 'Suppliers', icon: Truck, path: '/hotel-dashboard/supplier-management' },
        { name: 'Activity Logs', icon: History, path: '/hotel-dashboard/activity-logs' },
        { name: 'Banks', icon: CreditCard, path: '/hotel-dashboard/banks' },
        { name: 'Staff', icon: Briefcase, path: '/hotel-dashboard/staff' },
        { name: 'System Users', icon: Users, path: '/hotel-dashboard/system-users' },
      ]
    },
    {
      group: 'Configuration',
      items: [
        { name: 'Settings', icon: Settings, path: '/hotel-dashboard/settings' },
      ]
    }
  ];

  const userRole = profile?.user?.role;
  const allowedModules = profile?.user?.allowedModules || [];

  // Filter groups
  const filteredNavGroups = navGroups.map(group => {
    // Admins, Hotel Admins, and Hotel Managers see everything
    if (userRole === 'admin' || userRole === 'hotel_admin' || userRole === 'hotel_manager') {
      return group;
    }

    // Filter items based on allowedModules keys (which correspond roughly to paths)
    const filteredItems = group.items.filter(item => {
      // Extract the last part of the path, e.g. '/hotel-dashboard/settings' -> 'settings'
      const pathKey = item.path.split('/').pop();
      return allowedModules.includes(pathKey);
    });

    return {
      ...group,
      items: filteredItems
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="flex min-h-screen bg-[var(--theme-bg)]">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[var(--theme-sidebar-bg)] border-none flex flex-col transition-all duration-300 shadow-xl z-40 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <h2 className="text-xl font-normal text-[var(--theme-primary)] truncate">{loadingHotel ? 'Loading...' : hotelName}</h2>
          <p className="text-xs text-[var(--theme-sidebar-text)] opacity-40 uppercase tracking-widest mt-1">Management Portal</p>
        </div>
        
        <nav className="flex-1 px-4 mt-4 overflow-y-auto custom-sidebar pb-4">
          {filteredNavGroups.map((group, gIdx) => (
            <div key={group.group} className={`${gIdx !== 0 ? 'mt-6' : ''}`}>
              <h3 className="px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--theme-sidebar-text)] opacity-30 mb-2">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.path === '/hotel-dashboard' 
                    ? location.pathname === '/hotel-dashboard' || location.pathname === '/hotel-dashboard/'
                    : location.pathname.startsWith(item.path);

                  const notificationCount = 
                    item.path.includes('bookings') ? notifications.bookings :
                    item.path.includes('order-management') ? notifications.orders : 0;

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (notificationCount > 0) {
                          const type = item.path.includes('bookings') ? 'bookings' : 'orders';
                          clearNotifications(type);
                        }
                        navigate(item.path);
                        setIsSidebarOpen(false); // Close sidebar on click in mobile
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-normal rounded-xl transition-all group relative ${
                        active 
                          ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/20 shadow-primary/20' 
                          : 'text-[var(--theme-sidebar-text)] opacity-60 hover:opacity-100 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="flex-1 text-left">{item.name}</span>
                      {notificationCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full animate-bounce">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)]/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-[var(--theme-header-bg)] border-none flex items-center justify-between px-4 md:px-6 z-10 transition-colors duration-300 shadow-sm relative">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-[var(--theme-header-text)]"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="relative w-96 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--theme-header-text)] opacity-40" />
              <input 
                type="text" 
                placeholder="Search analytics, staff, or settings..." 
                className="w-full pl-10 pr-4 py-2 bg-[var(--theme-bg)] border-none rounded-lg text-sm text-[var(--theme-text)] focus:ring-2 focus:ring-[var(--theme-primary)]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[var(--theme-header-text)]" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-[var(--theme-header-bg)]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMode} className="text-[var(--theme-header-text)] hover:text-[var(--theme-primary)] transition-colors">
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="h-8 w-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-white text-xs font-normal">
              {profile.user?.firstName?.[0] || 'H'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-normal text-[var(--theme-header-text)]">{profile.user?.firstName} {profile.user?.lastName}</p>
              <p className="text-[10px] text-[var(--theme-header-text)] opacity-40 uppercase font-semibold tracking-tighter">Hotel Administrator</p>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HotelDashboard;
