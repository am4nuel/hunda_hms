export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  hotels: {
    base: '/hotels',
    details: (id) => `/hotels/${id}`,
  },
  rooms: {
    base: '/rooms',
    types: '/room-types',
  },
  bookings: {
    base: '/bookings',
    active: '/bookings?status=Checked In',
  },
};

export default endpoints;
