import api from './axios';

export const getEvents = (params) => api.get('/calendar/events', { params });
export const syncCalendar = () => api.post('/calendar/sync');
