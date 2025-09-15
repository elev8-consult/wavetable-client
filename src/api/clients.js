import api from './axios';

export const createClient = (data) => api.post('/clients', data);
export const getClients = (params) => api.get('/clients', { params });
export const getClientById = (id) => api.get(`/clients/${id}`);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
