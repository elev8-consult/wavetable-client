import api from './axios';

export const createPayment = (data) => api.post('/payments', data);
export const getPayments = (params) => api.get('/payments', { params });
export const getPaymentSummaries = (params) => api.get('/payments/summary', { params });
export const getPaymentById = (id) => api.get(`/payments/${id}`);
export const updatePayment = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
