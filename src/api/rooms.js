import api from './axios';

export const addRoom = (data) => api.post('/rooms', data);
export const getRooms = (params) => api.get('/rooms', { params });
export const getRoomById = (id) => api.get(`/rooms/${id}`);
export const updateRoom = (id, data) => api.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/rooms/${id}`);
