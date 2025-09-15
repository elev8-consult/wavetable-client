import api from './axios';

export const addEquipment = (data) => api.post('/equipment', data);
export const getEquipment = (params) => api.get('/equipment', { params });
export const getEquipmentById = (id) => api.get(`/equipment/${id}`);
export const updateEquipment = (id, data) => api.put(`/equipment/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);
