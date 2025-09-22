import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/MainLayout';
import { getAttendanceById } from '../../api/attendance';
import { useParams } from 'react-router-dom';

export default function AttendanceDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAttendanceById(id)
      .then(res => setItem(res.data))
      .catch(() => setError('Failed to load attendance'));
  }, [id]);

  if (error) return <MainLayout><div style={{ color: 'red' }}>{error}</div></MainLayout>;
  if (!item) return <MainLayout><div>Loading...</div></MainLayout>;

  const booking = item.bookingId;
  const bookingLink = booking ? `/bookings/${booking._id || booking}` : null;
  const bookingLabel = booking ? (() => {
    const parts = [];
    if (booking.serviceCode) parts.push(booking.serviceCode.replace(/_/g, ' '));
    if (booking.serviceType && !parts.length) parts.push(booking.serviceType);
    if (booking.startDate) parts.push(new Date(booking.startDate).toLocaleString());
    return parts.join(' • ') || (booking._id || booking);
  })() : null;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Attendance</h2>
      <div>Client: {item.clientId?.name || item.clientId || '-'}</div>
      <div>Booking: {bookingLink ? <Link to={bookingLink}>{bookingLabel}</Link> : '-'}</div>
      <div>Session: {item.sessionDate ? new Date(item.sessionDate).toLocaleString() : '-'}</div>
      <div>Status: {item.status || '-'}</div>
      <div>Notes: {item.notes || '—'}</div>
    </MainLayout>
  );
}
