import api from './axios';

export const createAttendance = (data) => api.post('/attendance', data);
export const getAttendance = (params) => api.get('/attendance', { params });
export const getAttendanceById = (id) => api.get(`/attendance/${id}`);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);
export const bulkMarkSessionPresent = (data) => api.post('/attendance/bulk/mark-present', data);
