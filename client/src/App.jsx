import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Home from './hunda_system_admin/pages/Home';
import Themes from './hunda_system_admin/pages/Themes';
import Hotels from './hunda_system_admin/pages/Hotels';
import HotelAdmins from './hunda_system_admin/pages/HotelAdmins';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Hotel Company Components
import HotelDashboard from './hotel_company/HotelDashboard';
import HotelOverview from './hotel_company/HotelOverview';
import RoomManagement from './hotel_company/pages/RoomManagement';
import BookingManagement from './hotel_company/pages/BookingManagement';
import SystemUserManagement from './hotel_company/pages/SystemUserManagement';
import MenuManagement from './hotel_company/pages/MenuManagement';
import OrderManagement from './hotel_company/pages/OrderManagement';
import KitchenDisplay from './hotel_company/pages/KitchenDisplay';
import StaffManagement from './hotel_company/pages/StaffManagement';
import ReportingAnalytics from './hotel_company/pages/ReportingAnalytics';
import BankManagement from './hotel_company/pages/BankManagement';
import InventoryManagement from './hotel_company/pages/InventoryManagement';
import ActivityLogs from './hotel_company/pages/ActivityLogs';
import GuestNotifications from './hotel_company/pages/GuestNotifications';
import RecipeManagement from './hotel_company/pages/RecipeManagement';
import SupplierManagement from './hotel_company/pages/SupplierManagement';
import Settings from './hotel_company/pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* System Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/" element={<Home />} />
              <Route path="/themes" element={<Themes />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotel-admins" element={<HotelAdmins />} />
            </Route>
  
            {/* Hotel Admin Dashboard Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'hotel_admin', 'hotel_manager', 'receptionist', 'restaurant_manager', 'kitchen_staff', 'cashier']} />}>
              <Route path="/hotel-dashboard" element={<HotelDashboard />}>
                <Route index element={<HotelOverview />} />
                <Route path="room-management" element={<RoomManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="system-users" element={<SystemUserManagement />} />
                <Route path="menu-management" element={<MenuManagement />} />
                <Route path="order-management" element={<OrderManagement />} />
                <Route path="kitchen-display" element={<KitchenDisplay />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="analytics" element={<ReportingAnalytics />} />
                <Route path="banks" element={<BankManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="notifications" element={<GuestNotifications />} />
                <Route path="recipe-management" element={<RecipeManagement />} />
                <Route path="supplier-management" element={<SupplierManagement />} />
                <Route path="property" element={<div className="text-[var(--theme-text)]">Hotel Details Page Coming Soon</div>} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
  
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}

export default App;
