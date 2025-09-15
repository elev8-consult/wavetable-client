import api from './axios';

export const createBooking = (data) => api.post('/bookings', data);
export const getBookings = (params) => api.get('/bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);
export const returnEquipment = (id) => api.post(`/bookings/${id}/return`);
export const checkAvailability = (params) => api.get('/bookings/availability', { params });
