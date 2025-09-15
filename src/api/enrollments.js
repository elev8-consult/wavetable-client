import api from './axios';

export const createEnrollment = (data) => api.post('/enrollments', data);
export const getEnrollments = (params) => api.get('/enrollments', { params });
export const getEnrollmentById = (id) => api.get(`/enrollments/${id}`);
export const updateEnrollment = (id, data) => api.put(`/enrollments/${id}`, data);
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`);
