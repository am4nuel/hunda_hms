import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add interceptors if needed (e.g., for token handling)
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile');
  if (profile) {
    const parsed = JSON.parse(profile);
    req.headers.Authorization = `Bearer ${parsed.token}`;
    
    // Automatically add hotelId to GET requests if not present 
    // and we have one in the profile (for HotelAdmin)
    if (req.method === 'get' && parsed.user?.hotelId && !req.params?.hotelId) {
      req.params = { ...req.params, hotelId: parsed.user.hotelId };
    }
  }
  return req;
});

export const login = (credentials) => API.post('/auth/login', credentials);
export const changePassword = (data) => API.put('/auth/change-password', data);
export const uploadImages = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Theme Endpoints
export const fetchThemes = () => API.get('/themes');
export const createTheme = (themeData) => API.post('/themes', themeData);
export const updateTheme = (id, themeData) => API.put(`/themes/${id}`, themeData);
export const deleteTheme = (id) => API.delete(`/themes/${id}`);

// Hotel Endpoints
export const fetchHotels = () => API.get('/hotels');
export const fetchHotel = (id) => API.get(`/hotels/${id}`);
export const createHotel = (hotelData) => API.post('/hotels', hotelData);
export const updateHotel = (id, hotelData) => API.put(`/hotels/${id}`, hotelData);
export const deleteHotel = (id) => API.delete(`/hotels/${id}`);

// Hotel Admin Endpoints
export const fetchHotelAdmins = () => API.get('/hotel-admins');
export const createHotelAdmin = (newAdmin) => API.post('/hotel-admins', newAdmin);
export const updateHotelAdmin = (id, adminData) => API.put(`/hotel-admins/${id}`, adminData);
export const deleteHotelAdmin = (id) => API.delete(`/hotel-admins/${id}`);

// Room Types
export const fetchRoomTypes = () => API.get('/room-types');
export const createRoomType = (newRoomType) => API.post('/room-types', newRoomType);
export const updateRoomType = (id, updatedRoomType) => API.put(`/room-types/${id}`, updatedRoomType);
export const deleteRoomType = (id) => API.delete(`/room-types/${id}`);

// Rooms
export const fetchRooms = () => API.get('/rooms');
export const createRoom = (newRoom) => API.post('/rooms', newRoom);
export const updateRoom = (id, updatedRoom) => API.put(`/rooms/${id}`, updatedRoom);
export const updateRoomStatus = (id, status) => API.patch(`/rooms/${id}/status`, { status });
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
export const duplicateRoom = (id, roomNumbers) => API.post(`/rooms/${id}/duplicate`, { roomNumbers });

// Guests
export const fetchGuests = () => API.get('/guests');
export const fetchGuest = (id) => API.get(`/guests/${id}`);
export const createGuest = (data) => API.post('/guests', data);
export const updateGuest = (id, data) => API.put(`/guests/${id}`, data);
export const deleteGuest = (id) => API.delete(`/guests/${id}`);

// Bookings
export const fetchBookings = () => API.get('/bookings');
export const createBooking = (data) => API.post('/bookings', data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const checkInBooking = (id) => API.patch(`/bookings/${id}/check-in`);
export const checkOutBooking = (id) => API.patch(`/bookings/${id}/check-out`);
export const cancelBooking = (id) => API.patch(`/bookings/${id}/cancel`);
export const fetchBookingSummary = (id) => API.get(`/bookings/${id}/summary`);

// System Users
export const fetchSystemUsers = () => API.get('/system-users');
export const createSystemUser = (data) => API.post('/system-users', data);
export const updateSystemUser = (id, data) => API.put(`/system-users/${id}`, data);
export const deleteSystemUser = (id) => API.delete(`/system-users/${id}`);

// Menu Categories
export const fetchMenuCategories = () => API.get('/menu-categories');
export const createMenuCategory = (data) => API.post('/menu-categories', data);
export const updateMenuCategory = (id, data) => API.put(`/menu-categories/${id}`, data);
export const deleteMenuCategory = (id) => API.delete(`/menu-categories/${id}`);

// Menu Items
export const fetchMenuItems = () => API.get('/menu-items');
export const createMenuItem = (data) => API.post('/menu-items', data);
export const updateMenuItem = (id, data) => API.put(`/menu-items/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu-items/${id}`);

// Orders
export const fetchOrders = () => API.get('/orders');
export const createOrder = (data) => API.post('/orders', data);
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => API.delete(`/orders/${id}`);

// Dining Tables
export const fetchDiningTables = () => API.get('/dining-tables');
export const createDiningTable = (data) => API.post('/dining-tables', data);
export const updateDiningTable = (id, data) => API.put(`/dining-tables/${id}`, data);
export const deleteDiningTable = (id) => API.delete(`/dining-tables/${id}`);

// Bookings/Rooms (Active)
export const fetchActiveBookings = () => API.get('/bookings?status=Checked In');

// Staff Management
export const fetchStaff = () => API.get('/staff');
export const createStaff = (data) => API.post('/staff', data);
export const updateStaff = (id, data) => API.put(`/staff/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);

// Attendance
export const fetchAttendance = (params) => API.get('/staff/attendance', { params });
export const markAttendance = (data) => API.post('/staff/attendance', data);

// Shifts
export const fetchShifts = (params) => API.get('/staff/shifts', { params });
export const createShift = (data) => API.post('/staff/shifts', data);
export const updateShiftStatus = (id, status) => API.put(`/staff/shifts/${id}/status`, { status });

// Reports & Analytics
export const fetchOccupancyReport = (params) => API.get('/reports/occupancy', { params });
export const fetchSalesReport = (params) => API.get('/reports/sales', { params });
export const fetchPopularItemsReport = (params) => API.get('/reports/popular-items', { params });
export const fetchRevenueReport = (params) => API.get('/reports/revenue', { params });
export const fetchRevenueTrend = (params) => API.get('/reports/trend', { params });
export const fetchCategorySalesReport = (params) => API.get('/reports/category-sales', { params });

// Banks
export const getBanks = (hotelId) => API.get(`/banks?hotelId=${hotelId}`);
export const createBank = (data) => API.post('/banks', data);
export const updateBank = (id, data) => API.put(`/banks/${id}`, data);
export const deleteBank = (id) => API.delete(`/banks/${id}`);

// Booking Confirmation
export const confirmBooking = (id) => API.patch(`/bookings/${id}/confirm`);

// Inventory Management
export const fetchInventoryItems = (hotelId) => API.get('/inventory/items', { params: { hotelId } });
export const createInventoryItem = (data) => API.post('/inventory/items', data);
export const updateInventoryItem = (id, data) => API.put(`/inventory/items/${id}`, data);
export const deleteInventoryItem = (id) => API.delete(`/inventory/items/${id}`);
export const restockInventoryItem = (id, data) => API.post(`/inventory/items/${id}/restock`, data);
export const fetchInventoryTransactions = (hotelId) => API.get('/inventory/transactions/all', { params: { hotelId } });
export const fetchItemTransactions = (id) => API.get(`/inventory/items/${id}/transactions`);

// Supplier Management
export const fetchSuppliers = (hotelId) => API.get('/inventory/suppliers', { params: { hotelId } });
export const createSupplier = (data) => API.post('/inventory/suppliers', data);
export const updateSupplier = (id, data) => API.put(`/inventory/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/inventory/suppliers/${id}`);

// Unit Management
export const fetchUnits = (hotelId) => API.get('/units', { params: { hotelId } });
export const createUnit = (data) => API.post('/units', data);
export const updateUnit = (id, data) => API.put(`/units/${id}`, data);
export const deleteUnit = (id) => API.delete(`/units/${id}`);

// Activity Logs
export const fetchActivityLogs = (hotelId) => API.get('/activity-logs', { params: { hotelId } });

// Password Reset
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Notifications
export const fetchNotifications = (hotelId) => API.get('/notifications', { params: { hotelId } });
export const triggerReminders = () => API.post('/notifications/trigger-reminders');

// Recipes
export const fetchRecipeIngredients = (menuItemId) => API.get(`/recipes/${menuItemId}`);
export const updateRecipe = (menuItemId, data) => API.post(`/recipes/${menuItemId}`, data);
export const fetchRecipeCost = (menuItemId) => API.get(`/recipes/${menuItemId}/cost`);

export default API;
