import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/MainLayout';
import { getBookingById } from '../../api/bookings';
import { getPayments } from '../../api/payments';
import { createPayment } from '../../api/payments';
import { useParams } from 'react-router-dom';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(0);

  useEffect(() => {
    getBookingById(id).then(async res => {
      setBooking(res.data);
      try {
        const p = await getPayments({ bookingId: id });
        const total = (p.data || []).filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0);
        setPaid(total);
      } catch {}
    });
  }, [id]);

  if (!booking) return <MainLayout><div>Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <h2 style={{ color: '#39ff14' }}>Booking</h2>
      <div>Client: {booking.clientId?.name || booking.clientId || '-'}</div>
      <div>Type: {booking.serviceType}</div>
      <div>Start: {booking.startDate ? new Date(booking.startDate).toLocaleString() : '-'}</div>
      <div>End: {booking.endDate ? new Date(booking.endDate).toLocaleString() : '-'}</div>
      <div>Payment Status: {booking.paymentStatus}</div>
      <div style={{ marginTop: 8, padding: 10, border: '1px solid #333', borderRadius: 8 }}>
        <div>Total Fee: {booking.totalFee || 0}</div>
        <div>Paid: {paid}</div>
        <div>Remaining: {Math.max((booking.totalFee || 0) - paid, 0)}</div>
      </div>
      <h3 style={{ marginTop: 16 }}>Collect Payment</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        try {
          await createPayment({
            clientId: booking.clientId?._id || booking.clientId,
            bookingId: booking._id,
            type: 'income',
            amount: Number(amount),
            method,
            description
          });
          const res = await getBookingById(id);
          setBooking(res.data);
          const p = await getPayments({ bookingId: id });
          const total = (p.data || []).filter(x => x.type === 'income').reduce((s, x) => s + (Number(x.amount) || 0), 0);
          setPaid(total);
          setAmount(''); setMethod(''); setDescription('');
        } catch (err) {
          setError('Failed to collect payment');
        }
      }} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" style={{ maxWidth: 120 }} />
        <input value={method} onChange={e => setMethod(e.target.value)} placeholder="Method" style={{ maxWidth: 160 }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ flex: 1 }} />
        <button className="btn btn-primary" type="submit">Add Payment</button>
      </form>
    </MainLayout>
  );
}
