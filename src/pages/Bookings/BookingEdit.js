import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getBookingById, updateBooking } from '../../api/bookings';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookingEdit() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getBookingById(id).then(res => setBooking(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateBooking(id, booking);
    navigate('/bookings');
  };

  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (!booking) return <MainLayout><div>Not found</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Edit Booking</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input value={booking.serviceType || ''} onChange={e => setBooking({ ...booking, serviceType: e.target.value })} />
        <input type="datetime-local" value={booking.startDate ? new Date(booking.startDate).toISOString().slice(0,16) : ''} onChange={e => setBooking({ ...booking, startDate: e.target.value })} />
        <input type="datetime-local" value={booking.endDate ? new Date(booking.endDate).toISOString().slice(0,16) : ''} onChange={e => setBooking({ ...booking, endDate: e.target.value })} />
        <button type="submit">Save</button>
      </form>
    </MainLayout>
  );
}
